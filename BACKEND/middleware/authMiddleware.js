const jwt = require("jsonwebtoken");
const SECRET_KEY = "your_jwt_secret";

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    console.log("Received Authorization Header:", req.headers.authorization);

    if (!token) return res.status(401).json({ error: "Access denied" });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
};

module.exports = authMiddleware;
