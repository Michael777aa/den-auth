import dotenv from "dotenv";
dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.production" : ".env",
});
import mongoose from "mongoose";
import initApp from "./app";

// Database connection and server startup
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_URL as string, {})
  .then(async () => {
    console.log("MongoDB connection succeeded");
    const PORT = process.env.PORT ?? 3000;
    const server = await initApp();

    server.listen(
      {
        port: Number(PORT),
        host: "0.0.0.0",
      },
      (err) => {
        if (err) {
          console.error(err);
          process.exit(1);
        }
        console.log(`\nProject running on http://localhost:${PORT}`);
      }
    );
  })
  .catch((err) => {
    console.log("ERROR on connection MongoDB", err);
  });
