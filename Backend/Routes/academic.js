const express = require("express");
const asyncHandler = require("express-async-handler");
const { authUser, authorizeRoles } = require("../middlewares/auth");
const Class = require("../models/class");
const Subject = require("../models/subject");
const User = require("../models/user");

const academicRouter = express.Router();

// ================= CLASSES =================
academicRouter.post("/class", authUser, authorizeRoles("admin"), asyncHandler(async (req, res) => {
    const { name, section } = req.body;
    const newClass = new Class({ name, section });
    await newClass.save();
    res.status(201).json({ message: "Class created successfully", class: newClass });
}));

academicRouter.patch("/class/:id", authUser, authorizeRoles("admin"), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, section } = req.body;
    const cls = await Class.findById(id);
    if (!cls) return res.status(404).json({ message: "Class not found" });
    if (name !== undefined && name.trim()) cls.name = name.trim();
    if (section !== undefined) cls.section = section.trim();
    await cls.save();
    res.status(200).json({ message: "Class updated successfully", class: cls });
}));

academicRouter.delete("/class/:id", authUser, authorizeRoles("admin"), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const cls = await Class.findById(id);
    if (!cls) return res.status(404).json({ message: "Class not found" });
    await cls.deleteOne();
    res.status(200).json({ message: "Class deleted successfully" });
}));

academicRouter.get("/classes", authUser, authorizeRoles("admin", "faculty"), asyncHandler(async (req, res) => {
    const classes = await Class.find();
    // Attach student count to each class
    const classesWithCount = await Promise.all(
        classes.map(async (cls) => {
            const studentCount = await User.countDocuments({ role: "student", classId: cls._id });
            return { ...cls.toObject(), studentCount };
        })
    );
    res.status(200).json({ message: "Classes retrieved", classes: classesWithCount });
}));

// GET students in a specific class (admin + faculty)
academicRouter.get("/class/:id/students", authUser, authorizeRoles("admin", "faculty"), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const cls = await Class.findById(id);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    const students = await User.find({ role: "student", classId: id }).select("-password");
    res.status(200).json({ message: "Students retrieved", students, class: cls });
}));

// ================= SUBJECTS =================
academicRouter.post("/subject", authUser, authorizeRoles("admin"), asyncHandler(async (req, res) => {
    const { name, classId, teacher } = req.body;
    if (!name || !classId || !teacher) {
        return res.status(400).json({ message: "name, classId, and teacher are required" });
    }
    const subject = new Subject({ name, classId, teacher });
    await subject.save();
    const populated = await subject.populate([
        { path: "classId", select: "name section" },
        { path: "teacher", select: "name email" }
    ]);
    res.status(201).json({ message: "Subject created successfully", subject: populated });
}));

academicRouter.get("/subjects", authUser, authorizeRoles("admin", "faculty"), asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.classId) filter.classId = req.query.classId;
    const subjects = await Subject.find(filter)
        .populate("classId", "name section")
        .populate("teacher", "name email");
    res.status(200).json({ message: "Subjects retrieved", subjects });
}));

academicRouter.patch("/subject/:id", authUser, authorizeRoles("admin"), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, classId, teacher } = req.body;
    const subject = await Subject.findById(id);
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    if (name) subject.name = name;
    if (classId) subject.classId = classId;
    if (teacher) subject.teacher = teacher;
    await subject.save();
    const populated = await subject.populate([
        { path: "classId", select: "name section" },
        { path: "teacher", select: "name email" }
    ]);
    res.status(200).json({ message: "Subject updated successfully", subject: populated });
}));

academicRouter.delete("/subject/:id", authUser, authorizeRoles("admin"), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const subject = await Subject.findById(id);
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    await subject.deleteOne();
    res.status(200).json({ message: "Subject deleted successfully" });
}));

module.exports = academicRouter;
