// Middleware de cache temporal sin Redis
const cacheMiddleware = (key) => (req, res, next) => {
  // Sin Redis, pasar directamente sin cache
  next();
};

module.exports = { cacheMiddleware };