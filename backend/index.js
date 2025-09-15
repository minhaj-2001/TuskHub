// backend/index.js
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import routes from "./routes/index.js";

dotenv.config();

const app = express();
// Improved CORS configuration for multiple origins
const allowedOrigins = [
  process.env.FRONTEND_URL, // Production frontend (Vercel)
  "http://localhost:5173", // Local development
  "http://localhost:3000", // Alternative local port
  "https://work-stage-tracker-final.vercel.app" // Explicit production URL
].filter(Boolean); // Remove any undefined values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in the allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

// Logging middleware
app.use(morgan("dev"));

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Database connected successfully"))
  .catch((err) => console.log("❌ Failed to connect to DB:", err));

// JSON parsing middleware
app.use(express.json());

// Root route
app.get("/", async (req, res) => {
  res.status(200).json({
    message: "Welcome to TaskHub API",
    version: "1.0.0",
    status: "Running"
  });
});

// API routes
app.use("/api-v1", routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.stack);
  res.status(500).json({ 
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
    method: req.method
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Allowed origins: ${allowedOrigins.join(', ')}`);
});