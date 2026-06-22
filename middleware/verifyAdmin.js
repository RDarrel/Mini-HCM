const verifyAdmin = (req, res, next) => {
  if (req.user?.role !== "administrator") {
    return res.status(403).json({
      error: "You are not authorized",
    });
  }

  next();
};

module.exports = verifyAdmin;
