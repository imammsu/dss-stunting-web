/**
 * Wrapper endpoint auth frontend.
 * Semua login dan register tetap diproses oleh backend, lalu backend meneruskan ke Supabase Auth.
 */
import {
  clearStoredSession,
  requestJson,
  saveSessionFromPayload,
  type AuthUser,
  type StoredSession,
} from "./api";

interface AuthPayload {
  user: AuthUser | null;
  session: {
    access_token: string;
    refresh_token: string;
  } | null;
}

export const loginWithPassword = async (email: string, password: string) => {
  const payload = await requestJson<AuthPayload>("/auth/login", {
    method: "POST",
    body: { email, password },
  });

  return saveSessionFromPayload(payload);
};

export const registerWithPassword = async (
  fullName: string,
  email: string,
  password: string,
) => {
  return requestJson<AuthPayload>("/auth/register", {
    method: "POST",
    body: {
      email,
      password,
      metadata: {
        full_name: fullName,
      },
    },
  });
};

export const getCurrentUser = async () => {
  const payload = await requestJson<{ user: AuthUser }>("/auth/me", {
    auth: true,
  });

  return payload.user;
};

export const logoutFromApp = () => {
  clearStoredSession();
};

export type { StoredSession };
