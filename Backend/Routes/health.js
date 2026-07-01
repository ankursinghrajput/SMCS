const express = require("express");

const healthRouter = express.Router();

healthRouter.get("/", (req, res) => {
    res.status(200).json({ success: true, message: "Health is good" });
});

module.exports = healthRouter;