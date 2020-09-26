'use strict';

const User = require('../models/user');

class UserList {
  constructor(ctx) {
    this.ctx = ctx;
    this.name = 'org.property-registration-network.regnet.lists.user';
  }

  /**
   * Adds a user model to the ledger
   * @param requestObj
   * @returns {Promise<User>}
   */
  async addUser(requestObj) {
    const requestCompositeKey = this.ctx.stub.createCompositeKey(this.name, requestObj.getKeyArray());
    const requestBuffer = requestObj.toBuffer();
    await this.ctx.stub.putState(requestCompositeKey, requestBuffer);
  }

  /**
    * Returns the user model stored in ledger identified by this key
    * @param userKey
    * @returns {Promise<Request>}
    */
  async getUser(userKey) {
    const userCompositeKey = this.ctx.stub.createCompositeKey(this.name, userKey.split(':'));
    const userBuffer = await this.ctx.stub.getState(userCompositeKey);

    return User.fromBuffer(userBuffer);
  }

}

module.exports = UserList;
