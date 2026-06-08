const express = require("express");
const asyncHandler = require("express-async-handler");
const { authUser, authorizeRoles } = require("../middlewares/auth");
const Attendance = require("../models/attendance");
const User = require("../models/user");
const { validateAttendance } = require("../utils/validate");
const attendanceRouter = express.Router();

// ================= MARK SINGLE ATTENDANCE =================
attendanceRouter.post("/mark", authUser, authorizeRoles("admin", "faculty"), validateAttendance, asyncHandler(async (req, res) => {
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

// ================= MARK BULK ATTENDANCE =================
// Body: { subject, date, records: [{ student, status }] }
attendanceRouter.post("/mark-bulk", authUser, authorizeRoles("admin", "faculty"), asyncHandler(async (req, res) => {
    const { subject, date, records } = req.body;

    if (!subject || !date || !Array.isArray(records) || records.length === 0) {
        return res.status(400).json({ message: "subject, date, and a non-empty records array are required" });
    }

    const results = { success: [], failed: [] };

    for (const record of records) {
        const { student, status } = record;
        try {
            const user = await User.findById(student);
            if (!user) {
                results.failed.push({ student, reason: "Student not found" });
                continue;
            }
            const existing = await Attendance.findOne({ student, date, subject });
            if (existing) {
                results.failed.push({ student, reason: "Attendance already marked for this date" });
                continue;
            }
            const attendance = new Attendance({
                student,
                date,
                status: status || "absent",
                subject,
                markedBy: req.user._id
            });
            await attendance.save();
            results.success.push({ student, status: status || "absent" });
        } catch (err) {
            results.failed.push({ student, reason: err.message });
        }
    }

    res.status(201).json({
        message: `Bulk attendance processed: ${results.success.length} success, ${results.failed.length} failed`,
        results
    });
}));

// ================= GET ALL ATTENDANCE (with optional month/year filter) =================
// Query params: ?month=5&year=2026
attendanceRouter.get("/get", authUser, authorizeRoles("admin", "faculty"), asyncHandler(async (req, res) => {
    const { month, year } = req.query;
    let filter = {};

    if (month && year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1); // exclusive
        filter.date = { $gte: startDate, $lt: endDate };
    } else if (year) {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(Number(year) + 1, 0, 1);
        filter.date = { $gte: startDate, $lt: endDate };
    }

    const attendance = await Attendance.find(filter)
        .populate("student", "name")
        .populate("subject", "name")
        .populate("markedBy", "name")
        .sort({ date: -1 });

    res.status(200).json({ message: "Attendance list", attendance });
}));

module.exports = attendanceRouter;
