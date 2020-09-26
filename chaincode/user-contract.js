'use strict';

const { Contract, Context } = require('fabric-contract-api');
const Request = require('./lib/models/request');
const User = require('./lib/models/user');
const Property = require('./lib/models/property');
const RequestList = require('./lib/lists/request-list');
const UserList = require('./lib/lists/user-list');
const PropertyList = require('./lib/lists/property-list');
const { validateUserInitiator } = require('./lib/utils');

class PropnetContext extends Context {
  constructor() {
    super();
    this.requestList = new RequestList(this);
    this.userList = new UserList(this);
    this.propertyList = new PropertyList(this);
  }
}

class UserContract extends Contract {
  constructor() {
    // A custom name to refer to this smart contract
    super('org.property-registration-network.regnet.user');
  }

  // Built in method used to build and return the context for this smart contract on every transaction invoke
  createContext() {
    return new PropnetContext();
  }

  // A basic user defined function used at the time of instantiating the smart contract
  async instantiate(ctx) {
    console.log('User Smart Contract Instantiated');
  }

  /**
   * Create a new user request
   * @param ctx - The transaction context object
   * @param name - Name of the user
   * @param emailId - EmailId of the user
   * @param phoneNumber - Phone number of the user
   * @param aadharId - AadharId of the user
   * @returns {Object}
   */
  async requestNewUser(ctx, name, emailId, phoneNumber, aadharId) {
    // Validate the initiator
    validateUserInitiator(ctx);

    // Validate if the request already exists
    const userReqKey = Request.createKey([name, aadharId]);
    const existingUserReq = await ctx.requestList
      .getUserRequest(userReqKey)
      .catch(() => console.log('User`s request doesn`t exists. Creating new user request record ...'));

    if (existingUserReq)
      throw new Error('Failed to create request for this user as this user`s request already exists');

    const userReqObj = {
      name,
      emailId,
      phoneNumber,
      aadharId,
      createdAt: new Date(),
    };

    // Create a new instance of request model and save it to ledger
    const newUserReqObj = Request.createInstance(userReqObj);
    await ctx.requestList.addUserRequest(newUserReqObj);
    return newUserReqObj;
  }

  /**
   * Recharge user account
   * @param ctx - The transaction context object
   * @param name - Name of the user
   * @param aadharId - AadharId of the user
   * @param txnId - Bank transaction id
   * @returns {Object}
   */
  async rechargeAccount(ctx, name, aadharId, txnId) {
    validateUserInitiator(ctx);

    const userKey = Request.createKey([name, aadharId]);
    let rechargeAmmount;

    // Validate whether user is registered
    const existingUserObj = await ctx.userList
      .getUser(userKey)
      .catch(() => { throw new Error('Failed to recharge account for the user. User doesn`t exists.') });

    // Recharge amount based on txn id
    switch (txnId) {
      case 'txn100':
        rechargeAmmount = 100;
        break;
      case 'txn500':
        rechargeAmmount = 500;
        break;
      case 'txn1000':
        rechargeAmmount = 1000;
        break;
      default:
        throw new Error('Invalid Bank Transaction ID');
    }

    existingUserObj.propCoins += rechargeAmmount;

    // Create a new instance of user model and update the asset on the ledger
    const updatedUserObj = User.createInstance(existingUserObj);
    await ctx.userList.addUser(updatedUserObj);

    return updatedUserObj;
  }

  /**
   * View registered user details
   * @param ctx - The transaction context object
   * @param name - Name of the user
   * @param aadharId - AadharId of the user
   * @returns {Object}
   */
  async viewUser(ctx, name, aadharId) {
    validateUserInitiator(ctx);

    const userKey = User.createKey([name, aadharId]);

    // Validate whether user is registered
    const userObj = await ctx.userList
      .getUser(userKey)
      .catch(err => { throw new Error('Failed to fetch user. User does not exists', err) });

    return userObj;
  }

