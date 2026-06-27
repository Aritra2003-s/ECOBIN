// Custom error class that carries an HTTP status code.
// Controllers throw this; the error middleware catches it.

class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;       // Validation error details array
    this.isOperational = true;  // Distinguishes from unexpected crashes
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;