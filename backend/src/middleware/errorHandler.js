export function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).json({ ok: false, error: "internal_error" });
}
