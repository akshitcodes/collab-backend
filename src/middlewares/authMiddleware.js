import jwt from "jsonwebtoken";
import { pool } from "../DB/db.js";
import { promisify } from "util";

const verifyToken = promisify(jwt.verify);

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const headerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    const cookieToken = req.cookies?.accessToken;
    console.log("Header Token:", headerToken);
    console.log("Cookie Token:", cookieToken);

    const token = headerToken || cookieToken;
    if (!token) {
      return res.status(401).json({ error: "Access token missing" });
    }

    const JWTuser = await verifyToken(token, process.env.ACCESS_TOKEN_SECRET);

    const result = await pool.query("SELECT * FROM users WHERE id = $1", [JWTuser.id]);

    if (result.rows.length === 0) {
      console.log("User not found");
      return res.status(404).json({ error: "User not found" });
    }

    req.user = result.rows[0];
    console.log("Authenticated user:", req.user);
    next();
  } catch (err) {
    console.error("Authentication Error:", err.message);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

