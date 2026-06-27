const express = require("express");
const connectDB = require("../config/database");
require("dotenv").config();

const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

// ── CORS ─────────────────────────────────────────────────────────────────────
// Allow the Vercel frontend origin (set FRONTEND_URL env var on Render).
// Falls back to localhost:5173 for local development.
const allowedOrigins = [
  process.env.FRONTEND_URL,          // e.g. https://smcs.vercel.app
  'http://localhost:5173',
  'http://localhost:5174',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman) or matching allowed list
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,   // Required for cross-origin cookies
}));

app.use(express.json());
app.use(cookieParser());

const authRoutes = require("../Routes/auth");
const adminRoutes = require("../Routes/admin");
const facultyRoutes = require("../Routes/faculty");
const studentRoutes = require("../Routes/student");
const attendanceRoutes = require("../Routes/attendance");
const academicRoutes = require("../Routes/academic");
const holidayRoutes = require("../Routes/holiday");

app.use("/api", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/academic", academicRoutes);
app.use("/api/holiday", holidayRoutes);

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



