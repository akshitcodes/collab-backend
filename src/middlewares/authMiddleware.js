import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        console.log("cookies",req.cookies);
       const accessToken = req.cookies?.accessToken;
       if (!accessToken) {
           return res.status(401).json({ error: "Access token missing" });
       }
    }
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Access token missing" });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Invalid or expired token" });
        }
        req.user = user;
        console.log("Authenticated user:", user);
        next();
    });
};
