/**
 * Middleware error global.
 * Jika Anda ingin format response error lain, ubah file ini saja.
 */
import { ApiError } from "../utils/apiError.js";

export const notFoundHandler = (req, _res, next) => {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} tidak ditemukan.`));
};

export const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode ?? 500;

  res.status(statusCode).json({
    success: false,
    message: error.message ?? "Terjadi kesalahan pada server.",
    details: error.details ?? null,
  });
};
