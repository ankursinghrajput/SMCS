const express = require("express");
const { authUser, authorizeRoles } = require("../middlewares/auth");
const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const Marks = require("../models/marks");
const Notice = require("../models/noticeBoard");
const Class = require("../models/class");
const Attendance = require("../models/attendance");
const bcrypt = require("bcrypt");
const { validateMarks, validateMarksUpdate, validateContactNumber } = require("../utils/validate");

const adminRouter = express.Router();

adminRouter.get("/", authUser, authorizeRoles("admin"), (req, res) => {
    res.status(200).json({ message: "Welcome to the Admin Dashboard", user: req.user });
});

// GET dashboard statistics
adminRouter.get("/dashboard-stats", authUser, authorizeRoles("admin", "faculty"), asyncHandler(async (req, res) => {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalFaculty = await User.countDocuments({ role: "faculty" });
    const totalClasses = await Class.countDocuments();

    // Calculate average attendance percentage
    const attendanceRecords = await Attendance.find();
    let averageAttendance = 0;
    if (attendanceRecords.length > 0) {
        const presentOrLate = attendanceRecords.filter(r => r.status === "present" || r.status === "late").length;
        averageAttendance = parseFloat(((presentOrLate / attendanceRecords.length) * 100).toFixed(2));
    }

    const recentNotices = await Notice.find()
        .sort({ createdAt: -1 })
        .limit(1);

    res.status(200).json({
        totalStudents,
        totalFaculty,
        totalClasses,
        averageAttendance,
        recentNotices
    });
}));


// ================= STUDENTS =================
adminRouter.get("/students", authUser, authorizeRoles("admin", "faculty"), asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { role: "student" };
    if (req.query.classId) filter.classId = req.query.classId;

    const totalStudents = await User.countDocuments(filter);
    const allStudents = await User.find(filter)
        .select("-password")
        .populate("classId", "name section")
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        message: "List of students",
        pagination: {
            total: totalStudents,
            page,
            limit,
            pages: Math.ceil(totalStudents / limit)
        },
        allStudents
    });
}));

adminRouter.post("/student", authUser, validateContactNumber, authorizeRoles("admin"), asyncHandler(async (req, res) => {
    const { name, email, password, contactNumber, classId } = req.body;
    if (!name || !password || !contactNumber) {
        return res.status(400).json({ message: "Name, password, and contact number are required" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const student = new User({ name, email, password: hashedPassword, contactNumber, role: "student", classId: classId || undefined });
    await student.save();
    res.status(201).json({ message: "Student created successfully" });
}));

adminRouter.patch("/student/:id", authUser, authorizeRoles("admin"), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, email, password, contactNumber, classId } = req.body;
    const student = await User.findById(id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.name = name || student.name;
    student.email = email || student.email;
    student.contactNumber = contactNumber || student.contactNumber;
    if (classId !== undefined) student.classId = classId || null;
    if (password) {
        student.password = await bcrypt.hash(password, 10);
    }

    await student.save();
    res.status(200).json({ message: "Student updated successfully" });
}));

// ===== CLASS MEMBERSHIP (Admin only) =====
// Add a student to a class
adminRouter.patch("/class/:classId/add-student", authUser, authorizeRoles("admin"), asyncHandler(async (req, res) => {
    const { classId } = req.params;
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ message: "studentId is required" });

    const student = await User.findOne({ _id: studentId, role: "student" });
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.classId = classId;
    await student.save();
    res.status(200).json({ message: "Student added to class successfully" });
}));

// Remove a student from a class
adminRouter.patch("/class/:classId/remove-student", authUser, authorizeRoles("admin"), asyncHandler(async (req, res) => {
    const { classId } = req.params;
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ message: "studentId is required" });

    const student = await User.findOne({ _id: studentId, role: "student", classId });
    if (!student) return res.status(404).json({ message: "Student not found in this class" });

    student.classId = null;
    await student.save();
    res.status(200).json({ message: "Student removed from class successfully" });
}));

adminRouter.delete("/student/:id", authUser, authorizeRoles("admin"), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const student = await User.findById(id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    await student.deleteOne();
    res.status(200).json({ message: "Student deleted successfully" });
}));

