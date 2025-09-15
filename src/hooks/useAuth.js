/**
 * Hook personalizado para manejo de autenticación
 */

import { useState, useEffect, useCallback } from "react";
import { authService } from "../services/auth";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar autenticación al inicializar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = authService.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);

          // Opcional: verificar token con el servidor
          // await authService.verifyToken();
        }
      } catch (error) {
        console.error("Error verificando autenticación:", error);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Función de login
  const login = useCallback(async (email, password) => {
    try {
      setIsLoading(true);
      const response = await authService.login(email, password);

      // Guardar datos
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("user_data", JSON.stringify(response.user));

      setUser(response.user);
      setIsAuthenticated(true);

      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función de logout
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Verificar permisos
  const hasPermission = useCallback((requiredRole) => {
    return authService.hasPermission(requiredRole);
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasPermission,
  };
};
