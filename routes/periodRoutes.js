const express = require("express");
const router = express.Router();
const periodController = require("../controllers/periodController");

// Log a new period (first day of the period)
router.post("/log", periodController.logPeriod);

// Log a daily period
router.post("/log/daily", periodController.logDailyPeriod);

// Get the last period logged
router.get("/last", periodController.getLastPeriodLog);

// Get all logged period dates
router.get("/logged", periodController.getLoggedPeriods);

// Get calendar data (logged, predicted periods, phases, etc.)
router.get("/calendar-data", periodController.getCalendarData);

module.exports = router;
