import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

const TOKEN_KEY = "ozh_token";
const USER_KEY = "ozh_user";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated: !!token,

    login(authData) {
      // save immediately so first protected request already has token
      localStorage.setItem(TOKEN_KEY, authData.token);
      localStorage.setItem(USER_KEY, JSON.stringify(authData.user));

      setToken(authData.token);
      setUser(authData.user);
    },

    logout() {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      setToken("");
      setUser(null);

      window.location.href = "/login";
    }
  }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}