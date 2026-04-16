/**
 * Route DSS.
 * Secara default route ini diproteksi auth agar hasil analisis hanya bisa diakses user login.
 * Jika Anda ingin route tertentu menjadi publik, hapus middleware auth di endpoint terkait.
 */
import { Router } from "express";
import {
  ahpWeights,
  evaluate,
  rankFromDatabase,
  topsisRank,
} from "../controllers/decision.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);
router.post("/ahp/weights", ahpWeights);
router.post("/topsis/rank", topsisRank);
router.post("/evaluate", evaluate);
router.post("/rank-from-database", rankFromDatabase);

export default router;
