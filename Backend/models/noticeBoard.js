const mongoose = require("mongoose");
const noticeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
    audience: { type: String, enum: ["all", "student", "faculty"], default: "all" }
}, { timestamps: true });
module.exports = mongoose.model("Notice", noticeSchema);