// Loads and validates required environment variables at startup.
// Any missing variable throws immediately so errors are obvious.

import dotenv from 'dotenv';
dotenv.config();

const required = ['MONGO_URI', 'JWT_SECRET'];

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // FIXED: Wrapped the fallback URI in quotes
  mongoUri: process.env.MONGO_URI || 'mongodb+srv://sarkararitra2003_db_user:Qwaszx%401234@cluster0.cbn6n4f.mongodb.net/waste_management?retryWrites=true&w=majority',
  
  // FIXED: Wrapped the hex secret in quotes
  jwtSecret: process.env.JWT_SECRET || '33d871d691685eda7171ec215a3e5405',
  
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  openaiApiKey: process.env.OPENAI_API_KEY || null,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10),
};