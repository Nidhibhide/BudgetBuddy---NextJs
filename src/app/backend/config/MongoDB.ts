import mongoose from "mongoose";
import { ConnectionObject } from '../../types';

// Initialize connection object
const connection: ConnectionObject = {};

async function dbConnect() {
  // If already connected (readyState = 1), skip reconnection
  if (connection.isConnected) {
    console.log("Already connected to database");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URL || "", {});

    // Store the connection state
    connection.isConnected = db.connections[0].readyState;

    console.log("DB connected Successfully");
  } catch (error) {
    console.log("Database connection failed", error);
    process.exit(1); // Stops the app due to a DB connection error.
  }
}

export default dbConnect;
