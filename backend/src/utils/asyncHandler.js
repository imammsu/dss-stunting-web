/**
 * Wrapper async agar controller tetap ringkas tanpa try/catch berulang.
 */
export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);
