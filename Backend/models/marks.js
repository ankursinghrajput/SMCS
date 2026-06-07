const mongoose = require("mongoose");

// Helper to compute letter grade from percentage
function computeGrade(marks, totalMarks) {
    const pct = (marks / totalMarks) * 100;
    if (pct >= 90) return "A+";
    if (pct >= 80) return "A";
    if (pct >= 70) return "B";
    if (pct >= 60) return "C";
    if (pct >= 50) return "D";
    return "F";
}

const marksSchema = new mongoose.Schema({
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
    examType: {
        type: String,
        enum: ["Unit Test 1", "Unit Test 2", "Mid-Term", "Pre-Final", "Final", "Assignment", "Practical"],
        required: true
    },
    marks: {
        type: Number,
        required: true,
        min: 0
    },
    totalMarks: {
        type: Number,
        required: true,
        default: 100
    },
    passingMarks: {
        type: Number,
        required: true,
        default: 40
    }
}, { timestamps: true });

// Virtual: letter grade
marksSchema.virtual("grade").get(function () {
    return computeGrade(this.marks, this.totalMarks);
});

// Virtual: pass/fail status
marksSchema.virtual("status").get(function () {
    return this.marks >= this.passingMarks ? "Pass" : "Fail";
});

// Virtual: percentage
marksSchema.virtual("percentage").get(function () {
    return parseFloat(((this.marks / this.totalMarks) * 100).toFixed(2));
});

// Ensure a student can only have one marks record per subject per examType
marksSchema.index({ student: 1, subject: 1, examType: 1 }, { unique: true });

marksSchema.set("toJSON", { virtuals: true });
marksSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Marks", marksSchema);