import express from "express";
import { getTotalTeachers } from "../controllers/adminDashboardController.js";

const router = express.Router();

router.get("/stats/total-teachers", getTotalTeachers);

export default router;
