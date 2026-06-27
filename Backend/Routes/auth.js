const express = require("express");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const { validateLogIn } = require("../utils/validate");
const jwt = require("jsonwebtoken");
const { authUser } = require("../middlewares/auth");

const authRouter = express.Router();

authRouter.post("/login", validateLogIn, asyncHandler(async (req, res) => {
    const { email, contactNumber, password, role } = req.body;

    let user;
    if (role === "student") {
        user = await User.findOne({ contactNumber, role });
    } else {
        user = await User.findOne({ email, role });
    }

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
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 60 * 60 * 1000 });
    res.status(200).json({ message: "User logged in successfully" });
}));

authRouter.post("/logout", (req, res) => {
    res.clearCookie("token", { httpOnly: true, secure: true, sameSite: 'None' });
    res.status(200).json({ message: "User logged out successfully" });
});

authRouter.get("/profile", authUser, (req, res) => {
    res.status(200).json({
        message: "Profile data fetched successfully",
        user: req.user
    });
});

module.exports = authRouter;