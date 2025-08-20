import dotenv from "dotenv";
dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env" : ".env",
});
import mongoose from "mongoose";
import initApp from "./app";
import logger from "./libs/utils/logger";

// 데이터베이스 연결 및 서버 시작
// Database connection and server startup
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_URL as string, {})
  .then(async () => {
    logger.info("MongoDB successfully connected to the server");
    const PORT = 4000;
    const server = await initApp();

    server.listen(
      {
        port: PORT,
        host: "0.0.0.0",
      },
      (err: any) => {
        if (err) {
          logger.error(err);
          process.exit(1);
        }
        logger.info(`Project running on http://localhost:${PORT}`);
      }
    );
  })
  .catch((err) => {
    logger.error("ERROR on connection MongoDB", err);
  });
