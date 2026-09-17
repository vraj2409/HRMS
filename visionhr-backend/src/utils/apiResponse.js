/**
 * VisionHR — Standardized API Response Helpers
 * Ensures every response follows the same envelope shape:
 * { success, message, data?, pagination? }
 */

export const sendSuccess = (res, statusCode, message, data = null, pagination = null) => {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  if (pagination !== null) body.pagination = pagination;
  return res.status(statusCode).json(body);
};

export const sendError = (res, statusCode, message, errors = null) => {
  const body = { success: false, message };
  if (errors !== null) body.errors = errors;
  return res.status(statusCode).json(body);
};

// Pagination meta builder
export const buildPagination = (page, limit, total) => ({
  currentPage: page,
  totalPages: Math.ceil(total / limit),
  totalItems: total,
  itemsPerPage: limit,
  hasNextPage: page < Math.ceil(total / limit),
  hasPrevPage: page > 1,
});
