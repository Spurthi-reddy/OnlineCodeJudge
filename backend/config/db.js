import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/online-code-judge');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // In serverless / development, we don't necessarily want to force-kill the process,
    // but in traditional environments we do. We will log and let the server attempt to run or fail gracefully.
  }
};

export default connectDB;
