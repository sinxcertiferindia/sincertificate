const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const serverless = require("serverless-http");

mongoose.set("bufferCommands", false);

const certificateRoutes = require("./routes/certificateRoutes");

const app = express();

// Middleware order is critical: CORS first, then JSON parsing
app.use(cors());
app.use(express.json());

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, opts)
      .then((m) => {
        console.log("MongoDB connected successfully");
        return m;
      })
      .catch((err) => {
        console.error("MongoDB connection error:", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// Path normalization middleware - strip Netlify function prefix
app.use((req, res, next) => {
  // Netlify passes full path like /.netlify/functions/api/certificates
  // We need to strip /.netlify/functions/api to get /certificates
  // Modify req.url (Express will recalculate req.path from req.url)
  if (req.url.startsWith("/.netlify/functions/api")) {
    req.url = req.url.replace("/.netlify/functions/api", "") || "/";
  }
  next();
});

// Ensure DB connection before every request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection failed", err);
    return res.status(500).json({ message: "Database connection failed" });
  }
});

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "API running on Netlify", status: "ok" });
});

// Mount certificate routes
app.use("/certificates", certificateRoutes);

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ 
    message: `Route not found: ${req.method} ${req.path}`,
    availableRoutes: ["GET /", "GET /certificates", "POST /certificates"]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Express error:", err);
  res.status(500).json({ message: "Internal server error" });
});

module.exports.handler = serverless(app);
