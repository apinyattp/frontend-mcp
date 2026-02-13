"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { auth as authApi } from "./api";
import type { MeResponse, UserGroup } from "./types";

interface AuthState {
  user: MeResponse | null;
  userGroups: UserGroup[];
  token: string | null;
  isLoading: boolean;
  login: (idToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<MeResponse | null>(null);
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (!stored) {
      setIsLoading(false);
      return;
    }
    setToken(stored);
    authApi
      .me()
      .then((me) => {
        setUser(me);
        setUserGroups(me.groups);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(
    async (idToken: string) => {
      const res = await authApi.googleLogin(idToken);
      localStorage.setItem("token", res.accessToken);
      setToken(res.accessToken);

      const me = await authApi.me();
      setUser(me);
      setUserGroups(me.groups);
      router.push("/groups");
    },
    [router],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setUserGroups([]);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ user, userGroups, token, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
