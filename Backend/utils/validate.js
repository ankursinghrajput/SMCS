const validator = require("validator");
const asyncHandler = require("express-async-handler");

const validateSignUp = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
        res.status(400).json({ message: "All fields are required" });
        return;
    }
    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: "Invalid email address" });
    }
    if (!validator.isStrongPassword(password)) {
        return res.status(400).json({ message: "Password must be strong" });
    }
    next();
})

const validateLogIn = asyncHandler(async (req, res, next) => {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
        res.status(400).json({ message: "All fields are required" });
        return;
    }
    next();
})

module.exports = { validateSignUp, validateLogIn };