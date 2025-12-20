const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const serverless = require("serverless-http");

mongoose.set("bufferCommands", false);

const certificateRoutes = require("./routes/certificateRoutes");

const app = express();
app.use(cors());
app.use(express.json());

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI)
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// ✅ Ensure DB before every request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection failed", err);
    res.status(500).json({ message: "Database connection failed" });
  }
});

// ✅ Routes
app.use("/certificates", certificateRoutes);

app.get("/", (req, res) => {
  res.send("API running on Netlify");
});

// ❌ basePath REMOVE
module.exports.handler = serverless(app);
