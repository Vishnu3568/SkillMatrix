const { validationErrorResponse } = require('../responses');

/**
 * Higher-order middleware to validate req.body against a Zod schema.
 * @param {import('zod').ZodSchema} schema Zod validation schema
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const details = result.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    return validationErrorResponse(res, 'Validation failed', details);
  }

  // Bind validated/parsed data back to req.body (applies Zod transforms like trim/lowercase)
  req.body = result.data;
  next();
};

module.exports = validate;
