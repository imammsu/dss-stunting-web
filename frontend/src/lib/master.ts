/**
 * Wrapper endpoint data master frontend.
 */
import type { Village } from "@/data/villages";
import { requestJson } from "./api";
import type { BackendBootstrap, BackendPembobotan } from "./mappers";

export const fetchBootstrapData = async () => {
  return requestJson<BackendBootstrap>("/master/bootstrap", {
    auth: true,
  });
};

export const fetchPembobotan = async () => {
  return requestJson<BackendPembobotan[]>(
    "/master/pembobotan",
    {
      auth: true,
    }
  );
};

export const submitAlternativeDesa = async (village: Village) => {
  return requestJson<{ id: number }>("/master/alternatifDesa", {
    auth: true,
    method: "POST",
    body: {
      name: village.name,
      district: village.district,
      lat: village.lat,
      lng: village.lng,
      values: village.values,
    },
  });
};

export const updateAlternativeDesa = async (village: Village) => {
  return requestJson<{ id: number }>(`/master/alternatifDesa/${village.id}`, {
    auth: true,
    method: "PUT",
    body: {
      name: village.name,
      district: village.district,
      lat: village.lat,
      lng: village.lng,
      values: village.values,
    },
  });
};

export const submitPembobotan = async (payload: {
  nama: string;
  cr: number;
  bobotHasil: Record<string, number>;
  preferences: Array<{ kriteria_1: string; kriteria_2: string; nilai: number }>;
}) => {
  return requestJson<{ id: number; message: string }>("/master/pembobotan", {
    auth: true,
    method: "POST",
    body: payload,
  });
};

export interface BackendPairwise {
  id: number;
  id_pembobotan_kriteria: number;
  kriteria_1: number;
  kriteria_2: number;
  nilai: number;
  k1_kode?: string;
  k2_kode?: string;
}

export const fetchPembobotanDetail = async (id: number) => {
  return requestJson<BackendPairwise[]>(`/master/pembobotan/${id}`, {
    auth: true,
  });
};

export const updatePembobotanApi = async (id: number, payload: {
  nama: string;
  cr: number;
  bobotHasil: Record<string, number>;
  preferences: Array<{ kriteria_1: string; kriteria_2: string; nilai: number }>;
}) => {
  return requestJson<{ id: number; message: string }>(`/master/pembobotan/${id}`, {
    auth: true,
    method: "PUT",
    body: payload,
  });
};

export const deleteAlternativeDesa = async (id: number) => {
  return requestJson<{ message: string }>(`/master/alternatifDesa/${id}`, {
    auth: true,
    method: "DELETE",
  });
};

export const deletePembobotanApi = async (id: number) => {
  return requestJson<{ message: string }>(`/master/pembobotan/${id}`, {
    auth: true,
    method: "DELETE",
  });
};
