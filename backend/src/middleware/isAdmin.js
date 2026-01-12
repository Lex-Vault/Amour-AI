export const isAdmin = (req, res, next) => {
  if (!req.user)
    return res.status(401).json({ ok: false, error: "unauthorized" });
  if (!req.user?.adminAccess)
    return res.status(403).json({ ok: false, error: "forbidden" });
  next();
};
