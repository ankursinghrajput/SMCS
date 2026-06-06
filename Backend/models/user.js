const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, unique: true, sparse: true },
        password: { type: String, required: true },
        contactNumber: { type: Number, required: true },
        role: {
            type: String,
            enum: ["student", "faculty", "admin"],
            default: "student",
            required: true
        },
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class"
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);