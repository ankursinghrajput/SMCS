const express = require("express");
const asyncHandler = require("express-async-handler");
const { authUser, authorizeRoles } = require("../middlewares/auth");
const Attendance = require("../models/attendance");
const User = require("../models/user");
const { validateAttendance } = require("../utils/validate");
const attendanceRouter = express.Router();

// Helper: compute the start-of-day and end-of-day boundaries for a date string
function dayBounds(dateStr) {
    const d = new Date(dateStr);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    const end   = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
    return { start, end };
}

// Helper: 6-months-ago date (earliest allowed date)
function sixMonthsAgo() {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return d;
}

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
            const { start, end } = dayBounds(date);
            const existing = await Attendance.findOne({ 
                student, 
                subject, 
                date: { $gte: start, $lte: end } 
            });
            if (existing) {
                // Update existing record instead of failing
                existing.status = status || existing.status;
                await existing.save();
                results.success.push({ student, status: existing.status, updated: true });
                continue;
            }
            const attendance = new Attendance({
                student,
                date: start, // use normalized start of day
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

// ================= GET ALL ATTENDANCE (admin/faculty — optional month/year filter) =================
// Query params: ?month=5&year=2026
attendanceRouter.get("/get", authUser, authorizeRoles("admin", "faculty"), asyncHandler(async (req, res) => {
    const { month, year } = req.query;
    const cutoff = sixMonthsAgo();
    let filter = { date: { $gte: cutoff } };

    if (month && year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1); // exclusive
        // Respect 6-month window
        filter.date = { $gte: startDate < cutoff ? cutoff : startDate, $lt: endDate };
    } else if (year) {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(Number(year) + 1, 0, 1);
        filter.date = { $gte: startDate < cutoff ? cutoff : startDate, $lt: endDate };
    }

    const attendance = await Attendance.find(filter)
        .populate("student", "name")
        .populate("subject", "name")
        .populate("markedBy", "name")
        .sort({ date: -1 });

    res.status(200).json({ message: "Attendance list", attendance });
}));

// ================= GET CLASS ATTENDANCE (admin/faculty) =================
// Returns attendance for all students in a class for a given date.
// Query params: ?date=YYYY-MM-DD&subject=<id>
// Also supports ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD for range queries
attendanceRouter.get("/class/:classId", authUser, authorizeRoles("admin", "faculty"), asyncHandler(async (req, res) => {
    const { classId } = req.params;
    const { date, subject, startDate, endDate } = req.query;
    const cutoff = sixMonthsAgo();

    // Fetch all students in this class
    const students = await User.find({ role: "student", classId }).select("_id name");
    if (students.length === 0) {
        return res.status(200).json({ message: "No students in this class", attendance: [], students: [] });
    }
    const studentIds = students.map(s => s._id);

    const filter = { student: { $in: studentIds } };
    if (subject) filter.subject = subject;

    if (date) {
        const { start, end } = dayBounds(date);
        // Enforce 6-month window
        filter.date = { $gte: start < cutoff ? cutoff : start, $lte: end };
    } else if (startDate && endDate) {
        const sDate = new Date(startDate) < cutoff ? cutoff : new Date(startDate);
        filter.date = { $gte: sDate, $lte: new Date(endDate) };
    } else {
        // Default: today
        const { start, end } = dayBounds(new Date().toISOString().split("T")[0]);
        filter.date = { $gte: start, $lte: end };
    }

    const records = await Attendance.find(filter)
        .populate("student", "name")
        .populate("subject", "name")
        .populate("markedBy", "name")
        .sort({ date: -1 });

    // Build a merged list: every student + their status for the queried date
    // (absent if no record found)
    const recordMap = {};
    records.forEach(r => {
        const sid = r.student?._id?.toString();
        if (sid) recordMap[sid] = r;
    });

    const merged = students.map(s => {
        const rec = recordMap[s._id.toString()];
        return rec
            ? {
                studentId: s._id,
                name: s.name,
                status: rec.status,
                subject: rec.subject,
                markedBy: rec.markedBy,
                date: rec.date,
                recorded: true
            }
            : {
                studentId: s._id,
                name: s.name,
                status: "not-marked",
                recorded: false
            };
    });

    res.status(200).json({
        message: "Class attendance retrieved",
        attendance: records,
        merged,
        students
    });
}));

// ================= GET ATTENDANCE BY DATE (all roles) =================
// Students only get their own record. Admin/faculty get all records for that date.
// Query params: ?date=YYYY-MM-DD&classId=<id>&subject=<id>
attendanceRouter.get("/by-date", authUser, authorizeRoles("admin", "faculty", "student"), asyncHandler(async (req, res) => {
    const { date, classId, subject } = req.query;
    if (!date) {
        return res.status(400).json({ message: "date query parameter is required (YYYY-MM-DD)" });
    }

    const cutoff = sixMonthsAgo();
    const { start, end } = dayBounds(date);

    if (start < cutoff) {
        return res.status(400).json({ message: "Date is outside the 6-month retention window" });
    }

    const filter = { date: { $gte: start, $lte: end } };
    if (subject) filter.subject = subject;

    if (req.user.role === "student") {
        // Students only see their own record
        filter.student = req.user._id;
    } else if (classId) {
        // Admin/faculty: filter by class
        const students = await User.find({ role: "student", classId }).select("_id");
        filter.student = { $in: students.map(s => s._id) };
    }

    const records = await Attendance.find(filter)
        .populate("student", "name")
        .populate("subject", "name")
        .populate("markedBy", "name")
        .sort({ date: -1 });

    res.status(200).json({ message: "Attendance by date", date, records });
}));

// ================= GET CALENDAR SUMMARY (all roles) =================
// Returns list of dates that have attendance records within last 6 months.
// Students: their own. Admin/faculty: can pass classId & subject.
// Query params: ?classId=<id>&subject=<id>
attendanceRouter.get("/calendar", authUser, authorizeRoles("admin", "faculty", "student"), asyncHandler(async (req, res) => {
    const { classId, subject } = req.query;
    const cutoff = sixMonthsAgo();

    const filter = { date: { $gte: cutoff } };
    if (subject) filter.subject = subject;

    if (req.user.role === "student") {
        filter.student = req.user._id;
    } else if (classId) {
        const students = await User.find({ role: "student", classId }).select("_id");
        filter.student = { $in: students.map(s => s._id) };
    }

    const records = await Attendance.find(filter)
        .populate("subject", "name")
        .select("date status student subject")
        .sort({ date: 1 });

    // For student: group by date → { date, records: [{status, subjectName}] }
    // For admin/faculty: group by date → { date, total, present, absent, late }
    const calendarMap = {};
    records.forEach(r => {
        const key = new Date(r.date).toISOString().split("T")[0];
        if (!calendarMap[key]) {
            calendarMap[key] = { date: key, total: 0, present: 0, absent: 0, late: 0, excused: 0, records: [] };
        }
        calendarMap[key].total += 1;
        calendarMap[key][r.status] = (calendarMap[key][r.status] || 0) + 1;
        calendarMap[key].records.push({
            studentId: r.student,
            status: r.status,
            subject: r.subject?.name || null
        });
    });

    const calendar = Object.values(calendarMap);
    res.status(200).json({ message: "Calendar data retrieved", calendar });
}));

module.exports = attendanceRouter;
