import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();



const MONGO_URI = process.env.MONGO_URI as string;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME as string;
const MONGO_USERNAME = process.env.MONGO_USER_NAME as string;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD as string;

if (!MONGO_URI && !MONGO_USERNAME && !MONGO_PASSWORD && !MONGO_DB_NAME) {
  console.error('Mongo db credentials is not defined in .env file');
  process.exit(1);
}

// Connect to MongoDB function
export const connectToDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URI, {
      auth: {
        username: MONGO_USERNAME,
        password: MONGO_PASSWORD
      },
      dbName: MONGO_DB_NAME
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
};


