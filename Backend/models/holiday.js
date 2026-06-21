const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    type: {
      type: String,
      enum: ["national", "regional", "school", "exam"],
      default: "school",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Holiday", holidaySchema);
