'use strict';

const { Contract, Context } = require('fabric-contract-api');
const Request = require('./lib/models/request');
const User = require('./lib/models/user');
const Property = require('./lib/models/property');
const RequestList = require('./lib/lists/request-list');
const UserList = require('./lib/lists/user-list');
const PropertyList = require('./lib/lists/property-list');
const { validateRegistrarInitiator } = require('./lib/utils');

class PropnetContext extends Context {
  constructor() {
    super();
    this.requestList = new RequestList(this);
    this.userList = new UserList(this);
    this.propertyList = new PropertyList(this);
  }
}

class RegistrarContract extends Contract {
  constructor() {
    // A custom name to refer to this smart contract
    super('org.property-registration-network.regnet.registrar');
  }

  // Built in method used to build and return the context for this smart contract on every transaction invoke
  createContext() {
    return new PropnetContext();
  }

  // A basic user defined function used at the time of instantiating the smart contract
  async instantiate(ctx) {
    console.log('Registar Smart Contract Instantiated');
  }

  /**
   * View user's property request
   * @param ctx - The transaction context object
   * @param name - Name of the user
   * @param aadharId - AadharId of the user
   * @returns {Object}
   */
  async approveNewUser(ctx, name, aadharId) {
    validateRegistrarInitiator(ctx);

    const userKey = User.createKey([name, aadharId]);

    // Check if the user asset already present in the user ledger
    const existingUserObj = await ctx.userList
      .getUser(userKey)
      .catch(() => console.log('User doesn`t exists. Creating new user record ...'));

    if (existingUserObj)
      throw new Error('This user asset already exists in ledger');

    // Check if user's request is present in request ledger
    const userReqObj = await ctx.requestList
      .getUserRequest(userKey)
      .catch(err => { throw new Error('User request asset is not present in the ledger', err) });

    // Create a new instance of user model and add the user asset to the ledger
    const userObj = User.createInstance(Object.assign(userReqObj, { propCoins: 0, createdAt: new Date() }));
    await ctx.userList
      .addUser(userObj)
      .then(async () => {
        // Delete user's request 
        const deleteRequestInstance = Property.createInstance(userReqObj);
        await ctx.requestList.deleteProperty(deleteRequestInstance);
      });

    return userObj;
  }

  /**
   * View registered user details
   * @param ctx - The transaction context object
   * @param name - Name of the user
   * @param aadharId - AadharId of the user
   * @returns {Object}
   */
  async viewUser(ctx, name, aadharId) {
    validateRegistrarInitiator(ctx);

    const userKey = User.createKey([name, aadharId]);

    // Fetch the registered user from the ledger
    const userObj = await ctx.userList
      .getUser(userKey)
      .catch(err => { throw new Error('Failed to fetch user. User does not exists', err) });

    return userObj;
  }

  /**
   * View user's property request
   * @param ctx - The transaction context object
   * @param name - Name of the user
   * @param aadharId - AadharId of the user
   * @param propertyId - Property id of the property registered
   * @returns {Object}
   */
  async viewPropertyRequest(ctx, name, aadharId, propertyId) {
    validateRegistrarInitiator(ctx);

    const userKey = Request.createKey([propertyId, name, aadharId]);

    // Fetch the property asset from the ledger
    const userObj = await ctx.requestList
      .getUserRequest(userKey)
      .catch(err => { throw new Error('Failed to fetch property request. Request does not exists', err) });

    return userObj;
  }

  /**
   * Approve user's property request
   * @param ctx - The transaction context object
   * @param propertyId - Property id of the property
   * @returns {Object}
   */
  async approvePropertyRegistration(ctx, propertyId) {
    validateRegistrarInitiator(ctx);

    const propertyReqKey = Request.createKey([propertyId]);

    // Fetch the property request from the ledger
    const propertyReq = await ctx.requestList
      .getPropertyReqByPartialCompositeKey(propertyReqKey)
      .catch(err => { throw new Error('Property request does not exists', err) });

    const { name, aadharId } = propertyReq;
    const propertyKey = Property.createKey([propertyId, name, aadharId]);

    // Validate whether same property already exists
    const existingProperty = await ctx.propertyList
      .getProperty(propertyKey)
      .catch(() => console.log('Approving new property...'));

    if (existingProperty)
      throw new Error('Property already exists.');

    // Create a new instance of property model and add the property asset to the ledger with status as registered
    const propertyObj = Property.createInstance(Object.assign(propertyReq, { status: 'registered' }));
    await ctx.propertyList
      .addProperty(propertyObj)
      .then(async () => {
        // Delete property request
        const deletePropertyInstance = Property.createInstance(propertyReq);
        await ctx.requestList.deleteProperty(deletePropertyInstance);
      });

    return propertyObj;
  }

  /**
    * View user's property 
    * @param ctx - The transaction context object
    * @param name - Name of the user
    * @param aadharId - AadharId of the user
    * @param propertyId - Property id of the property registered
    * @returns {Object}
    */
  async viewProperty(ctx, name, aadharId, propertyId) {
    validateRegistrarInitiator(ctx);

    const propertyKey = Property.createKey([propertyId, name, aadharId]);

    // Fetch the requested property from the ledger
    const propertyObj = await ctx.propertyList
      .getProperty(propertyKey)
      .catch(err => { throw new Error('Failed to fetch property. Property does not exists', err) });

    return propertyObj;
  }
}

module.exports = RegistrarContract;