class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError"
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ContactResourceError.prototype);
  }
}

class InvalidEnumError extends ApiError {
  constructor(message) {
    super(400, message)
    this.name = "InvalidEnumError"
  }
}

class InvalidOperatorError extends ApiError {
  constructor(message) {
    super(400, message)
    this.name = "InvalidOperatorError"
  }
}

const allContactErrors = require('./contact.js')
const allPagerErrors = require('./pager.js')
const allTestingErrors = require('./testing.js')

module.exports = { 
  ...allContactErrors,
  ...allPagerErrors,
  ...allTestingErrors,
  InvalidOperatorError,
  InvalidEnumError,
  ApiError
}
