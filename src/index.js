// ----------------------------Third-party libraries & modules----------------------------
import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";

// Global instances
const app = express();
const PORT = process.env.PORT || 3301;
connectDB();

// Common middleware
app.use(cors({credentials:true}));
app.use(express.json());
app.use(cookieParser());

// Base route
app.get("/", (req, res) => {
  res.status(200).json({ success: { message: `Welcome to the server!` } });
});

// Error route
app.use((req, res) => {
  res.status(404).json({ error: { message: `Not found!` } });
});

// Initialize the connection
app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});