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


connectDB().then(() => {
    app.listen(process.env.PORT || 7001, () => {
        console.log(`Server running on port ${process.env.PORT}`);
    });
}).catch((err) => {
    console.log(err);
});


