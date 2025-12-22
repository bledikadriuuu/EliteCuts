import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';
import { connectDb } from './config/db.js';

dotenv.config();

const port = process.env.PORT || 4000;

const start = async () => {
  try {
    await connectDb();
    app.listen(port, () => {
      console.log(`Backend listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

start();
