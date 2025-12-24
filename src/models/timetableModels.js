import mongoose from "mongoose";

const TimetableSchema = new mongoose.Schema(
  {
    grade: {
      type: String,
      required: true,
      unique: true,
    },
    table: {
      type: Array,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Timetable", TimetableSchema);
