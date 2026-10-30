import { api } from "@/lib/api";
import type { LoginFormValues } from "./schema";

export interface User {
  id: number;
  name: string;
  username: string;
}

export async function login(values: LoginFormValues) {
  const response = await api.post<{ access_token: string }>(
    "/v1/auth/login",
    values,
  );

  return response.data.access_token;
}

export async function getCurrentUser(signal?: AbortSignal) {
  const response = await api.get<{ data: User }>("/v1/auth/me", { signal });

  return response.data.data;
}

export async function logout() {
  await api.post("/v1/auth/logout");
}

export async function refreshToken() {
  const response = await api.post<{ access_token: string }>("/v1/auth/refresh");

  return response.data.access_token;
}
