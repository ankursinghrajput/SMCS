const express = require("express");
const { authUser, authorizeRoles } = require("../middlewares/auth");
const asyncHandler = require("express-async-handler");
const facultyRouter = express.Router();

facultyRouter.get("/dashboard", authUser, authorizeRoles("admin", "faculty"), (req, res) => {
    res.status(200).json({ message: "Welcome to the Faculty Dashboard", user: req.user });
});

module.exports = facultyRouter;
