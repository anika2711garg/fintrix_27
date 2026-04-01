const AppError = require('../utils/AppError');
const { z } = require('zod');

/**
 * @desc    Generic middleware to validate request data against a Zod schema.
 *          Validates body, query, and params.
 */
module.exports = (schema) => (req, res, next) => {
  try {
    const validatedData = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    
    // Replace original data with validated/transformed data
    req.body = validatedData.body;
    req.query = validatedData.query;
    req.params = validatedData.params;
    
    next();
  } catch (error) {
    let message = 'Validation Error';
    if (error instanceof z.ZodError) {
      message = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
    } else if (error.errors && Array.isArray(error.errors)) {
       message = error.errors.map((err) => `${err.path?.join('.') || 'field'}: ${err.message}`).join(', ');
    } else if (error.message) {
      message = error.message;
    }
    next(new AppError(message, 400));
  }
};
