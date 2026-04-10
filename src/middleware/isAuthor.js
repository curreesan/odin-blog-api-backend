const isAuthor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "No user found" });
  }

  if (req.user.role === "AUTHOR") {
    return next();
  }

  return res.status(403).json({ message: "You are not an author" });
};

export default isAuthor;
