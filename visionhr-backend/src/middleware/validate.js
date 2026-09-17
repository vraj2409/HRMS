import { sendError } from '../utils/apiResponse.js';
import { HTTP } from '../constants/index.js';

/**
 * validate.js
 * Generic Zod schema validation middleware factory.
 * Usage: router.post('/route', validate(myZodSchema), controller)
 *
 * Validates req.body against the provided Zod schema.
 * On failure, returns structured field-level error messages.
 */
const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // Format Zod errors into human-readable field: message pairs
      const errors = result.error.issues.reduce((acc, issue) => {
        const field = issue.path.join('.');
        acc[field] = issue.message;
        return acc;
      }, {});

      return sendError(res, HTTP.BAD_REQUEST, 'Validation failed. Please check the fields below.', errors);
    }

    // Attach the validated & coerced data to the request
    req.validatedBody = result.data;
    next();
  };
};

export default validate;
