import mongoose from "mongoose";
import { Config } from ".";
import logger from "./logger";

const MONGO_URI = Config.MONGO_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI!);
        logger.info("Database connected successfully");
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`Database connection failed: ${error.message}`);
            console.log(`Database connection failed: ${error.message}`);
            setTimeout(() => {
                process.exit(1);
            }, 1000);
        } else {
            logger.error(
                "An unknown error occurred while connecting to the database",
            );
        }
    }
};

export default connectDB;
