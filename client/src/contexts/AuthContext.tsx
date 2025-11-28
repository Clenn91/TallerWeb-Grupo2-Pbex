import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authAPI } from "../services/api";
import type { User } from "../types/index";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      authAPI
        .getCurrentUser()
        .then((response) => {
          setUser(response.data.data);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await authAPI.login(username, password);
      // La respuesta tiene estructura: { success: true, data: { token, user } }
      const responseData = response.data as { success?: boolean; data?: { token: string; user: User } };
      if (responseData.data) {
        const { token, user: userData } = responseData.data;
        localStorage.setItem("token", token);
        // Actualizar el estado del usuario inmediatamente
        setUser(userData);
        // Forzar actualización del loading
        setLoading(false);
        return { success: true };
      }
      return { success: false, message: "Error en la respuesta del servidor" };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al iniciar sesión",
      };
    }
  };

  const logout = (): void => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

