import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
   const authHeader = req.headers["authorization"];
  const headerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  // Check cookie token
  const cookieToken = req.cookies?.accessToken;

  // Pick whichever token is present
  const token = headerToken || cookieToken;

  if (!token) {
    return res.status(401).json({ error: "Access token missing" });
  }

  // Verify token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    req.user = user;
    console.log("Authenticated user:", user);
    next();
  });
};
