export default function requireAuth(req, res, next) {
  if (!req.session.userId) {
    req.flash("error", "Please log in first.");
    return res.redirect("/auth/login");
  }
  next();
}
