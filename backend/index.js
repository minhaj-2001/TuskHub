import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import routes from "./routes/index.js";

dotenv.config();

const app = express();

// Get allowed origins from environment variables
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://localhost:3000",
  "https://work-stage-tracker-final.vercel.app", // Your deployed frontend URL
  "https://*.vercel.app" // Allow all Vercel deployments
].filter(Boolean);

// Configure CORS with more permissive settings for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in the allowed list
    if (allowedOrigins.some(allowedOrigin => {
      // Handle wildcard domains
      if (allowedOrigin.includes('*')) {
        const regex = new RegExp(allowedOrigin.replace('*', '.*'));
        return regex.test(origin);
      }
      return allowedOrigin === origin;
    })) {
      return callback(null, true);
    } else {
      console.log("Origin not allowed by CORS:", origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200,
  preflightContinue: false,
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options("*", cors(corsOptions));

// Logging middleware
app.use(morgan("dev"));

// JSON parsing middleware
app.use(express.json());

// Add a middleware to log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin || 'None'}`);
  next();
});

// Database connection with error handling
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Database connected successfully"))
  .catch((err) => {
    console.log("❌ Failed to connect to DB:", err);
    process.exit(1); // Exit if we can't connect to the database
  });

// Root route
app.get("/", async (req, res) => {
  res.status(200).json({
    message: "Welcome to TaskHub API",
    version: "1.0.0",
    status: "Running"
  });
});

// Keep-alive endpoint for Render
app.get("/ping", (req, res) => {
  res.status(200).send("OK");
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