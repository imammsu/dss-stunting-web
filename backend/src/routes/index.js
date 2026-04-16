/**
 * Router utama API.
 * Tambahkan route lain di sini jika backend Anda bertambah besar.
 */
import { Router } from "express";
import authRoutes from "./auth.routes.js";
import decisionRoutes from "./decision.routes.js";
import healthRoutes from "./health.routes.js";
import masterRoutes from "./master.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/master", masterRoutes);
router.use("/decision", decisionRoutes);

export default router;
