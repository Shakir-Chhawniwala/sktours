class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.message = message;
    this.status = `${statusCode.startsWith('4')}`;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
