const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const serverless = require("serverless-http");
require("dotenv").config();

const certificateRoutes = require("../../routes/certificateRoutes");

const app = express();
app.use(cors());
app.use(express.json());

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log("MongoDB connected");
}

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

app.use("/api/certificates", certificateRoutes);

app.get("/", (req, res) => {
  res.send("API running on Netlify");
});

module.exports.handler = serverless(app);
