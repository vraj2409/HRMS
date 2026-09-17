import User from '../models/User.js';
import Employee from '../models/Employee.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  attachRefreshCookie,
  clearRefreshCookie,
} from '../utils/tokens.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { HTTP } from '../constants/index.js';

// -----------------------------------------------
// POST /api/v1/auth/login
// -----------------------------------------------
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.validatedBody;

    // Fetch user with password (excluded by default via schema `select: false`)
    const user = await User.findOne({ email }).select('+password +refreshToken');

    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, HTTP.UNAUTHORIZED, 'Invalid email or password.');
    }

    if (!user.isActive) {
      return sendError(res, HTTP.UNAUTHORIZED, 'Your account has been deactivated. Please contact HR.');
    }

    // Fetch linked employee profile
    const employee = await Employee.findOne({ userId: user._id })
      .populate('organization.department', 'name code')
      .populate('organization.reportingManager', 'personalDetails.firstName personalDetails.lastName employeeCode');

    // Build JWT payloads
    const tokenPayload = { id: user._id, email: user.email, role: user.role };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Persist refresh token hash to DB for revocation capability
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Set refresh token in HttpOnly cookie
    attachRefreshCookie(res, refreshToken);

    return sendSuccess(res, HTTP.OK, 'Login successful.', {
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        employeeCode: employee?.employeeCode,
        fullName: employee?.fullName,
        department: employee?.organization?.department,
        designation: employee?.organization?.designation,
        avatarS3Key: employee?.avatarS3Key,
      },
    });
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------
// POST /api/v1/auth/refresh
// -----------------------------------------------
export const refreshAccessToken = async (req, res, next) => {
  try {
    const token = req.cookies?.visionhr_refresh;

    if (!token) {
      return sendError(res, HTTP.UNAUTHORIZED, 'No refresh token found. Please log in.');
    }

    // Verify token signature
    const decoded = verifyRefreshToken(token);

    // Confirm token still exists in DB (revocation check)
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      clearRefreshCookie(res);
      return sendError(res, HTTP.UNAUTHORIZED, 'Refresh token is invalid or has been revoked. Please log in again.');
    }

    if (!user.isActive) {
      return sendError(res, HTTP.UNAUTHORIZED, 'Account is deactivated.');
    }

    // Issue new access token
    const accessToken = generateAccessToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    return sendSuccess(res, HTTP.OK, 'Token refreshed.', { accessToken });
  } catch (err) {
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
      clearRefreshCookie(res);
      return sendError(res, HTTP.UNAUTHORIZED, 'Refresh token invalid or expired. Please log in again.');
    }
    next(err);
  }
};

// -----------------------------------------------
// POST /api/v1/auth/logout
// -----------------------------------------------
export const logout = async (req, res, next) => {
  try {
    // Invalidate the refresh token in the database
    await User.findByIdAndUpdate(req.user.id, { refreshToken: null }, { validateBeforeSave: false });

    // Clear the cookie from the client
    clearRefreshCookie(res);

    return sendSuccess(res, HTTP.OK, 'Logged out successfully.');
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------
// GET /api/v1/auth/me
// -----------------------------------------------
export const getMe = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id })
      .populate('organization.department', 'name code')
      .populate('organization.reportingManager', 'personalDetails employeeCode');

    if (!employee) {
      return sendError(res, HTTP.NOT_FOUND, 'Employee profile not found.');
    }

    return sendSuccess(res, HTTP.OK, 'Profile fetched.', {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      employee,
    });
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------
// PATCH /api/v1/auth/change-password
// -----------------------------------------------
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.validatedBody;

    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return sendError(res, HTTP.BAD_REQUEST, 'Current password is incorrect.');
    }

    user.password = newPassword;
    await user.save();

    // Invalidate existing refresh tokens to force re-login on all devices
    clearRefreshCookie(res);

    return sendSuccess(res, HTTP.OK, 'Password changed successfully. Please log in again.');
  } catch (err) {
    next(err);
  }
};
