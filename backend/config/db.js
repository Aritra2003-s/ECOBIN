import mongoose from 'mongoose';
import { config } from './env.js'; // Ensure this path is correct

const connectDB = async () => {
  try {
    const uri = config.mongoUri;

    // Safety check to prevent the "Invalid Scheme" error
    if (!uri || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
      throw new Error('Check your .env file: MONGO_URI is missing or formatted incorrectly.');
    }

    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1); // Stop the server if the DB fails
  }
};

export default connectDB;