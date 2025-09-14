class PagerError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode
    this.name = "PagerError"
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, PagerError.prototype);
  }
}

class PagerNoResultsError extends PagerError {
  constructor(message) {
    super(200, message)
    this.name = "PagerNoResultsError"
  }
}

class PagerOutOfRangeError extends PagerError {
  constructor(message) {
    super(416, message)
    this.name = "PagerOutOfRangeError"
  }
}

module.exports = {
  PagerError,
  PagerNoResultsError,
  PagerOutOfRangeError
}
