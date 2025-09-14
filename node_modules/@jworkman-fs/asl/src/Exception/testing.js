class ResourceTestingError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode
    this.name = "ResourceTestingError"
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ResourceTestingError.prototype);
  }
}

class ServerUnreachableError extends ResourceTestingError {
  constructor(message) {
    super(400, message)
    this.name = "ServerUnreachableError"
  }
}

class ResourceImplementationError extends ResourceTestingError {
  constructor(message) {
    super(400, message)
    this.name = "ResourceImplementationError"
  }
}

class ResourceUnreachableError extends ResourceTestingError {
  constructor(message) {
    super(400, message)
    this.name = "ServerUnreachableError"
  }
}

module.exports = {
  ResourceTestingError,
  ServerUnreachableError,
  ResourceImplementationError,
  ResourceUnreachableError
}
