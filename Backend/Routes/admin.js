const express = require("express");
const { authUser, authorizeRoles } = require("../middlewares/auth");
const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const Marks = require("../models/marks");
const bcrypt = require("bcrypt");

const adminRouter = express.Router();

adminRouter.get("/", authUser, authorizeRoles("admin"), (req, res) => {
    res.status(200).json({ message: "Welcome to the Admin Dashboard", user: req.user });
});

// ================= STUDENTS =================
adminRouter.get("/students", authUser, authorizeRoles("admin", "faculty"), asyncHandler(async (req, res) => {
    const allStudents = await User.find({ role: "student" }).select("-password");
    res.status(200).json({ message: "List of students", allStudents });
}));

adminRouter.post("/student", authUser, authorizeRoles("admin"), asyncHandler(async (req, res) => {
    const { name, email, password, contactNumber } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const student = new User({ name, email, password: hashedPassword, contactNumber, role: "student" });
    await student.save();
    res.status(201).json({ message: "Student created successfully" });
}));

adminRouter.patch("/student/:id", authUser, authorizeRoles("admin"), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, email, password, contactNumber } = req.body;
    const student = await User.findById(id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.name = name || student.name;
    student.email = email || student.email;
    student.contactNumber = contactNumber || student.contactNumber;
    if (password) {
        student.password = await bcrypt.hash(password, 10);
    }

    await student.save();
    res.status(200).json({ message: "Student updated successfully" });
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
    const allFaculties = await User.find({ role: "faculty" }).select("-password");
    res.status(200).json({ message: "List of faculty", allFaculties });
}));

adminRouter.post("/faculty", authUser, authorizeRoles("admin"), asyncHandler(async (req, res) => {
    const { name, email, password, contactNumber } = req.body;
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

    const marks = await Marks.find(filter)
        .populate("student", "name")
        .populate("subject", "name")
        .sort({ marks: -1 });
    res.status(200).json({ message: "Marks retrieved", marks });
}));

// POST upload marks (faculty & admin)
// Body: { student, subject, examType, marks, totalMarks, passingMarks }
adminRouter.post("/marks", authUser, authorizeRoles("admin", "faculty"), asyncHandler(async (req, res) => {
    const { student, subject, examType, marks, totalMarks, passingMarks } = req.body;

    if (!examType) {
        return res.status(400).json({ message: "examType is required (e.g. 'Mid-Term', 'Final')" });
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
adminRouter.patch("/marks/:id", authUser, authorizeRoles("admin", "faculty"), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { marks, totalMarks, passingMarks, examType } = req.body;
    const mark = await Marks.findById(id);
    if (!mark) return res.status(404).json({ message: "Mark not found" });

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


// ============= NOTICES =============

adminRouter.post("/notice", authUser, authorizeRoles("admin"), asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const notice = new Notice({ title, description });
    await notice.save();
    res.status(201).json({ message: "Notice created successfully", notice });
}));

adminRouter.get("/notice", authUser, authorizeRoles("admin", "faculty", "student"), asyncHandler(async (req, res) => {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.status(200).json({ message: "Notices retrieved", notices });
}));

adminRouter.get("/notice/:id", authUser, authorizeRoles("admin", "faculty", "student"), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const notice = await Notice.findById(id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });
    res.status(200).json({ message: "Notice retrieved", notice });
}));

adminRouter.patch("/notice/:id", authUser, authorizeRoles("admin"), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    const notice = await Notice.findById(id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });
    notice.title = title || notice.title;
    notice.description = description || notice.description;
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
