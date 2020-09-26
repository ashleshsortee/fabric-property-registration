'use strict';

const Request = require('../models/request');
const { iterateResult } = require('../utils');

class RequestList {
  constructor(ctx) {
    this.ctx = ctx;
    this.name = 'org.property-registration-network.regnet.lists.request';
  }

  /**
   * Adds a request model to the ledger
   * @param requestObj
   * @returns {Promise<Request>}
   */
  async addUserRequest(requestObj) {
    const requestCompositeKey = this.ctx.stub.createCompositeKey(this.name, requestObj.getKeyArray());
    console.log('console requestObj', requestCompositeKey)
    const requestBuffer = requestObj.toBuffer();
    await this.ctx.stub.putState(requestCompositeKey, requestBuffer);
  }

  /**
   * Deletes the request model from the ledger
   * @param requestObj
   * @returns {Promise<Request>}
   */
  async deleteProperty(requestObj) {
    const requestCompositeKey = this.ctx.stub.createCompositeKey(this.name, requestObj.getKeyArray());
    await this.ctx.stub.deleteState(requestCompositeKey);
  }

  /**
   * Returns the request model stored in ledger identified by this key
   * @param userKey
   * @returns {Promise<Request>}
   */
  async getUserRequest(userKey) {
    const userCompositeKey = this.ctx.stub.createCompositeKey(this.name, userKey.split(':'));
    const userBuffer = await this.ctx.stub.getState(userCompositeKey);

    return Request.fromBuffer(userBuffer);
  }

  /**
    * Returns the request model stored in blockchain identified by the partial key
    * @param requestKey
    * @returns {Promise<Request>}
    */
  async getPropertyReqByPartialCompositeKey(requestKey) {
    try {
      const propertyIterator = await this.ctx.stub.getStateByPartialCompositeKey(this.name, requestKey.split(':'));
      const propertyBuffer = await iterateResult(propertyIterator);

      return Request.fromBuffer(propertyBuffer);
    } catch (err) {
      throw new Error(err);
    }
  }
}

module.exports = RequestList;
