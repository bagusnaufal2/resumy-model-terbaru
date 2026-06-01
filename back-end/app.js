import express from "express";
import cors from "cors";
import analyzeRoutes from "./routes/analyzeRoutes.js";
import roadmapGenRoutes from "./routes/roadmapRoutes.js";

const app = express();
const configuredOrigins = String(process.env.FRONTEND_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || configuredOrigins.length === 0) {
        return callback(null, true);
      }

      if (configuredOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS."));
    },
  })
);

app.use(express.json());
app.use("/api", analyzeRoutes);
app.use("/api", roadmapGenRoutes);

app.use((error, req, res, next) => {
    if (!error) {
        return next();
    }

    return res.status(400).json({
        success: false,
        message: error.message || "Could not process the uploaded resume."
    });
});

export default app;
