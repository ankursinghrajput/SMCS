const express = require("express");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const { validateSignUp, validateLogIn } = require("../utils/validate");
const jwt = require("jsonwebtoken");

const authRouter = express.Router();


authRouter.post("/signUp", validateSignUp, asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;
    const user = await User.findOne({ email });
    if (user) {
        res.status(400).json({ message: "User already exists" });
        return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword, role });
    res.status(201).json({ message: "User created successfully" });
}));

authRouter.post("/login", validateLogIn, asyncHandler(async (req, res, next) => {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email, role });
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        res.status(401).json({ message: "Invalid password" });
        return;
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true, secure: true, maxAge: 60 * 60 * 1000 });
    res.status(200).json({ message: "User logged in successfully" });
}));

authRouter.post("/logout", (req, res) => {
    res.clearCookie("token", null, { expires: new Date(Date.now()) });
    res.status(200).json({ message: "User logged out successfully" });
});

const { protect } = require("../middlewares/auth");

authRouter.get("/profile", protect, (req, res) => {
    // req.user is available here because the protect middleware fetched it!
    res.status(200).json({
        message: "Profile data fetched successfully",
        user: req.user
    });
});

module.exports = authRouter;