// ---------------------------- Third-party libraries ----------------------------
import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";

// ---------------------------- DB & Routes ----------------------------
import connectDB from "./config/mongodb.js";

import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import absenceRouter from "./routes/absenceRoutes.js";
import reliefAssignmentRouter from "./routes/reliefAssignmentRoutes.js";
import announcementRoutes from "./routes/announcementsRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js"; 

// ---------------------------- App Init ----------------------------
const app = express();
const PORT = process.env.PORT || 3301;

// ---------------------------- DB Connection ----------------------------
connectDB()
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });

// ---------------------------- Middleware ----------------------------
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// ---------------------------- Base Route ----------------------------
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Welcome to TeachGrid API server!",
  });
});

// ---------------------------- API Routes ----------------------------
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/absence", absenceRouter);
app.use("/api", reliefAssignmentRouter);
app.use("/api/announcements", announcementRoutes);
app.use("/api/timetables", timetableRoutes);

// ---------------------------- Global Error Handler ----------------------------
app.use((err, req, res, next) => {
  console.error("❌ Global Error:", err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
    },
  });
});

// ---------------------------- 404 Handler ----------------------------
app.use((req, res) => {
  res.status(404).json({ error: { message: "Route not found!" } });
});

// ---------------------------- Server Start ----------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
