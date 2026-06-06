const express = require("express");
const asyncHandler = require("express-async-handler");
const { authUser, authorizeRoles } = require("../middlewares/auth");
const Class = require("../models/class");
const Subject = require("../models/subject");

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
    res.status(200).json({ message: "Classes retrieved", classes });
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
