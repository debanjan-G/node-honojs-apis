import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Connected to DB");
  } catch (error) {
    console.log("Connection to DB failed: ", error);
  }
};

export default connectDb;
