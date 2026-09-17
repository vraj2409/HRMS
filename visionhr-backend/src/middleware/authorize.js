import { sendError } from '../utils/apiResponse.js';
import { HTTP } from '../constants/index.js';

/**
 * authorize.js
 * Role-Based Access Control (RBAC) gatekeeper.
 * Usage: router.get('/route', authenticate, authorize('HR', 'SuperAdmin'), controller)
 *
 * Accepts one or more allowed role strings.
 * Returns 403 Forbidden if the authenticated user's role is not in the list.
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, HTTP.UNAUTHORIZED, 'Authentication required.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        HTTP.FORBIDDEN,
        `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}.`
      );
    }

    next();
  };
};

export default authorize;
