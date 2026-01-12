import express from "express";
import { getTodayAttendanceSummary, getTodayTeacherAvailability, getTeacherAvailabilityByDate } from "../controllers/adminDashboardController.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

router.get("/stats/today-summary", userAuth, getTodayAttendanceSummary);
router.get("/availability/today", userAuth, getTodayTeacherAvailability);
router.get("/availability", userAuth, getTeacherAvailabilityByDate);

export default router;
