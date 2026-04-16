/**
 * Helper kecil untuk merangkai identifier SQL dengan aman dari konfigurasi lokal.
 * Jangan gunakan helper ini untuk input user langsung.
 */
import { ApiError } from "./apiError.js";

export const quoteIdentifier = (identifier) => {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier)) {
    throw new ApiError(
      500,
      `Identifier SQL tidak valid: ${identifier}. Cek file tableMap.js.`,
    );
  }

  return `"${identifier}"`;
};