// ================= FACULTY =================
adminRouter.get("/faculties", authUser, authorizeRoles("admin"), asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalFaculties = await User.countDocuments({ role: "faculty" });
    const allFaculties = await User.find({ role: "faculty" })
        .select("-password")
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        message: "List of faculty",
        pagination: {
            total: totalFaculties,
            page,
            limit,
            pages: Math.ceil(totalFaculties / limit)
        },
        allFaculties
    });
}));

adminRouter.post("/faculty", authUser, authorizeRoles("admin"), asyncHandler(async (req, res) => {
    const { name, email, password, contactNumber } = req.body;
    if (!name || !email || !password || !contactNumber) {
        return res.status(400).json({ message: "Name, email, password, and contact number are required" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const faculty = new User({ name, email, password: hashedPassword, contactNumber, role: "faculty" });
    await faculty.save();
    res.status(201).json({ message: "Faculty created successfully" });
}));

adminRouter.patch("/faculty/:id", authUser, authorizeRoles("admin"), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, email, password, contactNumber } = req.body;
    const faculty = await User.findById(id);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });

    faculty.name = name || faculty.name;
    faculty.email = email || faculty.email;
    faculty.contactNumber = contactNumber || faculty.contactNumber;
    if (password) {
        faculty.password = await bcrypt.hash(password, 10);
    }

    await faculty.save();
    res.status(200).json({ message: "Faculty updated successfully" });
}));

adminRouter.delete("/faculty/:id", authUser, authorizeRoles("admin"), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const faculty = await User.findById(id);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });

    await faculty.deleteOne();
    res.status(200).json({ message: "Faculty deleted successfully" });
}));



//=============MARKS==============

// GET all marks — admin & faculty can filter by subject or examType
// Query: ?subject=<id>&examType=Final
adminRouter.get("/marks", authUser, authorizeRoles("admin", "faculty"), asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.subject) filter.subject = req.query.subject;
    if (req.query.examType) filter.examType = req.query.examType;
    if (req.query.student) filter.student = req.query.student;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalMarks = await Marks.countDocuments(filter);
    const marks = await Marks.find(filter)
        .populate("student", "name")
        .populate("subject", "name")
        .sort({ marks: -1 })
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        message: "Marks retrieved",
        pagination: {
            total: totalMarks,
            page,
            limit,
            pages: Math.ceil(totalMarks / limit)
        },
        marks
    });
}));

// POST upload marks (faculty & admin)
// Body: { student, subject, examType, marks, totalMarks, passingMarks }
adminRouter.post("/marks", authUser, validateMarks, authorizeRoles("admin", "faculty"), asyncHandler(async (req, res) => {
    const { student, subject, examType, marks, totalMarks, passingMarks } = req.body;

    // Check if student exists and has student role
    const studentUser = await User.findOne({ _id: student, role: "student" });
    if (!studentUser) {
        return res.status(404).json({ message: "Student not found" });
    }

    const newMark = new Marks({
        student,
        subject,
        examType,
        marks,
        totalMarks: totalMarks || 100,
        passingMarks: passingMarks || 40
    });
    await newMark.save();
    res.status(201).json({ message: "Marks added successfully", mark: newMark });
}));

// PATCH update marks
adminRouter.patch("/marks/:id", authUser, validateMarksUpdate, authorizeRoles("admin", "faculty"), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { marks, totalMarks, passingMarks, examType } = req.body;
    const mark = await Marks.findById(id);
    if (!mark) return res.status(404).json({ message: "Mark not found" });

    // Validate overall bounds of the final state
    const targetMarks = marks !== undefined ? Number(marks) : mark.marks;
    const targetTotal = totalMarks !== undefined ? Number(totalMarks) : mark.totalMarks;
    const targetPassing = passingMarks !== undefined ? Number(passingMarks) : mark.passingMarks;

    if (targetMarks > targetTotal) {
        return res.status(400).json({ message: "Marks obtained cannot exceed total marks" });
    }
    if (targetPassing > targetTotal) {
        return res.status(400).json({ message: "Passing marks cannot exceed total marks" });
    }

    if (marks !== undefined) mark.marks = marks;
    if (totalMarks !== undefined) mark.totalMarks = totalMarks;
    if (passingMarks !== undefined) mark.passingMarks = passingMarks;
    if (examType) mark.examType = examType;

    await mark.save();
    res.status(200).json({ message: "Mark updated successfully", mark });
}));

