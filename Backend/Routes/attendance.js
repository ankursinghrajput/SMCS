const express = require("express");
const asyncHandler = require("express-async-handler");
const { authUser, authorizeRoles } = require("../middlewares/auth");
const Attendance = require("../models/attendance");
const User = require("../models/user");
const { validateAttendance } = require("../utils/validate");
const attendanceRouter = express.Router();

attendanceRouter.post("/mark", validateAttendance, authUser, authorizeRoles("admin", "faculty"), asyncHandler(async (req, res) => {
    const { student, date, status, subject } = req.body;
    const user = await User.findById(student);
    if (!user) {
        return res.status(404).json({ message: "Student not found" });
    }

    // Check if attendance already exists for this student on this date for this subject
    const existingAttendance = await Attendance.findOne({ student, date, subject });
    if (existingAttendance) {
        return res.status(400).json({ message: "Attendance for this student on this date for this subject has already been marked" });
    }
    const attendance = new Attendance({ 
        student, 
        date, 
        status: status || "absent", 
        subject, 
        markedBy: req.user._id 
    });
    await attendance.save();
    res.status(201).json({ message: "Attendance marked successfully", attendance });
}));

attendanceRouter.get("/get", authUser, authorizeRoles("admin", "faculty"), asyncHandler(async (req, res) => {
    const attendance = await Attendance.find()
        .populate("student", "name")
        .populate("subject", "name")
        .populate("markedBy", "name");
    res.status(200).json({ message: "Attendance list", attendance });
}));

module.exports = attendanceRouter;
