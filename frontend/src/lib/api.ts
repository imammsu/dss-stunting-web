/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Helper HTTP frontend untuk berbicara dengan backend Express.
 * File ini juga menyimpan session Supabase yang diterima dari backend login.
 */
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(
  /\/$/,
  "",
);
const SESSION_STORAGE_KEY = "stunting-dss-auth-session";

export interface AuthUser {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser | null;
}

interface SessionPayload {
  user: AuthUser | null;
  session: {
    access_token: string;
    refresh_token: string;
  } | null;
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  details?: unknown;
}

export class FrontendApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status = 500, details: unknown = null) {
    super(message);
    this.name = "FrontendApiError";
    this.status = status;
    this.details = details;
  }
}

const buildUrl = (path: string) => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const parseJson = async <T>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    return null;
  }
};

const readStoredSession = (): StoredSession | null => {
  const rawValue = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as StoredSession;
  } catch (_error) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
};

const persistStoredSession = (session: StoredSession) => {
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

export const getStoredSession = () => readStoredSession();

export const clearStoredSession = () => {
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
};

export const saveSessionFromPayload = (payload: SessionPayload) => {
  if (!payload.session?.access_token || !payload.session?.refresh_token) {
    throw new FrontendApiError("Session dari backend tidak lengkap.");
  }

  const session: StoredSession = {
    accessToken: payload.session.access_token,
    refreshToken: payload.session.refresh_token,
    user: payload.user ?? null,
  };

  persistStoredSession(session);
  return session;
};

const rawFetch = async <T>(
  path: string,
  {
    method = "GET",
    body,
    accessToken,
  }: {
    method?: string;
    body?: unknown;
    accessToken?: string;
  } = {},
) => {
  const headers = new Headers({
    Accept: "application/json",
  });

  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(buildUrl(path), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await parseJson<ApiEnvelope<T>>(response);

  return { response, payload };
};

export const refreshStoredSession = async () => {
  const currentSession = readStoredSession();

  if (!currentSession?.refreshToken) {
    clearStoredSession();
    throw new FrontendApiError("Session login tidak ditemukan.", 401);
  }

  const { response, payload } = await rawFetch<SessionPayload>(
    "/auth/refresh",
    {
      method: "POST",
      body: {
        refreshToken: currentSession.refreshToken,
      },
    },
  );

  if (!response.ok || !payload?.success || !payload.data) {
    clearStoredSession();
    throw new FrontendApiError(
      payload?.message || "Gagal memperbarui session login.",
      response.status || 401,
      payload?.details,
    );
  }

  return saveSessionFromPayload(payload.data);
};

export const requestJson = async <T>(
  path: string,
  {
    method = "GET",
    body,
    auth = false,
    retryOnUnauthorized = true,
  }: {
    method?: string;
    body?: unknown;
    auth?: boolean;
    retryOnUnauthorized?: boolean;
  } = {},
): Promise<T> => {
  const storedSession = readStoredSession();
  const firstAttempt = await rawFetch<T>(path, {
    method,
    body,
    accessToken: auth ? storedSession?.accessToken : undefined,
  });

  let resolved = firstAttempt;

  if (
    firstAttempt.response.status === 401 &&
    auth &&
    retryOnUnauthorized &&
    storedSession?.refreshToken
  ) {
    const refreshedSession = await refreshStoredSession();
    resolved = await rawFetch<T>(path, {
      method,
      body,
      accessToken: refreshedSession.accessToken,
    });
  }

  if (!resolved.response.ok || !resolved.payload?.success) {
    throw new FrontendApiError(
      resolved.payload?.message || "Permintaan ke backend gagal.",
      resolved.response.status,
      resolved.payload?.details,
    );
  }

  return resolved.payload.data;
};
