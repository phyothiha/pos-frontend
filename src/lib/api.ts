import axios from "axios";
import { refreshToken } from "@/features/auth/api";
import { clearSession, getToken, setToken } from "@/features/auth/session";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;

    if (error.response?.status !== 401 || !request) {
      return Promise.reject(error);
    }

    if (request.url === "/v1/auth/login" || request.url === "/v1/auth/refresh") {
      return Promise.reject(error);
    }

    if (request._retry || !getToken()) {
      clearSession();
      return Promise.reject(error);
    }

    request._retry = true;

    try {
      const newToken = await refreshToken();
      setToken(newToken);
      return api(request);
    } catch (refreshError) {
      clearSession();
      return Promise.reject(refreshError);
    }
  },
);
