import mongoose from "mongoose";

// import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import router from "./routes/todos.js";

import dotenv from "dotenv";
dotenv.config();

const app = express();
// app.use(bodyParser.json());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () =>
      console.log(`Server is running on port http://localhost:${process.env.PORT}`)
    );
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Failed to connect to MongoDB");
    console.log(error.message);
  });

// 使用todos路由
app.use("/api/todos", router);

app.get("/heartbeat", (_, res) => {
  return res.send({ message: "Hello World!" });
});
