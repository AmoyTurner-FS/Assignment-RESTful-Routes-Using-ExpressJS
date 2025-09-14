class ContactResourceError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ContactResourceError"
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ContactResourceError.prototype);
  }
}

class ContactNotFoundError extends ContactResourceError {
  constructor(message) {
    super(404, message)
    this.name = "ContactNotFoundError"
  }
}

class NoContactsFoundError extends ContactResourceError {
  constructor(message) {
    super(200, message)
    this.name = "NoContactsFoundError"
  }
}

class DuplicateContactResourceError extends ContactResourceError {
  constructor(message) {
    super(409, message)
    this.name = "DuplicateContactResourceError"
  }
}

class InvalidContactResourceError extends ContactResourceError {
  constructor(message) {
    super(400, message)
    this.name = "InvalidContactResourceError"
  }
}

class InvalidContactFieldError extends ContactResourceError {
  constructor(message) {
    super(422, message)
    this.name = "InvalidContactFieldError"
  }
}

class BlankContactFieldError extends InvalidContactFieldError {
  constructor(message) {
    super(422, message)
    this.name = "BlankContactFieldError"
  }
}

class InvalidContactSchemaError extends ContactResourceError {
  constructor(message) {
    super(400, message)
    this.name = "InvalidContactSchemaError"
  }
}

module.exports = {
  InvalidContactFieldError,
  InvalidContactSchemaError,
  BlankContactFieldError,
  ContactNotFoundError,
  NoContactsFoundError,
  DuplicateContactResourceError,
  InvalidContactResourceError
}
