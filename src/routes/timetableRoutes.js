import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  createTimetableEntry,
  deleteTimetableEntry,
  getTimetableEntries,
  updateTimetableEntry
} from "../controllers/timetableController.js";

const timetableRouter = express.Router();

// GET /api/timetable?teacher=&grade=&dayOfWeek=
timetableRouter.get("/", userAuth, getTimetableEntries);

// POST /api/timetable
timetableRouter.post("/", userAuth, createTimetableEntry);

// PUT /api/timetable/:id
timetableRouter.put("/:id", userAuth, updateTimetableEntry);

// DELETE /api/timetable/:id
timetableRouter.delete("/:id", userAuth, deleteTimetableEntry);

export default timetableRouter;


