const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "No authentication token, access denied" });
  }

  try {
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Invalid authentication format, access denied" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret_123456789"
    );

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token has expired, please login again" });
    }

    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Invalid token, authentication failed" });
  }
};

module.exports = authMiddleware;
