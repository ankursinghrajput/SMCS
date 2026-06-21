const express = require("express");
const asyncHandler = require("express-async-handler");
const { authUser, authorizeRoles } = require("../middlewares/auth");
const Holiday = require("../models/holiday");

const holidayRouter = express.Router();

// GET holidays — returns any holiday that overlaps with the given month/year
holidayRouter.get(
  "/",
  authUser,
  authorizeRoles("admin", "faculty", "student"),
  asyncHandler(async (req, res) => {
    const { year, month } = req.query;
    let filter = {};

    if (year && month) {
      // Fetch holidays that overlap with the requested month:
      // overlap = startDate <= monthEnd AND endDate >= monthStart
      const monthStart = new Date(Number(year), Number(month) - 1, 1);
      const monthEnd = new Date(Number(year), Number(month), 0, 23, 59, 59);
      filter = {
        startDate: { $lte: monthEnd },
        endDate: { $gte: monthStart },
      };
    } else if (year) {
      const yearStart = new Date(Number(year), 0, 1);
      const yearEnd = new Date(Number(year), 11, 31, 23, 59, 59);
      filter = {
        startDate: { $lte: yearEnd },
        endDate: { $gte: yearStart },
      };
    }

    const holidays = await Holiday.find(filter).sort({ startDate: 1 });
    res.status(200).json({ message: "Holidays retrieved", holidays });
  })
);

// POST create holiday (admin only)
holidayRouter.post(
  "/",
  authUser,
  authorizeRoles("admin"),
  asyncHandler(async (req, res) => {
    const { title, startDate, endDate, description, type } = req.body;
    if (!title || !startDate || !endDate) {
      return res.status(400).json({ message: "Title, startDate, and endDate are required" });
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      return res.status(400).json({ message: "endDate must be on or after startDate" });
    }
    const holiday = new Holiday({ title, startDate: start, endDate: end, description, type });
    await holiday.save();
    res.status(201).json({ message: "Holiday created successfully", holiday });
  })
);

// PATCH update holiday (admin only)
holidayRouter.patch(
  "/:id",
  authUser,
  authorizeRoles("admin"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, startDate, endDate, description, type } = req.body;
    const holiday = await Holiday.findById(id);
    if (!holiday) return res.status(404).json({ message: "Holiday not found" });

    if (title) holiday.title = title;
    if (description !== undefined) holiday.description = description;
    if (type) holiday.type = type;

    const newStart = startDate ? new Date(startDate) : holiday.startDate;
    const newEnd = endDate ? new Date(endDate) : holiday.endDate;
    if (newEnd < newStart) {
      return res.status(400).json({ message: "endDate must be on or after startDate" });
    }
    holiday.startDate = newStart;
    holiday.endDate = newEnd;

    await holiday.save();
    res.status(200).json({ message: "Holiday updated successfully", holiday });
  })
);

// DELETE holiday (admin only)
holidayRouter.delete(
  "/:id",
  authUser,
  authorizeRoles("admin"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const holiday = await Holiday.findById(id);
    if (!holiday) return res.status(404).json({ message: "Holiday not found" });
    await holiday.deleteOne();
    res.status(200).json({ message: "Holiday deleted successfully" });
  })
);

module.exports = holidayRouter;
