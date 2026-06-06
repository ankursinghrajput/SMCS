const express = require("express");
const { authUser, authorizeRoles } = require("../middlewares/auth");
const Attendance = require("../models/attendance");
const asyncHandler = require("express-async-handler");
const studentRouter = express.Router();

// Students, faculty, and admins can access this route
studentRouter.get("/dashboard", authUser, authorizeRoles("admin", "faculty", "student"), (req, res) => {
    res.status(200).json({ message: "Welcome to the Student Dashboard", user: req.user });
});

studentRouter.get("/attendance", authUser, authorizeRoles("student"), asyncHandler(async (req, res) => {
    const attendance = await Attendance.find({ student: req.user._id }).populate("markedBy", "name");
    res.status(200).json({ message: "Attendance list", attendance });
}));

module.exports = studentRouter;
