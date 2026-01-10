import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";

import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import absenceRouter from "./routes/absenceRoutes.js";
import reliefAssignmentRouter from "./routes/reliefAssignmentRoutes.js";
import announcementRoutes from "./routes/announcements.js";
import timetableRoutes from "./routes/timetableRoutes.js";
import attendanceRouter from "./routes/attendanceRoutes.js";
import teacherSettingsRouter from "./routes/teacherSettingsRoutes.js";
import adminSettingsRoutes from "./routes/adminSettingsRoutes.js";



const app = express();
const PORT = process.env.PORT || 3301;
connectDB();

/* Middleware */
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

/* Routes */
app.get("/", (req, res) => {
  res.json({ message: "Server running" });
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/absence", absenceRouter);
app.use("/api/relief", reliefAssignmentRouter);
app.use("/api/announcements", announcementRoutes);
app.use("/api/timetable", timetableRoutes);
app.use('/api/attendance', attendanceRouter);
app.use("/api/teachers", teacherSettingsRouter);
app.use("/api/admin", adminSettingsRoutes);


/* Test */
app.get("/api/test", (req, res) => {
  res.send("API WORKING");
});

/* 404 */
app.use((req, res) => {
  res.status(404).json({ error: { message: "not found on this server!" } });
});


app.listen(PORT, () => {
  console.log(`Server is running ${PORT}`);
});
