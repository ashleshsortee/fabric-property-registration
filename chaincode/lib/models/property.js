'use strict';


class Property {
  /**`
    * Constructor function
    * @param propertyObj
    */
  constructor(propertyObj) {
    this.key = Property.createKey([propertyObj.propertyId, propertyObj.name, propertyObj.aadharId]);
    Object.assign(this, propertyObj);
  }

  /**
    * Create a new instance of this model
    * @returns {Property}
    * @param propertyObj {Object}
    */
  static createInstance(propertyObj) {
    return new Property(propertyObj);
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
    return new Property(json);
  }
}

module.exports = Property;