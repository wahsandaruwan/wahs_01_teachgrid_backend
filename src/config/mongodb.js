import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("Database Connected to TeachGrid")
    );

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "teachgrid",
    });
  } catch (error) {
    console.log("Database connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
