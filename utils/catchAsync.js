/**
 * @desc    Wraps async functions and automatically catches errors, 
 *          passing them to the next middleware (Global Error Handler).
 */
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
