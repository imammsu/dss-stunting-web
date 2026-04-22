/**
 * Route DSS.
 */
import { Router } from "express";
import {
  ahpWeights,
  evaluate,
  rankFromDatabase,
  topsisRank,
  listRiwayat,
  detailRiwayat,
  hapusRiwayat,
} from "../controllers/decision.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);
router.post("/ahp/weights", ahpWeights);
router.post("/topsis/rank", topsisRank);
router.post("/evaluate", evaluate);
router.post("/rank-from-database", rankFromDatabase);
router.get("/riwayat", listRiwayat);
router.get("/riwayat/:id", detailRiwayat);
router.delete("/riwayat/:id", hapusRiwayat);

export default router;
