import { createContext } from "react";
import type { User } from "./api";
import type { LoginFormValues } from "./schema";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: boolean;
  signIn: (values: LoginFormValues) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
