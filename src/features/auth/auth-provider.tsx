import { useEffect, useState, type ReactNode } from "react";
import { AuthContext } from "./context";
import type { LoginFormValues } from "./schema";
import { getCurrentUser, login, logout, type User } from "./api";
import { clearSession, getToken, setToken } from "./session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(getToken()));
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!getToken()) return;

    getCurrentUser()
      .then(setUser)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  async function signIn(values: LoginFormValues) {
    const token = await login(values);
    setToken(token);
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  }

  async function signOut() {
    await logout();
    clearSession();
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
