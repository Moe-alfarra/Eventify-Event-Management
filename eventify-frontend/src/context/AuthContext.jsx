import { createContext, useContext, useEffect, useState } from "react";
import {
  clearAuth,
  getStoredRole,
  getStoredToken,
  getStoredUser,
} from "../utils/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const storedToken = getStoredToken();
    const storedRole = getStoredRole();
    const storedUser = getStoredUser();

    setToken(storedToken);
    setRole(storedRole);
    setUser(storedUser);
    setAuthLoading(false);
  }, []);

  const login = (authData) => {
    const tokenValue = authData.token;
    const roleValue = authData.role;

    const userValue = {
      userId: authData.userId,
      name: authData.name,
      email: authData.email,
      role: authData.role,
    };

    localStorage.setItem("token", tokenValue);
    localStorage.setItem("role", roleValue);
    localStorage.setItem("user", JSON.stringify(userValue));

    setToken(tokenValue);
    setRole(roleValue);
    setUser(userValue);
  };

  const logout = () => {
    clearAuth();
    setToken(null);
    setRole(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        user,
        authLoading,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}