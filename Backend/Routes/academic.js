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
    const subject = new Subject({ name, classId, teacher });
    await subject.save();
    res.status(201).json({ message: "Subject created successfully", subject });
}));

academicRouter.get("/subjects", authUser, authorizeRoles("admin", "faculty"), asyncHandler(async (req, res) => {
    const subjects = await Subject.find().populate("classId", "name section").populate("teacher", "name email");
    res.status(200).json({ message: "Subjects retrieved", subjects });
}));

module.exports = academicRouter;
