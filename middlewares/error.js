/* eslint-disable max-classes-per-file */
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
  }

  send(message) {
    this.send.message(message, this.statusCode);
  }
}

class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 403;
  }

  send(message) {
    this.send.message(message, this.statusCode);
  }
}

class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }

  send(message) {
    this.send.message(message, this.statusCode);
  }
}

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 409;
  }

  send(message) {
    this.send.message(message, this.statusCode);
  }
}

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 401;
  }

  send(message) {
    this.send.message(message, this.statusCode);
  }
}

module.exports = {
  NotFoundError, ForbiddenError, UnauthorizedError, BadRequestError, ConflictError,
};
