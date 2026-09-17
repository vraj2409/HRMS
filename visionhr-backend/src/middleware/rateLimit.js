import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/apiResponse.js';
import { HTTP } from '../constants/index.js';

/**
 * rateLimit.js
 * Brute-force protection for the login endpoint.
 * 10 attempts per 15 minutes per IP — generous enough for real users,
 * tight enough to slow down credential-stuffing attempts.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      HTTP.TOO_MANY_REQUESTS || 429,
      'Too many login attempts. Please try again in a few minutes.'
    );
  },
});
