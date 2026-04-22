/**
 * Wrapper endpoint CSV frontend.
 */
import { requestJson, getStoredSession } from "./api";
import type { Village } from "@/data/villages";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(
  /\/$/,
  "",
);

/** Download CSV template as a file. */
export const downloadCsvTemplate = async () => {
  const session = getStoredSession();
  const headers: HeadersInit = {
    Accept: "text/csv",
  };
  if (session?.accessToken) {
    headers["Authorization"] = `Bearer ${session.accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/csv/template`, { headers });
  if (!response.ok) {
    throw new Error("Gagal mengunduh template CSV.");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "template_data_stunting.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

/** Upload CSV content to backend for validation and return parsed villages. */
export const uploadCsvForValidation = async (
  csvContent: string
): Promise<{ villages: Village[]; errors?: string[] }> => {
  try {
    const data = await requestJson<Village[]>("/csv/upload", {
      auth: true,
      method: "POST",
      body: { csvContent },
    });
    return { villages: data };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Backend returns errors in data.errors for 400 responses
    if (error.details?.errors) {
      return { villages: [], errors: error.details.errors };
    }
    throw error;
  }
};
