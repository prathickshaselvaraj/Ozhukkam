export function errorHandler(err, req, res, next) {
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status).json({
    error: {
      message: (err && err.message) ? err.message : "Server error"
    }
  });
}