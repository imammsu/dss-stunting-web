/**
 * Titik perakitan aplikasi Express.
 * Jika nanti Anda perlu middleware tambahan seperti rate-limit, helmet, atau logger,
 * file ini adalah tempat paling pas untuk menambahkannya.
 */
import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import apiRoutes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";

const app = express();

const corsOrigins = env.corsOrigin
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    credentials: true,
  }),
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Backend Express + Supabase untuk DSS stunting aktif.",
  });
});

app.use("/api", apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
