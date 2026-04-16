/**
 * Route master data.
 * Route ini diproteksi auth karena biasanya data master bersifat internal.
 */
import { Router } from "express";
import {
  bootstrap,
  listAlternatives,
  listCriteria,
} from "../controllers/master.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);
router.get("/criteria", listCriteria);
router.get("/alternatives", listAlternatives);
router.get("/bootstrap", bootstrap);

export default router;
