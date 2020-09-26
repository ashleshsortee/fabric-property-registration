'use strict';

class User {
  /**
   * Constructor function
    * @param userObj
  */
  constructor(userObj) {
    this.key = User.createKey([userObj.name, userObj.aadharId]);
    Object.assign(this, userObj);
  }

  /**
    * Create a new instance of this model
    * @returns {User}
    * @param userObj {Object}
    */
  static createInstance(userObj) {
    return new User(userObj);
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
    return new User(json);
  }
}

module.exports = User;