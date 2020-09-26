'use strict';

class Request {
  /**
    * Constructor function
    * @param requestObj
    */
  constructor(requestObj) {
    // Dynamically generate key based on propertyId peresnt in the object. 
    const keyArr = requestObj.propertyId ?
      [requestObj.propertyId, requestObj.name, requestObj.aadharId] : [requestObj.name, requestObj.aadharId];

    this.key = Request.createKey(keyArr);
    Object.assign(this, requestObj);
  }

  /**
    * Create a new instance of this model
    * @returns {Request}
    * @param requestObj {Object}
    */
  static createInstance(requestObj) {
    return new Request(requestObj);
  }

  /**
   * Create a key string joined from different key parts
   * @param keyChunks {Array}
   * @returns {*}
   */
  static createKey(keyChunks) {
    return keyChunks.map(chunk => JSON.stringify(chunk)).join(':');
  }

  /**
   * Create an array of key parts for this model instance
   * @returns {Array}
   */
  getKeyArray() {
    console.log('ashlesh', this.key);
    return this.key.split(":");
  }

  /**
   * Convert the object of this model to a buffer stream
   * @returns {Buffer}
   */
  toBuffer() {
    return Buffer.from(JSON.stringify(this));
  }

  /**
   * Convert the buffer stream received from blockchain into an object of this model
   * @param buffer {Buffer}
   */
  static fromBuffer(buffer) {
    const json = JSON.parse(buffer.toString());
    return new Request(json);
  }
}

module.exports = Request;