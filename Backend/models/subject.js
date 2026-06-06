const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
    {
        name: { type: String, required: true }, // e.g., "Mathematics"
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            required: true
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true // Admin must assign a faculty member
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);