// DELETE a mark record
adminRouter.delete("/marks/:id", authUser, authorizeRoles("admin", "faculty"), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const mark = await Marks.findById(id);
    if (!mark) return res.status(404).json({ message: "Mark not found" });

    await mark.deleteOne();
    res.status(200).json({ message: "Mark deleted successfully" });
}));

// GET class analytics for a subject & examType
// Query: ?subject=<id>&examType=Final
adminRouter.get("/marks/analytics", authUser, authorizeRoles("admin", "faculty"), asyncHandler(async (req, res) => {
    const { subject, examType } = req.query;
    if (!subject || !examType) {
        return res.status(400).json({ message: "subject and examType query params are required" });
    }

    const records = await Marks.find({ subject, examType })
        .populate("student", "name")
        .populate("subject", "name");

    if (records.length === 0) {
        return res.status(200).json({ message: "No records found for given subject and examType", analytics: null });
    }

    const marksArr = records.map(r => r.marks);
    const highest = Math.max(...marksArr);
    const lowest = Math.min(...marksArr);
    const average = parseFloat((marksArr.reduce((a, b) => a + b, 0) / marksArr.length).toFixed(2));
    const passed = records.filter(r => r.marks >= r.passingMarks).length;
    const failed = records.length - passed;

    res.status(200).json({
        message: "Class analytics retrieved",
        analytics: {
            subject: records[0].subject?.name,
            examType,
            totalStudents: records.length,
            highest,
            lowest,
            average,
            passed,
            failed
        },
        records
    });
}));


// ================= NOTICES =============

adminRouter.post("/notice", authUser, authorizeRoles("admin"), asyncHandler(async (req, res) => {
    const { title, description, audience, durationDays } = req.body;
    let expiresAt = null;
    if (durationDays && Number(durationDays) > 0) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + Number(durationDays));
    }
    const notice = new Notice({ title, description, audience, expiresAt });
    await notice.save();
    res.status(201).json({ message: "Notice created successfully", notice });
}));

adminRouter.get("/notice", authUser, authorizeRoles("admin", "faculty", "student"), asyncHandler(async (req, res) => {
    let filter = {};
    if (req.user.role === "student") {
        filter = { audience: { $in: ["all", "student"] } };
    } else if (req.user.role === "faculty") {
        filter = { audience: { $in: ["all", "faculty"] } };
    }

    // Exclude expired notices (expiresAt is set and in the past)
    filter.$or = [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
    ];

    const notices = await Notice.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ message: "Notices retrieved", notices });
}));

adminRouter.get("/notice/:id", authUser, authorizeRoles("admin", "faculty", "student"), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const notice = await Notice.findById(id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });

    // Enforce role access boundaries based on notice audience
    if (req.user.role === "student" && notice.audience === "faculty") {
        return res.status(403).json({ message: "Forbidden: You do not have permission to view this notice." });
    }
    if (req.user.role === "faculty" && notice.audience === "student") {
        return res.status(403).json({ message: "Forbidden: You do not have permission to view this notice." });
    }

    res.status(200).json({ message: "Notice retrieved", notice });
}));

adminRouter.patch("/notice/:id", authUser, authorizeRoles("admin"), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description, audience, durationDays } = req.body;
    const notice = await Notice.findById(id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });
    notice.title = title || notice.title;
    notice.description = description || notice.description;
    if (audience) notice.audience = audience;
    // Update expiry if durationDays is provided
    if (durationDays !== undefined) {
        if (Number(durationDays) > 0) {
            // Re-calculate from original createdAt so editing doesn't reset the clock
            const base = new Date(notice.createdAt);
            base.setDate(base.getDate() + Number(durationDays));
            notice.expiresAt = base;
        } else {
            notice.expiresAt = null; // 0 or empty = never expires
        }
    }
    await notice.save();
    res.status(200).json({ message: "Notice updated successfully", notice });
}));

adminRouter.delete("/notice/:id", authUser, authorizeRoles("admin"), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const notice = await Notice.findById(id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });
    await notice.deleteOne();
    res.status(200).json({ message: "Notice deleted successfully" });
}));

module.exports = adminRouter;
