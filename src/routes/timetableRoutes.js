import express from "express";
import Timetable from "../models/timetableModels.js";

const router = express.Router();

// 🔄 GET timetable by grade
router.get("/:grade", async (req, res, next) => {
  try {
    const timetable = await Timetable.findOne({
      grade: req.params.grade,
    });

    if (!timetable) {
      return res.status(404).json({
        message: "Timetable not found",
      });
    }

    res.json({
      grade: timetable.grade,
      table: timetable.table,
    });
  } catch (err) {
    next(err);
  }
});

// 💾 CREATE / UPDATE timetable
router.post("/", async (req, res, next) => {
  try {
    const { grade, table } = req.body;

    if (!grade || !Array.isArray(table)) {
      return res.status(400).json({
        message: "Invalid request data",
      });
    }

    const saved = await Timetable.findOneAndUpdate(
      { grade },
      { table },
      { upsert: true, new: true }
    );

    res.json({
      message: "Timetable saved",
      data: saved,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
