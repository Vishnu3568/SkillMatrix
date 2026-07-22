const { validationErrorResponse } = require('../responses');

/**
 * Higher-order middleware to validate req.body, req.params, or req.query against a Zod schema.
 * @param {import('zod').ZodSchema} schema Zod validation schema
 * @param {'body' | 'params' | 'query'} target Request property to validate
 */
const validate = (schema, target = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[target]);

  if (!result.success) {
    const details = result.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    return validationErrorResponse(res, 'Validation failed', details);
  }

  // Bind validated/parsed data back to target
  req[target] = result.data;
  next();
};

module.exports = validate;
