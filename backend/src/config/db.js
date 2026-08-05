import mongoose from 'mongoose';
import { env } from './env.js';

// Configure Mongoose strict options
mongoose.set('strict', true);
mongoose.set('strictQuery', true);

// Mongoose connection event handlers
mongoose.connection.on('connected', () => {
  console.log('\x1b[32m[Database] MongoDB connection established successfully.\x1b[0m');
});

mongoose.connection.on('error', (err) => {
  console.error(`\x1b[31m[Database] Connection error:\x1b[0m ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('\x1b[33m[Database] MongoDB connection lost.\x1b[0m');
});

const MAX_RETRIES = 5;
const INITIAL_RETRY_INTERVAL_MS = 2000;

export const connectDB = async (retryCount = 0) => {
  try {
    const conn = await mongoose.connect(env.mongoUri, {
      autoIndex: env.isDev, // Automatically build indexes in dev, disabled in prod for performance
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`\x1b[36m[Database] Connected to MongoDB host: ${conn.connection.host} / db: ${conn.connection.name}\x1b[0m`);
    return conn;
  } catch (error) {
    console.error(`\x1b[31m[Database] Initial connection failed (Attempt ${retryCount + 1}/${MAX_RETRIES}): ${error.message}\x1b[0m`);

    if (retryCount < MAX_RETRIES - 1) {
      const delay = INITIAL_RETRY_INTERVAL_MS * Math.pow(2, retryCount);
      console.log(`\x1b[33m[Database] Retrying connection in ${delay / 1000}s...\x1b[0m`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return connectDB(retryCount + 1);
    } else {
      console.error('\x1b[31m[Database] Max reconnection retries reached. Exiting application.\x1b[0m');
      process.exit(1);
    }
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('\x1b[32m[Database] MongoDB connection closed gracefully.\x1b[0m');
  } catch (error) {
    console.error(`\x1b[31m[Database] Error during disconnection: ${error.message}\x1b[0m`);
  }
};
