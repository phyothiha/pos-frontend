import { queryClient } from "@/lib/query-client";

const storageKey = "pos.access-token";

export function getToken() {
  return sessionStorage.getItem(storageKey);
}

export function setToken(token: string) {
  sessionStorage.setItem(storageKey, token);
}

export function clearSession() {
  sessionStorage.removeItem(storageKey);
  queryClient.clear();
  window.location.replace("/");
}
