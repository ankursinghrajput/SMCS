const express = require("express");
const { authUser, authorizeRoles } = require("../middlewares/auth");
const Attendance = require("../models/attendance");
const Marks = require("../models/marks");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const studentRouter = express.Router();

// ================= DASHBOARD =================
// Students get attendance summary + warnings; admin/faculty get basic info
studentRouter.get("/dashboard", authUser, authorizeRoles("admin", "faculty", "student"), asyncHandler(async (req, res) => {
    let responsePayload = { message: "Welcome to the Student Dashboard", user: req.user };

    if (req.user.role === "student") {
        const attendanceRecords = await Attendance.find({ student: req.user._id }).populate("subject", "name");

        const subjectStats = {};

        attendanceRecords.forEach(record => {
            if (!record.subject) return;
            const subjectId = record.subject._id.toString();
            const subjectName = record.subject.name;

            if (!subjectStats[subjectId]) {
                subjectStats[subjectId] = {
                    subjectName,
                    totalClasses: 0,
                    attendedClasses: 0
                };
            }

            subjectStats[subjectId].totalClasses += 1;
            // "present" and "late" both count as attended
            if (record.status === "present" || record.status === "late") {
                subjectStats[subjectId].attendedClasses += 1;
            }
        });

        const attendanceDetails = [];
        const attendanceWarnings = [];

        for (const key in subjectStats) {
            const stat = subjectStats[key];
            const percentage = (stat.attendedClasses / stat.totalClasses) * 100;
            stat.percentage = parseFloat(percentage.toFixed(2));

            attendanceDetails.push(stat);

            if (stat.percentage < 75) {
                attendanceWarnings.push({
                    subject: stat.subjectName,
                    percentage: stat.percentage,
                    message: `Warning: Attendance is below 75% for ${stat.subjectName}`
                });
            }
        }

        responsePayload.attendanceDetails = attendanceDetails;
        responsePayload.attendanceWarnings = attendanceWarnings;
    }

    res.status(200).json(responsePayload);
}));

// ================= ATTENDANCE =================
// Student views their own attendance with optional month/year filter
// Query params: ?month=5&year=2026&subject=<id>
studentRouter.get("/attendance", authUser, authorizeRoles("student"), asyncHandler(async (req, res) => {
    const { month, year, subject } = req.query;

    // Enforce 6-month retention window
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const filter = { student: req.user._id, date: { $gte: sixMonthsAgo } };
    if (subject) filter.subject = subject;

    if (month && year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);
        filter.date = { $gte: startDate < sixMonthsAgo ? sixMonthsAgo : startDate, $lt: endDate };
    } else if (year) {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(Number(year) + 1, 0, 1);
        filter.date = { $gte: startDate < sixMonthsAgo ? sixMonthsAgo : startDate, $lt: endDate };
    }

    const attendance = await Attendance.find(filter)
        .populate("subject", "name")
        .populate("markedBy", "name")
        .sort({ date: -1 });

    // Subject-wise summary
    const subjectSummary = {};
    attendance.forEach(record => {
        if (!record.subject) return;
        const sid = record.subject._id.toString();
        if (!subjectSummary[sid]) {
            subjectSummary[sid] = { subjectName: record.subject.name, total: 0, present: 0, absent: 0, late: 0, excused: 0 };
        }
        subjectSummary[sid].total += 1;
        subjectSummary[sid][record.status] = (subjectSummary[sid][record.status] || 0) + 1;
    });

    // Compute percentage and detect consecutive absences
    const summary = Object.values(subjectSummary).map(s => {
        const attended = s.present + s.late; // late counts as attended
        return {
            ...s,
            percentage: s.total > 0 ? parseFloat(((attended / s.total) * 100).toFixed(2)) : 0,
            belowRequirement: s.total > 0 && ((attended / s.total) * 100) < 75
        };
    });

    // Detect consecutive absences per subject (last N records, sorted by date asc)
    const consecutiveAbsenceWarnings = [];
    const subjectIds = [...new Set(attendance.filter(r => r.subject).map(r => r.subject._id.toString()))];

    for (const sid of subjectIds) {
        const subjectRecords = attendance
            .filter(r => r.subject && r.subject._id.toString() === sid)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        let consecutiveAbsences = 0;
        let maxConsecutive = 0;
        for (const record of subjectRecords) {
            if (record.status === "absent") {
                consecutiveAbsences += 1;
                maxConsecutive = Math.max(maxConsecutive, consecutiveAbsences);
            } else {
                consecutiveAbsences = 0;
            }
        }

        if (maxConsecutive >= 3) {
            const subjectName = subjectRecords[0].subject?.name || "Unknown";
            consecutiveAbsenceWarnings.push({
                subject: subjectName,
                consecutiveAbsences: maxConsecutive,
                message: `Alert: ${maxConsecutive} consecutive absences detected in ${subjectName}`
            });
        }
    }

    res.status(200).json({
        message: "Attendance retrieved successfully",
        attendance,
        summary,
        consecutiveAbsenceWarnings,
        // Calendar data: one entry per record, for the hover-calendar widget
        calendarData: attendance.map(r => ({
            date: new Date(r.date).toISOString().split("T")[0],
            status: r.status,
            subjectName: r.subject?.name || "Unknown"
        }))
    });
}));

// ================= MARKS =================
// Student sees own marks + class leaderboard sorted by marks descending
// Query: ?examType=Final&subject=<id>
studentRouter.get("/marks", authUser, authorizeRoles("student"), asyncHandler(async (req, res) => {
    const { examType, subject } = req.query;

    // Build own marks filter
    const myFilter = { student: req.user._id };
    if (examType) myFilter.examType = examType;
    if (subject) myFilter.subject = subject;

    // Student's own marks with grade, percentage, status virtuals
    const myMarks = await Marks.find(myFilter).populate("subject", "name");

    // Class leaderboard — same classmates, same filters
    const classFilter = {};
    if (examType) classFilter.examType = examType;
    if (subject) classFilter.subject = subject;

    const classmates = await User.find({ classId: req.user.classId, role: "student" }).select("_id");
    const classmateIds = classmates.map(c => c._id);

    const classMarks = await Marks.find({ student: { $in: classmateIds }, ...classFilter })
        .populate("student", "name")
        .populate("subject", "name")
        .sort({ marks: -1 });

    // Compute analytics: average, highest, lowest per subject+examType
    const analyticsMap = {};
    classMarks.forEach(record => {
        if (!record.subject) return;
        const key = `${record.subject._id}_${record.examType}`;
        if (!analyticsMap[key]) {
            analyticsMap[key] = {
                subjectName: record.subject.name,
                examType: record.examType,
                marksArr: [],
                passingMarks: record.passingMarks
            };
        }
        analyticsMap[key].marksArr.push(record.marks);
    });

    const classAnalytics = Object.values(analyticsMap).map(a => {
        const avg = parseFloat((a.marksArr.reduce((x, y) => x + y, 0) / a.marksArr.length).toFixed(2));
        const highest = Math.max(...a.marksArr);
        const lowest = Math.min(...a.marksArr);
        const passed = a.marksArr.filter(m => m >= a.passingMarks).length;
        return {
            subjectName: a.subjectName,
            examType: a.examType,
            classAverage: avg,
            highest,
            lowest,
            passed,
            failed: a.marksArr.length - passed,
            totalStudents: a.marksArr.length
        };
    });

    res.status(200).json({
        message: "Marks retrieved successfully",
        myMarks,
        classMarks,
        classAnalytics
    });
}));

module.exports = studentRouter;
