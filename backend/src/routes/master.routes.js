/**
 * Route master data.
 * Route ini diproteksi auth karena biasanya data master bersifat internal.
 */
import { Router } from "express";
import {
  bootstrap,
  buatDesa,
  listAlternatives,
  listCriteria,
  listPembobotan,
  updateDesa,
  buatPembobotan,
  detailPembobotan,
  ubahPembobotan,
} from "../controllers/master.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);
router.get("/criteria", listCriteria);
router.get("/alternatives", listAlternatives);
router.get("/pembobotan", listPembobotan);
router.get("/bootstrap", bootstrap);
router.post("/alternatifDesa", buatDesa);
router.put("/alternatifDesa/:id", updateDesa);
router.post("/pembobotan", buatPembobotan);
router.get("/pembobotan/:id", detailPembobotan);
router.put("/pembobotan/:id", ubahPembobotan);

export default router;
