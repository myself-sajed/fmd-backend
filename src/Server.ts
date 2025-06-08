import app from "./app";
import { Config } from "./config";
import connectDB from "./config/db";
import logger from "./config/logger";

const startServer = async () => {
    try {
        const PORT = Config.PORT;
        logger.debug("this is a debug");
        await connectDB();
        app.listen(PORT, () => logger.info(`Server running at ${PORT}`));
    } catch (error) {
        if (error instanceof Error) {
            console.log("Could not start server");
            logger.error(error.message);
            setTimeout(() => {
                process.exit(1);
            }, 1000);
        }
    }
};

void startServer();
