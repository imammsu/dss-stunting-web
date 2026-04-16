/**
 * Route auth.
 * Seluruh proses login memanfaatkan Supabase Auth, bukan tabel user manual.
 */
import { Router } from "express";
import {
  login,
  me,
  refreshSession,
  register,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshSession);
router.get("/me", authMiddleware, me);

export default router;
