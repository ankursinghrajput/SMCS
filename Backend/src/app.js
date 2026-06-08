const express = require("express");
const connectDB = require("../config/database");
require("dotenv").config();

const app = express();
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());

const authRoutes = require("../Routes/auth");
const adminRoutes = require("../Routes/admin");
const facultyRoutes = require("../Routes/faculty");
const studentRoutes = require("../Routes/student");
const attendanceRoutes = require("../Routes/attendance");
const academicRoutes = require("../Routes/academic");

app.use("/", authRoutes);
app.use("/admin", adminRoutes);
app.use("/faculty", facultyRoutes);
app.use("/student", studentRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/academic", academicRoutes);

// 404 handler — no route matched
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Global error handler — catches errors thrown in any route/middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message || "Internal Server Error"
    });
});

connectDB().then(() => {
    app.listen(process.env.PORT || 7001, () => {
        console.log(`Server running on port ${process.env.PORT || 7001}`);
    });
}).catch((err) => {
    console.log(err);
});



