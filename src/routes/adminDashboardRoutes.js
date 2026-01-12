import express from "express";
import { getTodayAttendanceSummary } from "../controllers/adminDashboardController.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

// Dashboard: total teachers + today's attendance + pending leave count
router.get("/stats/today-summary", userAuth, getTodayAttendanceSummary);

export default router;
