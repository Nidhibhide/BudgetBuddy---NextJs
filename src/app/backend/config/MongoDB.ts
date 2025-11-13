import mongoose from "mongoose";

async function dbConnect() {
  // If already connected, skip reconnection
  if (mongoose.connection.readyState >= 1) {
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    process.exit(1); // Stops the app due to a DB connection error.
  }
}

export default dbConnect;
