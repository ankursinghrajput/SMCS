const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["present", "absent", "excused", "late"],
        default: "absent"
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // TTL field: MongoDB will automatically delete records 180 days after createdAt
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 180  // 180 days in seconds
    }
});

// Ensure a student can only have one attendance record per subject per day
attendanceSchema.index({ student: 1, date: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);