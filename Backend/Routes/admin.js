const express = require("express");
const { authUser, authorizeRoles } = require("../middlewares/auth");
const asyncHandler = require("express-async-handler");
const User = require("../models/user");
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

module.exports = adminRouter;
