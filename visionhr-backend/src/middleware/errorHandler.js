/**
 * VisionHR — Centralized Error Handler
 * Catches all errors forwarded via next(error) and formats them
 * into the standard API response envelope.
 */

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected server error occurred.';

  // Log the error in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`\n❌ [${req.method}] ${req.originalUrl}`);
    console.error(err.stack);
  }

  // ---- Mongoose Specific Errors ----

  // Duplicate key violation (e.g., unique email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    message = `A record with this ${field} already exists.`;
    statusCode = 409;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).reduce((acc, e) => {
      acc[e.path] = e.message;
      return acc;
    }, {});
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors,
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    message = `Invalid value for field: ${err.path}.`;
    statusCode = 400;
  }

  // JWT errors (should be caught in authenticate, but as fallback)
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid authentication token.';
    statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Authentication token has expired.';
    statusCode = 401;
  }

  // Generic response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
