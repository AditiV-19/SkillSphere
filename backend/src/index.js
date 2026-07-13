import dotenv from "dotenv/config";
import http from "http";

import connectDB from "./config/database.js";
import app from "./app.js";

import { initializeSocket } from "./utils/sockets.js";

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

initializeSocket(server);

const startServer = async () => {
  try {
    await connectDB();

    app.on("error", (error) => {
      console.error("Application Error:", error);
      throw error;
    });

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed!", error);
  }
};

startServer();