const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const serverless = require("serverless-http");

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
    cached.promise = mongoose.connect(process.env.MONGO_URI).then((mongoose) => {
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

connectDB().then(() => console.log("MongoDB connected"));

app.use("/api/certificates", certificateRoutes);

app.get(["/", "/.netlify/functions/api"], (req, res) => {
  res.send("API running on Netlify");
});

app.get("*", (req, res) => {
  res.json({
    message: "Netlify API working",
    path: req.path,
  });
});

module.exports.handler = serverless(app);
