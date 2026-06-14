const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
    {
        name: { type: String, required: true }, // e.g., "Class 10"
        section: { type: String }, // e.g., "A"
    },
    { timestamps: true }
);

module.exports = mongoose.model("Class", classSchema);
