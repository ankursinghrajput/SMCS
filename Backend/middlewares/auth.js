const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/user");

const protect = asyncHandler(async (req, res, next) => {
    try {
        // 1. Read the token from the cookie (set during login)
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "Access denied. Please login first." });
        }
        // 2. Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Find the user from the decoded ID
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "Invalid token. User not found." });
        }

        // 4. Attach the user object to the request so route handlers can use it
        req.user = user;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token has expired. Please log in again." });
        }
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token." });
        }
        return res.status(500).json({ message: "Internal server error." });
    }
});

module.exports = { protect };
