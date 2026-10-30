import { useContext } from "react";
import { useMutation } from "@tanstack/react-query";
import { AuthContext } from "./context";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}

export function useLogin() {
  const { signIn } = useAuth();
  return useMutation({ mutationFn: signIn });
}

export function useLogout() {
  const { signOut } = useAuth();
  return useMutation({ mutationFn: signOut });
}
