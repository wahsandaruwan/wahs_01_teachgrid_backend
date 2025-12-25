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
import teacherSettingsRouter from "./routes/teacherSettingsRoutes.js";
import adminSettingsRoutes from "./routes/adminSettingsRoutes.js";
import reliefDutyRouter from "./routes/reliefDutyRoutes.js";

// Global instances
const app = express();
const API_URL = process.env.VITE_API_URL;
const PORT =
  process.env.PORT || (API_URL.includes(":") ? API_URL.split(":").pop() : 3301);
connectDB();

//  Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Base route
app.get("/", (req, res) => {
  res
    .status(200)
    .json({ success: { message: "Welcome to the TeachGrid Server!" } });
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/absence", absenceRouter);
app.use("/api/relief", reliefAssignmentRouter);
app.use("/api/announcements", announcementRoutes);
app.use("/api/teachers", teacherSettingsRouter);
app.use("/api/admin", adminSettingsRoutes);
app.use("/api/relief-duty", reliefDutyRouter);

// Error route
app.use((req, res) => {
  res.status(404).json({ error: { message: "not found on this server!" } });
});

// Initialize the server listener
app.listen(PORT, () => {
  console.log(`Server is running ${PORT}`);
});
