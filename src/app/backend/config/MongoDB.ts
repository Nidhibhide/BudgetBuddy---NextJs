import mongoose from "mongoose";

async function dbConnect() {
  // If already connected, skip reconnection
  if (mongoose.connection.readyState >= 1) {
    console.log("Already connected to database");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URL || "", {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, // Increased timeout
      socketTimeoutMS: 45000,
      maxIdleTimeMS: 30000,
      heartbeatFrequencyMS: 10000,
    });

    console.log("DB connected Successfully");
  } catch (error) {
    console.log("Database connection failed", error);
    process.exit(1); // Stops the app due to a DB connection error.
  }
}

export default dbConnect;
