/**
 * Route CSV.
 * Download template dan upload/validasi data CSV.
 */
import { Router } from "express";
import { downloadTemplate, uploadAndValidateCsv } from "../controllers/csv.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);
router.get("/template", downloadTemplate);
router.post("/upload", uploadAndValidateCsv);

export default router;
