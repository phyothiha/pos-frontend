import { queryClient } from "@/lib/query-client";

const storageKey = "pos.access-token";

export function getToken() {
  return localStorage.getItem(storageKey);
}

export function setToken(token: string) {
  localStorage.setItem(storageKey, token);
}

export function clearSession() {
  localStorage.removeItem(storageKey);
  queryClient.clear();
  window.location.replace("/");
}
