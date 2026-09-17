import { verifyAccessToken } from '../utils/tokens.js';
import User from '../models/User.js';
import { sendError } from '../utils/apiResponse.js';
import { HTTP } from '../constants/index.js';

/**
 * authenticate.js
 * Extracts the JWT access token from the Authorization header,
 * verifies its cryptographic signature, and attaches the decoded
 * user payload to req.user for downstream middleware.
 */
const authenticate = async (req, res, next) => {
  try {
    // Extract token from "Authorization: Bearer <token>" header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, HTTP.UNAUTHORIZED, 'Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];

    // Verify signature and expiry
    const decoded = verifyAccessToken(token);

    // Fetch fresh user record to check isActive and password changes
    const user = await User.findById(decoded.id).select('+passwordChangedAt');
    if (!user) {
      return sendError(res, HTTP.UNAUTHORIZED, 'The user belonging to this token no longer exists.');
    }

    if (!user.isActive) {
      return sendError(res, HTTP.UNAUTHORIZED, 'Your account has been deactivated. Contact HR.');
    }

    // Check if password was changed after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return sendError(res, HTTP.UNAUTHORIZED, 'Password was recently changed. Please log in again.');
    }

    // Attach decoded user data + DB role to request
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, HTTP.UNAUTHORIZED, 'Session expired. Please log in again.');
    }
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, HTTP.UNAUTHORIZED, 'Invalid token. Please log in again.');
    }
    next(error);
  }
};

export default authenticate;
