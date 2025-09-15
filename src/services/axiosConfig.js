/**
 * Configuración base de API para el Sistema de Control de Visitas
 * Integración con Backend FastAPI con Logging Detallado y Manejo de Tokens Mejorado
 */

import axios from "axios";

// URL base de tu backend
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api/v1";

// =====================================
// FUNCIONES DE MANEJO DE TOKENS
// =====================================

export const getToken = () => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    console.log("🔍 No token found in localStorage");
    return null;
  }

  // Verificar si el token es válido (formato JWT básico)
  if (token.split(".").length === 3) {
    try {
      // Decodificar el payload para verificar expiración
      const payload = JSON.parse(atob(token.split(".")[1]));
      const now = Math.floor(Date.now() / 1000);

      console.log("🔍 Token validation:", {
        tokenLength: token.length,
        hasExpiration: !!payload.exp,
        expiresAt: payload.exp ? new Date(payload.exp * 1000).toLocaleString() : "N/A",
        isExpired: payload.exp ? payload.exp < now : false,
      });

      if (payload.exp && payload.exp < now) {
        console.warn("🕒 Token expirado, removiendo...");
        removeToken();
        return null;
      }

      return token;
    } catch (e) {
      console.error("❌ Token malformado, removiendo...", e);
      removeToken();
      return null;
    }
  } else {
    console.error("❌ Token no tiene formato JWT válido, removiendo...");
    removeToken();
    return null;
  }
};

export const setToken = (token) => {
  if (token && typeof token === "string") {
    // Verificar formato JWT básico
    if (token.split(".").length === 3) {
      localStorage.setItem("access_token", token);
      console.log("✅ Token guardado correctamente");
    } else {
      console.error(
        "❌ Intento de guardar token inválido (no es JWT):",
        token.substring(0, 20) + "..."
      );
    }
  } else {
    console.error("❌ Intento de guardar token inválido:", typeof token, token);
  }
};

export const removeToken = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user_data");
  console.log("🗑️ Token y datos de usuario removidos");
};

export const isAuthenticated = () => {
  return !!getToken();
};

// =====================================
// CONFIGURACIÓN DE AXIOS
// =====================================

// Configuración base de Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 segundos
});

// Interceptor para REQUESTS
api.interceptors.request.use(
  (config) => {
    // Obtener y agregar token de autenticación
    const token = getToken();

    // 🔍 DEBUG: Verificar el token
    console.log("🔍 TOKEN DEBUG:", {
      tokenExists: !!token,
      tokenLength: token ? token.length : 0,
      tokenStart: token ? token.substring(0, 20) + "..." : "No token",
      isValidJWT: token ? token.split(".").length === 3 : false,
    });

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 📤 LOG DETALLADO DE REQUEST
    console.group(`📤 API REQUEST: ${config.method?.toUpperCase()} ${config.url}`);
    console.log("🔗 Full URL:", `${config.baseURL}${config.url}`);
    console.log("📋 Headers:", config.headers);
    console.log("📦 Data Type:", typeof config.data);

    // Log diferente según el tipo de datos
    if (config.data instanceof FormData) {
      console.log("📄 FormData entries:");
      for (let [key, value] of config.data.entries()) {
        if (key === "password") {
          console.log(`  ${key}: [HIDDEN]`);
        } else {
          console.log(`  ${key}:`, value);
        }
      }
    } else if (config.data instanceof URLSearchParams) {
      console.log(
        "🔗 URLSearchParams:",
        config.data.toString().replace(/password=[^&]*/g, "password=[HIDDEN]")
      );
    } else {
      console.log("📄 Data:", config.data);
    }

    console.log("⚙️ Config:", {
      timeout: config.timeout,
      transformRequest: config.transformRequest ? "Defined" : "None",
    });
    console.groupEnd();

    return config;
  },
  (error) => {
    console.error("❌ REQUEST ERROR:", error);
    return Promise.reject(error);
  }
);

// Interceptor para RESPONSES
api.interceptors.response.use(
  (response) => {
    // 📥 LOG DETALLADO DE RESPONSE EXITOSO
    console.group(
      `📥 API SUCCESS: ${response.status} ${response.config.method?.toUpperCase()} ${
        response.config.url
      }`
    );
    console.log("✅ Status:", response.status, response.statusText);
    console.log("📋 Headers:", response.headers);
    console.log("📄 Data:", response.data);
    console.groupEnd();

    return response;
  },
  (error) => {
    // 📥 LOG DETALLADO DE ERROR
    console.group(`❌ API ERROR: ${error.config?.method?.toUpperCase()} ${error.config?.url}`);

    if (error.response) {
      const { status, statusText, data, headers } = error.response;

      console.log("🚨 Error Response:");
      console.log("  Status:", status, statusText);
      console.log("  Headers:", headers);
      console.log("  Data:", data);
      console.log("  URL:", error.config?.url);
      console.log("  Method:", error.config?.method);

      // Manejo específico de errores
      switch (status) {
        case 400:
          console.warn("⚠️ Bad Request - Revisa los datos enviados");
          break;
        case 401:
          console.warn("🔐 Unauthorized - Token inválido o credenciales incorrectas");

          // Limpiar token inválido automáticamente
          removeToken();

          // Redirigir al login si no estamos ya ahí
          if (!window.location.pathname.includes("/authentication/sign-in")) {
            console.log("🔄 Redirigiendo al login...");
            setTimeout(() => {
              window.location.href = "/authentication/sign-in";
            }, 1000);
          }
          break;
        case 403:
          console.warn("🚫 Forbidden - Sin permisos para esta acción");
          break;
        case 404:
          console.warn("🔍 Not Found - Endpoint no encontrado");
          break;
        case 422:
          console.warn("📝 Unprocessable Entity - Error de validación");
          if (data.detail) {
            console.log("  Validation Details:", data.detail);
          }
          break;
        case 500:
          console.error("💥 Internal Server Error - Error del servidor");
          break;
      }

      console.groupEnd();

      return Promise.reject({
        status,
        message: data.detail || statusText || error.message,
        data,
        originalError: error,
      });
    } else if (error.request) {
      console.log("🌐 Network Error:");
      console.log("  Request:", error.request);
      console.log("  Message:", error.message);
      console.groupEnd();

      return Promise.reject({
        message: "No se pudo conectar con el servidor. Verifica tu conexión.",
        networkError: true,
        originalError: error,
      });
    } else {
      console.log("⚠️ Setup Error:", error.message);
      console.groupEnd();

      return Promise.reject({
        message: error.message,
        setupError: true,
        originalError: error,
      });
    }
  }
);

// Función helper para uploads de archivos
export const apiUpload = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
  timeout: 30000, // 30 segundos para uploads
});

// Aplicar los mismos interceptors para uploads
apiUpload.interceptors.request.use(api.interceptors.request.handlers[0].fulfilled);
apiUpload.interceptors.response.use(
  api.interceptors.response.handlers[0].fulfilled,
  api.interceptors.response.handlers[0].rejected
);

export default api;
