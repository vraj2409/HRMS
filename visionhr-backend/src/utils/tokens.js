import jwt from 'jsonwebtoken';

// -------------------------------------------
// Generate a short-lived ACCESS token (15 min)
// -------------------------------------------
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });
};

// -------------------------------------------
// Generate a long-lived REFRESH token (7 days)
// -------------------------------------------
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
};

// -------------------------------------------
// Verify ACCESS token
// -------------------------------------------
export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
};

// -------------------------------------------
// Verify REFRESH token
// -------------------------------------------
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

// -------------------------------------------
// Attach refresh token as secure HttpOnly cookie
// -------------------------------------------
export const attachRefreshCookie = (res, token) => {
  res.cookie('visionhr_refresh', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/api/v1/auth',             // Restrict cookie to auth routes only
  });
};

// -------------------------------------------
// Clear the refresh cookie on logout
// -------------------------------------------
export const clearRefreshCookie = (res) => {
  res.clearCookie('visionhr_refresh', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
    path: '/api/v1/auth',
  });
};
