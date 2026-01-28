export function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'internal_error' 
    : err.message;
  res.status(status).json({ ok: false, error: message });
}