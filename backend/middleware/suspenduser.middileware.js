export const checkSuspension = (req, res, next) => {
  const user = req.user.id

  if (user?.suspendedUntil && new Date() < new Date(user.suspendedUntil)) {
    return res.status(423).json({
      error: "Account suspended",
      until: user.suspendedUntil,
      reason: user.suspendedReason,
    });
  }

  next();
};
