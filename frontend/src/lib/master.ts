/**
 * Wrapper endpoint data master frontend.
 */
import { requestJson } from "./api";
import type { BackendBootstrap } from "./mappers";

export const fetchBootstrapData = async () => {
  return requestJson<BackendBootstrap>("/master/bootstrap", {
    auth: true,
  });
};