  /**
   * New property registration request
   * @param ctx - The transaction context object
   * @param name - Name of the user
   * @param aadharId - AadharId of the user
   * @param propertyId - Property id of the property registered
   * @param price - Price for the property
   * @returns {Object}
   */
  async propertyRegistrationRequest(ctx, name, aadharId, propertyId, price) {
    validateUserInitiator(ctx);

    const propertyReqKey = Request.createKey([propertyId, name, aadharId]);

    // Validate whether same request already exists
    const existingPropertyReq = await ctx.requestList
      .getUserRequest(propertyReqKey)
      .catch(() => console.log('Creating property registration request...'));

    if (existingPropertyReq)
      throw new Error('Property request already exists');

    // Validate whether user is registered on the network
    await this.viewUser(ctx, name, aadharId);

    const regReqObj = {
      name,
      aadharId,
      owner: propertyReqKey,
      propertyId,
      price: parseInt(price),
      status: null,
    };

    // Create a new instance of request model and add the request asset to the ledger
    const propertyReqObj = Request.createInstance(regReqObj);
    await ctx.requestList.addUserRequest(propertyReqObj);

    return propertyReqObj;
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
    validateUserInitiator(ctx);

    const userKey = Request.createKey([propertyId, name, aadharId]);

    // Fetch the property asset from the ledger
    const userObj = await ctx.requestList
      .getUserRequest(userKey)
      .catch(err => { throw new Error('Failed to fetch property request. Request does not exists', err) });

    return userObj;
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
    validateUserInitiator(ctx);

    const propertyKey = Property.createKey([propertyId, name, aadharId]);

    // Fetch the existing proprty asset for the user
    const propertyObj = await ctx.propertyList
      .getProperty(propertyKey)
      .catch(err => { throw new Error('Failed to fetch property. Property does not exist for the user', err) });

    return propertyObj;
  }

  /**
    * Update property status 
    * @param ctx - The transaction context object
    * @param name - Name of the user
    * @param aadharId - AadharId of the user
    * @param propertyId - Property id of the property registered
    * @param status - Status of the property
    * @returns {Object}
    */
  async updatePropertyStatus(ctx, name, aadharId, propertyId, status) {
    validateUserInitiator(ctx);

    // Fetch the registered property asset for the user
    const propertyObj = await this.viewProperty(ctx, name, aadharId, propertyId);
    const { owner } = propertyObj;
    const expectedOwner = `"${propertyId}":"${name}":"${aadharId}"`;

    // Validate whether the requested user is the owner of the property
    if (owner !== expectedOwner)
      throw new Error('Access Denied! Requestor is not the owner of the property.');

    // Create a new instance of property model and update the status of the property asset on the ledger
    const updatedPropertyObj = Property.createInstance(Object.assign(propertyObj, { status }));
    await ctx.propertyList.addProperty(updatedPropertyObj);

    return updatedPropertyObj;
  }

  /**
    * Update property status 
    * @param ctx - The transaction context object
    * @param propertyId - Property id of the property registered
    * @param buyerName - Name of the user
    * @param buyerAadharId - AadharId of the user
    * @returns {Object}
    */
  async purchaseProperty(ctx, propertyId, buyerName, buyerAadharId) {
    try {
      validateUserInitiator(ctx);

      const propertyKey = Property.createKey([propertyId]);
      // Fetch the buyer's registered details
      const buyerObj = await this.viewUser(ctx, buyerName, buyerAadharId);
      const { propCoins: buyerBalance } = buyerObj;

      // Fetch the requested property asset 
      const propertyObj = await ctx.propertyList
        .getPropertyByPartialCompositeKey(propertyKey)
        .catch(err => { throw new Error('Requested property does not exists', err) });

      // Get the property and seller details
      const { status, price: propertyPrice, name: sellerName, aadharId: sellerAadharId } = propertyObj;
      const sellerObj = await this.viewUser(ctx, sellerName, sellerAadharId);
      const { propCoins: sellerBalance } = sellerObj;

      // Validate whether the property is on sale
      if (status != 'onSale')
        throw new Error('Property is not listed for sale.');

      // Validate whether the buyer has sufficient balance to transact
      if (buyerBalance < propertyPrice)
        throw new Error('Insufficient balance for the transaction');

      // Debit buyer, credit seller and update the user details on the ledger
      const updatedBuyerObj = Object.assign({}, buyerObj, { propCoins: (buyerBalance - propertyPrice) });
      const updatedSellerObj = Object.assign({}, sellerObj, { propCoins: sellerBalance + propertyPrice });
      const buyerInstance = User.createInstance(updatedBuyerObj);
      const sellerInstance = User.createInstance(updatedSellerObj);
      await ctx.userList.addUser(buyerInstance);
      await ctx.userList.addUser(sellerInstance);

      //Update the property under buyer's name and change it to registered
      const updatedPropertyKey = Property.createKey([propertyId, buyerName, buyerAadharId]);
      const updatedPropertyObj = Object.assign(
        {},
        propertyObj,
        { key: updatedPropertyKey, name: buyerName, aadharId: buyerAadharId, owner: updatedPropertyKey, status: 'registered' },
      );

      // Delete the existing property under seller's name and add the property under buyer's name
      const deletePropertyInstance = Property.createInstance(propertyObj);
      const updatePropertyInstance = Property.createInstance(updatedPropertyObj);
      await ctx.propertyList.deleteProperty(deletePropertyInstance);
      await ctx.propertyList.addProperty(updatePropertyInstance);

      return updatePropertyInstance;
    } catch (err) {
      console.log('Property purchase failed');
      throw err;
    }
  }
}

module.exports = UserContract;