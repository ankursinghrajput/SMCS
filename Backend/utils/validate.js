const validator = require("validator");
const asyncHandler = require("express-async-handler");

const validateLogIn = asyncHandler(async (req, res, next) => {
    const { email, password, role, contactNumber } = req.body;

    if (!password || !role) {
        return res.status(400).json({ message: "Password and role are required" });
    }

    if (role === "student") {
        if (!contactNumber) {
            return res.status(400).json({ message: "Contact number is required for student login" });
        }
    } else {
        if (!email) {
            return res.status(400).json({ message: "Email is required for admin/faculty login" });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "Invalid email address" });
        }
    }

    next();
});

const validateAttendance = asyncHandler(async (req, res, next) => {
    const { student, date, status, subject } = req.body;
    if (!student || !date || !subject) {
        return res.status(400).json({ message: "Student, subject, and date are required" });
    }
    if (!validator.isDate(date)) {
        return res.status(400).json({ message: "Invalid date" });
    }
    if (status && !validator.isIn(status, ["present", "absent", "excused", "late"])) {
        return res.status(400).json({ message: "Invalid status. Must be one of: present, absent, excused, late" });
    }

    next();
});


const validateMarks = asyncHandler(async (req, res, next) => {
    const { student, subject, examType, marks, totalMarks, passingMarks } = req.body;
    if (!student || !subject || !examType || marks === undefined) {
        return res.status(400).json({ message: "Student, subject, examType, and marks are required" });
    }
    if (!validator.isMongoId(String(student)) || !validator.isMongoId(String(subject))) {
        return res.status(400).json({ message: "Invalid student or subject ID format" });
    }
    if (!["Unit Test 1", "Unit Test 2", "Mid-Term", "Pre-Final", "Final", "Assignment", "Practical"].includes(examType)) {
        return res.status(400).json({ message: "Invalid examType" });
    }
    const numericMarks = Number(marks);
    const numericTotal = totalMarks !== undefined ? Number(totalMarks) : 100;
    const numericPassing = passingMarks !== undefined ? Number(passingMarks) : 40;

    if (isNaN(numericMarks) || numericMarks < 0) {
        return res.status(400).json({ message: "Marks must be a positive number" });
    }
    if (isNaN(numericTotal) || numericTotal <= 0) {
        return res.status(400).json({ message: "Total marks must be a positive number greater than 0" });
    }
    if (isNaN(numericPassing) || numericPassing < 0) {
        return res.status(400).json({ message: "Passing marks must be a positive number" });
    }
    if (numericMarks > numericTotal) {
        return res.status(400).json({ message: "Marks obtained cannot exceed total marks" });
    }
    if (numericPassing > numericTotal) {
        return res.status(400).json({ message: "Passing marks cannot exceed total marks" });
    }

    next();
});

const validateMarksUpdate = asyncHandler(async (req, res, next) => {
    const { marks, totalMarks, passingMarks, examType } = req.body;

    if (examType && !["Unit Test 1", "Unit Test 2", "Mid-Term", "Pre-Final", "Final", "Assignment", "Practical"].includes(examType)) {
        return res.status(400).json({ message: "Invalid examType" });
    }

    if (marks !== undefined) {
        const numericMarks = Number(marks);
        if (isNaN(numericMarks) || numericMarks < 0) {
            return res.status(400).json({ message: "Marks must be a positive number" });
        }
    }
    if (totalMarks !== undefined) {
        const numericTotal = Number(totalMarks);
        if (isNaN(numericTotal) || numericTotal <= 0) {
            return res.status(400).json({ message: "Total marks must be a positive number greater than 0" });
        }
    }
    if (passingMarks !== undefined) {
        const numericPassing = Number(passingMarks);
        if (isNaN(numericPassing) || numericPassing < 0) {
            return res.status(400).json({ message: "Passing marks must be a positive number" });
        }
    }

    next();
});

const validateContactNumber = asyncHandler(async (req, res, next) => {
    const { contactNumber } = req.body;
    if (contactNumber && !validator.isLength(contactNumber, { min: 10, max: 10 })) {
        return res.status(400).json({ message: "Contact number must be 10 digits" });
    }
    next();
});


module.exports = { validateLogIn, validateAttendance, validateMarks, validateMarksUpdate, validateContactNumber };