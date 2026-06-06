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
    if (status && !validator.isIn(status, ["present", "absent"])) {
        return res.status(400).json({ message: "Invalid status" });
    }

    next();
});


module.exports = { validateLogIn, validateAttendance };