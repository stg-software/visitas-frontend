/**
 * Servicios de API Unificados - Sistema de Control de Visitas
 * CORREGIDO: Manejo de tokens y autenticación mejorado
 */

import api, { apiUpload, setToken, removeToken, getToken } from "./axiosConfig";

// ====================================
// 🔐 SERVICIO DE AUTENTICACIÓN CORREGIDO
// ====================================
export const authService = {
  /**
   * Iniciar sesión con backend real
   * @param {string} username - Email o nombre de usuario
   * @param {string} password - Contraseña
   * @returns {Promise} Datos del token y usuario
   */
  async login(username, password) {
    console.group("🔐 AUTH SERVICE - LOGIN PROCESS");
    console.log("📥 Input received:");
    console.log("  Username:", username);
    console.log("  Password:", password ? "[HIDDEN]" : "EMPTY");

    try {
      // Preparar datos para form-data (OAuth2)
      console.log("📧 Preparing FormData...");
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      console.log("🔤 FormData prepared:");
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, key === "password" ? "[HIDDEN]" : value);
      }

      console.log("🚀 Making API call...");
      const response = await api.post("/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        transformRequest: [
          function (data) {
            console.log("🔄 Transform request called...");
            const params = new URLSearchParams();
            for (const [key, value] of data.entries()) {
              params.append(key, value);
            }
            console.log(
              "🔗 Final URLSearchParams:",
              params.toString().replace(/password=[^&]*/g, "password=[HIDDEN]")
            );
            return params;
          },
        ],
      });

      console.log("✅ Login API call successful!");
      console.log("📦 Response data:", response.data);

      // Verificar que la respuesta tiene el token
      if (response.data.access_token) {
        const token = response.data.access_token;

        console.log("🔍 Token received:", {
          length: token.length,
          isJWT: token.split(".").length === 3,
          start: token.substring(0, 20) + "...",
        });

        // Guardar el token usando la función mejorada
        setToken(token);

        // Guardar información del usuario si está disponible
        if (response.data.user) {
          localStorage.setItem("user_data", JSON.stringify(response.data.user));
          console.log("👤 User data saved:", response.data.user);
        }

        console.log("✅ Login process completed successfully!");
        console.groupEnd();
        return response.data;
      } else {
        console.error("❌ No access_token in response:", response.data);
        console.groupEnd();
        throw new Error("No se recibió token en la respuesta del login");
      }
    } catch (error) {
      console.error("❌ Login failed:");
      console.error("Error object:", error);

      if (error.response) {
        const { status, data } = error.response;
        console.error(`HTTP ${status}:`, data);

        switch (status) {
          case 401:
            console.groupEnd();
            throw new Error("Credenciales inválidas. Verifica tu usuario y contraseña.");
          case 422:
            console.error("Validation error details:", data);
            console.groupEnd();
            throw new Error("Datos de login inválidos. Revisa el formato de los datos.");
          case 429:
            console.groupEnd();
            throw new Error("Demasiados intentos de login. Intenta más tarde.");
          case 500:
            console.groupEnd();
            throw new Error("Error interno del servidor. Contacta al administrador.");
          default:
            console.groupEnd();
            throw new Error(data.detail || `Error HTTP ${status}`);
        }
      } else if (error.request) {
        console.error("Network error:", error.request);
        console.groupEnd();
        throw new Error("No se pudo conectar con el servidor. Verifica tu conexión.");
      } else {
        console.error("Setup error:", error.message);
        console.groupEnd();
        throw new Error("Error inesperado. Inténtalo nuevamente.");
      }
    }
  },

  /**
   * Obtener información del usuario actual
   */
  async getCurrentUserInfo() {
    try {
      console.log("👤 Getting current user info...");
      const response = await api.get("/auth/me");
      console.log("✅ User info retrieved:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error getting user info:", error);

      if (error.status === 401) {
        throw new Error("Token inválido o expirado");
      }

      throw new Error("Error al obtener información del usuario");
    }
  },

  /**
   * Verificar token actual
   */
  async verifyToken() {
    try {
      console.log("🔍 Verifying current token...");
      const token = getToken();

      if (!token) {
        throw new Error("No hay token disponible");
      }

      const response = await api.get("/auth/me");
      console.log("✅ Token verified, user:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Token verification failed:", error);

      if (error.status === 401) {
        removeToken();
      }

      throw new Error("Token inválido");
    }
  },

  /**
   * Cerrar sesión
   */
  async logout() {
    try {
      console.log("🚪 Logging out...");

      // Intentar logout en el backend (opcional)
      try {
        await api.post("/auth/logout");
        console.log("✅ Backend logout successful");
      } catch (error) {
        console.warn("⚠️ Backend logout failed (continuing anyway):", error);
      }
    } catch (error) {
      console.warn("⚠️ Error en logout del backend:", error);
    } finally {
      // Siempre limpiar el frontend
      removeToken();
      console.log("✅ Frontend cleanup completed");

      // Redirigir al login
      window.location.href = "/authentication/sign-in";
    }
  },

  /**
   * Registrar nuevo usuario
   */
  async register(userData) {
    try {
      console.log("📝 Registering new user...");
      const response = await api.post("/auth/register", userData);
      console.log("✅ Registration successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Registration failed:", error);

      if (error.response) {
        const { status, data } = error.response;

        switch (status) {
          case 400:
            throw new Error(data.detail || "Datos de registro inválidos");
          case 409:
            throw new Error("El email ya está registrado en el sistema");
          default:
            throw new Error(data.detail || "Error al registrar usuario");
        }
      } else {
        throw new Error("Error de conexión al registrar usuario");
      }
    }
  },

  /**
   * Obtener datos del usuario desde localStorage
   */
  getCurrentUser() {
    try {
      const userData = localStorage.getItem("user_data");
      const parsed = userData ? JSON.parse(userData) : null;
      console.log("👤 Current user from localStorage:", parsed);
      return parsed;
    } catch (error) {
      console.error("❌ Error al obtener datos del usuario:", error);
      return null;
    }
  },

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated() {
    const hasToken = !!getToken();
    console.log("🔒 Authentication check:", hasToken);
    return hasToken;
  },

  /**
   * Verificar permisos del usuario
   */
  hasPermission(requiredRole) {
    const user = this.getCurrentUser();
    if (!user) return false;

    const roleHierarchy = {
      admin: ["admin", "operator", "user"],
      operator: ["operator", "user"],
      user: ["user"],
    };

    const hasPermission = roleHierarchy[user.role]?.includes(requiredRole) || false;
    console.log(`🔐 Permission check for '${requiredRole}':`, hasPermission);
    return hasPermission;
  },

  /**
   * Refrescar token
   */
  async refreshToken() {
    try {
      console.log("🔄 Refreshing token...");
      const response = await api.post("/auth/refresh");
      const { access_token } = response.data;
      setToken(access_token);
      console.log("✅ Token refreshed successfully");
      return response.data;
    } catch (error) {
      console.error("❌ Token refresh failed:", error);
      this.logout();
      throw new Error("Sesión expirada");
    }
  },
};

// ====================================
// 📊 SERVICIO DE DASHBOARD Y ESTADÍSTICAS
// ====================================

export const dashboardService = {
  /**
   * Obtener estadísticas generales del dashboard
   * @returns {Promise<Object>} Estadísticas del dashboard
   */
  async getStats() {
    try {
      console.log("📊 Getting dashboard stats...");
      const response = await api.get("/dashboard/stats");
      console.log("✅ Dashboard stats retrieved:", response.data);
      return response.data;
    } catch (error) {
      console.warn("⚠️ Dashboard stats not available, using fallback calculation");

      // Fallback: calcular estadísticas manualmente usando otros servicios
      try {
        const visitors = await visitorService.getAll().catch(() => []);
        const visits = await visitService.getAll().catch(() => []);
        const preRegisters = await preRegisterService.getAll().catch(() => []);

        const today = new Date().toISOString().split("T")[0];
        const todayVisits = visits.filter(
          (visit) => visit.check_in_time && visit.check_in_time.startsWith(today)
        );
        const activeVisits = visits.filter((visit) => visit.check_in_time && !visit.check_out_time);
        const pendingApprovals = preRegisters.filter((pr) => pr.status === "pending");

        return {
          total_visitors: visitors.length,
          active_visits: activeVisits.length,
          today_visits: todayVisits.length,
          pending_approvals: pendingApprovals.length,
          total_visits: visits.length,
          approved_visits: visits.filter((v) => v.status === "completed" || v.status === "active")
            .length,
        };
      } catch (fallbackError) {
        console.error("❌ Fallback stats calculation failed:", fallbackError);

        // Si todo falla, devolver datos básicos
        return {
          total_visitors: 0,
          active_visits: 0,
          today_visits: 0,
          pending_approvals: 0,
          total_visits: 0,
          approved_visits: 0,
        };
      }
    }
  },

  /**
   * Obtener actividad reciente
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Array>} Actividad reciente
   */
  async getRecentActivity(limit = 10) {
    try {
      console.log(`📈 Getting recent activity (limit: ${limit})...`);
      const response = await api.get("/dashboard/recent-activity", {
        params: { limit },
      });
      console.log("✅ Recent activity retrieved:", response.data?.length || 0, "items");
      return response.data;
    } catch (error) {
      console.warn("⚠️ Recent activity endpoint not available, using mock data");

      // Fallback: crear actividad mock basada en visits
      try {
        const visits = await visitService.getAll().catch(() => []);
        const recentVisits = visits
          .sort(
            (a, b) =>
              new Date(b.created_at || b.check_in_time) - new Date(a.created_at || a.check_in_time)
          )
          .slice(0, limit)
          .map((visit) => ({
            id: visit.id,
            type: "visit",
            description: `${visit.visitor_name || "Visitante"} - ${
              visit.status === "active" ? "Ingreso registrado" : "Visita completada"
            }`,
            visitor_name: visit.visitor_name,
            status: visit.status || (visit.check_out_time ? "completed" : "active"),
            created_at: visit.created_at || visit.check_in_time,
          }));

        return recentVisits;
      } catch (fallbackError) {
        console.error("❌ Fallback activity calculation failed:", fallbackError);

        // Mock data básico
        const mockActivity = [
          {
            id: 1,
            type: "visit",
            description: "Juan Pérez - Ingreso registrado",
            visitor_name: "Juan Pérez",
            status: "active",
            created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          },
          {
            id: 2,
            type: "approval",
            description: "María López - Visita aprobada",
            visitor_name: "María López",
            status: "approved",
            created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          },
        ];

        return mockActivity.slice(0, limit);
      }
    }
  },

  /**
   * Obtener métricas de tiempo real
   * @returns {Promise<Object>} Métricas en tiempo real
   */
  async getRealTimeMetrics() {
    try {
      console.log("⏱️ Getting real-time metrics...");
      const response = await api.get("/dashboard/realtime");
      console.log("✅ Real-time metrics retrieved:", response.data);
      return response.data;
    } catch (error) {
      console.warn("⚠️ Real-time metrics not available, using mock data");

      return {
        current_visitors: Math.floor(Math.random() * 10),
        system_status: "operational",
        last_update: new Date().toISOString(),
        api_status: "connected",
        database_status: "active",
      };
    }
  },
};

// ====================================
// 👥 SERVICIO DE VISITANTES (mantener existente)
// ====================================
// services/apiServices.js - Visitor Service actualizado para Base64

export const visitorService = {
  // Obtener todos los visitantes
  async getAll() {
    console.log("=== VISITOR SERVICE: GET ALL ===");
    try {
      // Cambio: quitar /api/v1 del path ya que está en baseURL
      const response = await api.get("/visitors");
      console.log("Visitantes obtenidos:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error en getAll:", error);
      throw new Error(error.response?.data?.detail || "Error al obtener visitantes");
    }
  },

  // Crear nuevo visitante con foto en base64
  async create(visitorData) {
    console.log("=== VISITOR SERVICE: CREATE ===");
    console.log("Datos recibidos:", {
      ...visitorData,
      photo_base64: visitorData.photo_base64
        ? `[Base64 de ${visitorData.photo_base64.length} caracteres]`
        : undefined,
    });

    try {
      // Preparar el payload JSON
      const payload = {
        full_name: visitorData.full_name,
        email: visitorData.email,
        phone: visitorData.phone || null,
        company: visitorData.company || null,
        identification: visitorData.identification,
        no_identification: visitorData.no_identification,
        // Incluir foto en base64 si está disponible
        ...(visitorData.photo_base64 && { photo_base64: visitorData.photo_base64 }),
      };

      console.log("Payload a enviar:", {
        ...payload,
        photo_base64: payload.photo_base64
          ? `[Base64 de ${payload.photo_base64.length} caracteres]`
          : undefined,
      });

      // Cambio: quitar /api/v1 del path ya que está en baseURL
      const response = await api.post("/visitors", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Visitante creado exitosamente:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error en create:", error);
      console.error("Response data:", error.response?.data);

      // Manejar errores específicos
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          // Errores de validación de Pydantic
          const validationErrors = error.response.data.detail
            .map((err) => `${err.loc?.join(".")}: ${err.msg}`)
            .join(", ");
          throw new Error(`Errores de validación: ${validationErrors}`);
        } else {
          throw new Error(error.response.data.detail);
        }
      }

      throw new Error("Error al crear visitante");
    }
  },

  // Actualizar visitante existente
  async update(id, visitorData) {
    console.log("=== VISITOR SERVICE: UPDATE ===");
    console.log("ID:", id);
    console.log("Datos recibidos:", {
      ...visitorData,
      photo_base64: visitorData.photo_base64
        ? `[Base64 de ${visitorData.photo_base64.length} caracteres]`
        : undefined,
    });

    try {
      // Preparar el payload JSON
      const payload = {
        full_name: visitorData.full_name,
        email: visitorData.email,
        phone: visitorData.phone || null,
        company: visitorData.company || null,
        identification: visitorData.identification,
        no_identification: visitorData.no_identification,
        // Incluir foto en base64 solo si se proporcionó una nueva
        ...(visitorData.photo_base64 && { photo_base64: visitorData.photo_base64 }),
      };

      console.log("Payload a enviar:", {
        ...payload,
        photo_base64: payload.photo_base64
          ? `[Base64 de ${payload.photo_base64.length} caracteres]`
          : undefined,
      });

      // Cambio: quitar /api/v1 del path ya que está en baseURL
      const response = await api.put(`/visitors/${id}`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Visitante actualizado exitosamente:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error en update:", error);
      console.error("Response data:", error.response?.data);

      // Manejar errores específicos
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          // Errores de validación de Pydantic
          const validationErrors = error.response.data.detail
            .map((err) => `${err.loc?.join(".")}: ${err.msg}`)
            .join(", ");
          throw new Error(`Errores de validación: ${validationErrors}`);
        } else {
          throw new Error(error.response.data.detail);
        }
      }

      throw new Error("Error al actualizar visitante");
    }
  },

  // Obtener visitante por ID
  async getById(id) {
    console.log("=== VISITOR SERVICE: GET BY ID ===");
    console.log("ID:", id);

    try {
      // Cambio: quitar /api/v1 del path ya que está en baseURL
      const response = await api.get(`/visitors/${id}`);
      console.log("Visitante obtenido:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error en getById:", error);
      throw new Error(error.response?.data?.detail || "Error al obtener visitante");
    }
  },

  // Eliminar visitante
  async delete(id) {
    console.log("=== VISITOR SERVICE: DELETE ===");
    console.log("ID:", id);

    try {
      // Cambio: quitar /api/v1 del path ya que está en baseURL
      const response = await api.delete(`/visitors/${id}`);
      console.log("Visitante eliminado exitosamente");
      return response.data;
    } catch (error) {
      console.error("Error en delete:", error);
      throw new Error(error.response?.data?.detail || "Error al eliminar visitante");
    }
  },

  // Buscar visitantes
  async search(query) {
    console.log("=== VISITOR SERVICE: SEARCH ===");
    console.log("Query:", query);

    try {
      // Cambio: quitar /api/v1 del path ya que está en baseURL
      const response = await api.get("/visitors/search", {
        params: { q: query },
      });
      console.log("Resultados de búsqueda:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error en search:", error);
      throw new Error(error.response?.data?.detail || "Error en la búsqueda");
    }
  },

  // Activar/desactivar visitante
  async toggleStatus(id) {
    console.log("=== VISITOR SERVICE: TOGGLE STATUS ===");
    console.log("ID:", id);

    try {
      // Cambio: quitar /api/v1 del path ya que está en baseURL
      const response = await api.patch(`/visitors/${id}/toggle-status`);
      console.log("Estado del visitante actualizado:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error en toggleStatus:", error);
      throw new Error(error.response?.data?.detail || "Error al cambiar estado del visitante");
    }
  },
};

// Si necesitas el servicio anterior con FormData para referencia o compatibilidad
export const visitorServiceFormData = {
  // Crear visitante usando FormData (método anterior)
  async createWithFormData(visitorData) {
    console.log("=== VISITOR SERVICE: CREATE WITH FORM DATA ===");

    try {
      // Crear FormData si se recibe un objeto regular
      let formData;

      if (visitorData instanceof FormData) {
        formData = visitorData;
      } else {
        formData = new FormData();

        // Agregar campos del formulario
        Object.keys(visitorData).forEach((key) => {
          if (key !== "photo" && visitorData[key] !== null && visitorData[key] !== undefined) {
            formData.append(key, visitorData[key]);
          }
        });

        // Agregar foto si existe
        if (visitorData.photo) {
          formData.append("photo", visitorData.photo);
        }
      }

      // Cambio: quitar /api/v1 del path ya que está en baseURL
      // Usar apiUpload para FormData (definido en tu configuración)
      const response = await apiUpload.post("/visitors", formData);

      console.log("Visitante creado exitosamente:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error en createWithFormData:", error);
      throw new Error(error.response?.data?.detail || "Error al crear visitante");
    }
  },
};

// ====================================
// 🚪 SERVICIO DE VISITAS (Versión básica si no existe)
// ====================================

export const visitService = {
  /**
   * Obtener todas las visitas con filtros opcionales
   * @param {Object} filters - Filtros opcionales (status, skip, limit)
   * @returns {Promise<Array>} Lista de visitas
   */
  async getAll(filters = {}) {
    try {
      console.log("🚪 Loading visits with filters:", filters);

      // Preparar parámetros de consulta
      const params = new URLSearchParams();
      if (filters.skip !== undefined) params.append("skip", filters.skip.toString());
      if (filters.limit !== undefined) params.append("limit", filters.limit.toString());
      if (filters.status) params.append("status", filters.status);

      const queryString = params.toString();
      const url = queryString ? `/visits/?${queryString}` : "/visits/";

      const response = await api.get(url);
      console.log("✅ Visits loaded:", response.data?.length || 0);
      return response.data;
    } catch (error) {
      console.error("❌ Error loading visits:", error);
      throw new Error(error.response?.data?.detail || "Error al obtener visitas");
    }
  },

  /**
   * Obtener visitas activas únicamente
   * @returns {Promise<Array>} Lista de visitas activas
   */
  async getActive() {
    try {
      console.log("🚪 Getting active visits");
      const response = await api.get("/visits/active");
      console.log("✅ Active visits loaded:", response.data?.length || 0);
      return response.data;
    } catch (error) {
      console.warn("⚠️ Active visits endpoint not available, filtering from all visits");
      // Fallback: obtener todas y filtrar por estado activo
      const allVisits = await this.getAll();
      return allVisits.filter((visit) => visit.status === "active");
    }
  },

  /**
   * Crear nueva visita
   * @param {Object} visitData - Datos de la visita según VisitCreate schema
   * @returns {Promise<Object>} Visita creada
   */
  async create(visitData) {
    try {
      console.log("🚪 Creating visit:", visitData);

      // Validar datos mínimos requeridos
      if (!visitData.visitor_id) {
        throw new Error("visitor_id es requerido");
      }
      if (!visitData.visit_type) {
        throw new Error("visit_type es requerido");
      }

      const response = await api.post("/visits/", visitData);
      console.log("✅ Visit created:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error creating visit:", error);

      if (error.response?.status === 422) {
        const validationErrors = error.response.data.detail;
        console.error("🚨 Validation errors:", validationErrors);
        throw new Error(`Errores de validación: ${validationErrors.map((e) => e.msg).join(", ")}`);
      }

      throw new Error(error.response?.data?.detail || "Error al crear la visita");
    }
  },

  /**
   * Obtener visita por ID
   * @param {number} id - ID de la visita
   * @returns {Promise<Object>} Visita
   */
  async getById(id) {
    try {
      console.log(`🚪 Getting visit ${id}`);
      const response = await api.get(`/visits/${id}`);
      console.log("✅ Visit retrieved:", response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error getting visit ${id}:`, error);

      if (error.response?.status === 404) {
        throw new Error("Visita no encontrada");
      }

      throw new Error(error.response?.data?.detail || "Error al obtener la visita");
    }
  },

  /**
   * Actualizar visita
   * @param {number} id - ID de la visita
   * @param {Object} updateData - Datos a actualizar según VisitUpdate schema
   * @returns {Promise<Object>} Visita actualizada
   */
  async update(id, updateData) {
    try {
      console.log(`🚪 Updating visit ${id}:`, updateData);
      const response = await api.put(`/visits/${id}`, updateData);
      console.log("✅ Visit updated:", response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating visit ${id}:`, error);

      if (error.response?.status === 404) {
        throw new Error("Visita no encontrada");
      }

      throw new Error(error.response?.data?.detail || "Error al actualizar la visita");
    }
  },

  /**
   * Completar visita (endpoint específico del backend)
   * @param {number} id - ID de la visita
   * @param {string} notes - Notas opcionales de finalización
   * @returns {Promise<Object>} Visita completada
   */
  async completeVisit(id, notes = "") {
    try {
      console.log(`🚪 Completing visit ${id} with notes:`, notes);

      // Usar el endpoint específico para completar visitas
      const response = await api.post(`/visits/${id}/complete`, null, {
        params: { notes: notes || undefined },
      });

      console.log("✅ Visit completed:", response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error completing visit ${id}:`, error);

      if (error.response?.status === 404) {
        throw new Error("Visita no encontrada");
      }
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.detail || "La visita ya está completada");
      }

      throw new Error(error.response?.data?.detail || "Error al completar la visita");
    }
  },

  /**
   * Obtener visitas por visitante
   * @param {number} visitorId - ID del visitante
   * @returns {Promise<Array>} Visitas del visitante
   */
  async getByVisitor(visitorId) {
    try {
      console.log(`🚪 Getting visits for visitor ${visitorId}`);
      const response = await api.get(`/visits/visitor/${visitorId}`);
      console.log("✅ Visitor visits loaded:", response.data?.length || 0);
      return response.data;
    } catch (error) {
      console.error(`❌ Error getting visits for visitor ${visitorId}:`, error);

      if (error.response?.status === 404) {
        throw new Error("Visitante no encontrado");
      }

      throw new Error(error.response?.data?.detail || "Error al obtener visitas del visitante");
    }
  },

  /**
   * Obtener visitas por vehículo
   * @param {number} vehicleId - ID del vehículo
   * @returns {Promise<Array>} Visitas del vehículo
   */
  async getByVehicle(vehicleId) {
    try {
      console.log(`🚪 Getting visits for vehicle ${vehicleId}`);
      const response = await api.get(`/visits/vehicle/${vehicleId}`);
      console.log("✅ Vehicle visits loaded:", response.data?.length || 0);
      return response.data;
    } catch (error) {
      console.error(`❌ Error getting visits for vehicle ${vehicleId}:`, error);

      if (error.response?.status === 404) {
        throw new Error("Vehículo no encontrado");
      }

      throw new Error(error.response?.data?.detail || "Error al obtener visitas del vehículo");
    }
  },

  /**
   * Iniciar visita desde pre-registro
   * @param {number} preRegisterId - ID del pre-registro
   * @returns {Promise<Object>} Visita iniciada
   */
  async startFromPreregister(preRegisterId) {
    try {
      console.log(`🚪 Starting visit from pre-register ${preRegisterId}`);

      // Este endpoint podría no existir aún, implementar según necesidades
      const response = await api.post(`/visits/start-from-preregister/${preRegisterId}`);
      console.log("✅ Visit started from pre-register:", response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error starting visit from pre-register ${preRegisterId}:`, error);

      if (error.response?.status === 404) {
        throw new Error("Pre-registro no encontrado");
      }
      if (error.response?.status === 400) {
        throw new Error("El pre-registro debe estar aprobado para iniciar la visita");
      }

      throw new Error(error.response?.data?.detail || "Error al iniciar visita desde pre-registro");
    }
  },

  /**
   * Cancelar visita
   * @param {number} id - ID de la visita
   * @param {string} reason - Razón de cancelación
   * @returns {Promise<Object>} Visita cancelada
   */
  async cancel(id, reason = "") {
    try {
      console.log(`🚪 Cancelling visit ${id} with reason:`, reason);

      const updateData = {
        status: "cancelled",
        notes: reason,
      };

      const response = await api.put(`/visits/${id}`, updateData);
      console.log("✅ Visit cancelled:", response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error cancelling visit ${id}:`, error);
      throw new Error(error.response?.data?.detail || "Error al cancelar la visita");
    }
  },

  /**
   * Obtener estadísticas de visitas
   * @returns {Promise<Object>} Estadísticas
   */
  async getStats() {
    try {
      console.log("📊 Getting visit stats");
      const response = await api.get("/visits/stats");
      console.log("✅ Visit stats loaded:", response.data);
      return response.data;
    } catch (error) {
      console.warn("⚠️ Visit stats endpoint not available, calculating from data");

      try {
        // Fallback: calcular estadísticas manualmente
        const allVisits = await this.getAll();
        const today = new Date().toISOString().split("T")[0];

        const stats = {
          total: allVisits.length,
          active: allVisits.filter((v) => v.status === "active").length,
          completed: allVisits.filter((v) => v.status === "completed").length,
          cancelled: allVisits.filter((v) => v.status === "cancelled").length,
          today: allVisits.filter((v) => {
            if (!v.entry_time) return false;
            return v.entry_time.startsWith(today);
          }).length,
          with_vehicle: allVisits.filter((v) => v.vehicle_id || v.vehicle).length,
        };

        return stats;
      } catch (fallbackError) {
        console.error("❌ Fallback stats calculation failed:", fallbackError);

        // Si todo falla, devolver stats básicos
        return {
          total: 0,
          active: 0,
          completed: 0,
          cancelled: 0,
          today: 0,
          with_vehicle: 0,
        };
      }
    }
  },

  /**
   * Validar datos de visita antes de enviar
   * @param {Object} visitData - Datos a validar
   * @returns {Object} Datos validados o errores
   */
  validateVisitData(visitData) {
    const errors = [];

    if (!visitData.visitor_id) {
      errors.push("visitor_id es requerido");
    }

    if (!visitData.visit_type) {
      errors.push("visit_type es requerido");
    } else if (
      !["person_only", "vehicle_only", "person_and_vehicle"].includes(visitData.visit_type)
    ) {
      errors.push("visit_type debe ser person_only, vehicle_only o person_and_vehicle");
    }

    if (visitData.visit_type === "vehicle_only" || visitData.visit_type === "person_and_vehicle") {
      if (!visitData.vehicle_id) {
        errors.push("vehicle_id es requerido para visitas con vehículo");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Formatear datos de visita para mostrar en UI
   * @param {Object} visit - Datos de la visita del backend
   * @returns {Object} Datos formateados para UI
   */
  async formatVisitForUI(visit) {
    let visitorData = visit.visitor;

    // Si solo vino visitor_id, cargamos datos con visitorService
    if (!visitorData && visit.visitor_id) {
      try {
        visitorData = await visitorService.getById(visit.visitor_id);
      } catch (err) {
        console.warn(`No se pudo cargar visitante ${visit.visitor_id}:`, err);
      }
    }

    return {
      ...visit,
      check_in_time: visit.entry_time,
      check_out_time: visit.exit_time,
      visitor_name: visitorData?.full_name || "Visitante desconocido",
      visitor_email: visitorData?.email || "",
      visitor_identification: visitorData
        ? `${visitorData.identification || ""} ${visitorData.no_identification || ""}`.trim()
        : "-",
      visitor_company: visitorData?.company || "-",
      visitor_phone: visitorData?.phone || "-",
    };
  },

  /**
   * Obtener visitas formateadas para UI
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Visitas formateadas
   */
  async getAllFormatted(filters = {}) {
    try {
      const visits = await this.getAll(filters);
      return visits.map((visit) => this.formatVisitForUI(visit));
    } catch (error) {
      console.error("❌ Error getting formatted visits:", error);
      throw error;
    }
  },
};

// ====================================
// 📝 SERVICIO DE PRE-REGISTROS CORREGIDO
// ====================================
export const preRegisterService = {
  /**
   * Obtener todos los pre-registros con filtros opcionales
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de pre-registros
   */
  async getAll(filters = {}) {
    try {
      console.log("📝 Loading pre-registers with filters:", filters);
      const response = await api.get("/pre-registrations", { params: filters });
      console.log("✅ Pre-registers loaded:", response.data?.length || 0);
      return response.data;
    } catch (error) {
      console.warn("⚠️ Pre-register endpoint not available, using enhanced mock data");
      return this.getMockData(filters);
    }
  },

  /**
   * Obtener pre-registros por rango de fechas
   * @param {string} dateFrom - Fecha inicio (YYYY-MM-DD)
   * @param {string} dateTo - Fecha fin (YYYY-MM-DD)
   * @param {string} status - Estado opcional
   * @returns {Promise<Array>} Pre-registros en el rango
   */
  async getByDateRange(dateFrom, dateTo, status = null) {
    try {
      console.log(`📅 Getting pre-registers from ${dateFrom} to ${dateTo}`);
      const params = {
        date_from: dateFrom,
        date_to: dateTo,
      };
      if (status) {
        params.status = status;
      }

      const response = await api.get("/pre-registrations/by-date-range", { params });
      console.log("✅ Pre-registers by date range loaded:", response.data?.length || 0);
      return response.data;
    } catch (error) {
      console.warn("⚠️ Date range endpoint not available, filtering mock data");
      const allData = this.getMockData();
      return allData.filter((item) => {
        const visitDate = item.visit_date;
        return visitDate >= dateFrom && visitDate <= dateTo && (!status || item.status === status);
      });
    }
  },

  /**
   * NUEVO: Obtener pre-registros por placa de vehículo
   * @param {string} licensePlate - Placa del vehículo
   * @param {string} status - Estado opcional
   * @returns {Promise<Array>} Pre-registros con esa placa
   */
  async getByVehicle(licensePlate, status = null) {
    try {
      console.log(`🚗 Getting pre-registers for vehicle: ${licensePlate}`);
      const params = {};
      if (status) {
        params.status = status;
      }

      const response = await api.get(`/pre-registrations/by-vehicle/${licensePlate}`, { params });
      console.log("✅ Pre-registers by vehicle loaded:", response.data?.length || 0);
      return response.data;
    } catch (error) {
      console.warn("⚠️ Vehicle endpoint not available, filtering mock data");
      const allData = this.getMockData();
      return allData.filter((item) => {
        return (
          item.vehicle_license_plate?.toLowerCase().includes(licensePlate.toLowerCase()) &&
          (!status || item.status === status)
        );
      });
    }
  },

  /**
   * Obtener estadísticas de pre-registros
   * @returns {Promise<Object>} Estadísticas
   */
  async getStats() {
    try {
      console.log("📊 Getting pre-register stats");
      const response = await api.get("/pre-registrations/stats");
      console.log("✅ Stats loaded:", response.data);
      return response.data;
    } catch (error) {
      console.warn("⚠️ Stats endpoint not available, using mock stats");
      return {
        total: 15,
        pending: 8,
        approved: 5,
        rejected: 2,
        today: 3,
        this_week: 12,
        with_vehicle: 6, // NUEVA ESTADÍSTICA
      };
    }
  },

  /**
   * NUEVO: Obtener estadísticas específicas de vehículos
   * @returns {Promise<Object>} Estadísticas de vehículos
   */
  async getVehicleStats() {
    try {
      console.log("🚗 Getting vehicle stats");
      const response = await api.get("/pre-registrations/vehicle-stats");
      console.log("✅ Vehicle stats loaded:", response.data);
      return response.data;
    } catch (error) {
      console.warn("⚠️ Vehicle stats endpoint not available, using mock stats");
      return {
        total_with_vehicle: 6,
        total_without_vehicle: 9,
        percentage_with_vehicle: 40.0,
        vehicles_today: 2,
        vehicles_this_week: 5,
        vehicles_this_month: 6,
        top_vehicle_makes: [
          { make: "Toyota", count: 3 },
          { make: "Honda", count: 2 },
          { make: "Nissan", count: 1 },
        ],
      };
    }
  },

  /**
   * Crear nuevo pre-registro
   * @param {Object} preRegisterData - Datos del pre-registro
   * @returns {Promise<Object>} Pre-registro creado
   */
  async create(preRegisterData) {
    try {
      console.log("📝 Creating pre-register:", preRegisterData);

      if (preRegisterData.visitor_id) {
        // CASO 1: Ya tienes visitor_id, usar endpoint simple
        const transformedData = {
          visitor_id: preRegisterData.visitor_id,
          authorizer_id: preRegisterData.authorizer_id || 1,
          visit_purpose: preRegisterData.purpose || preRegisterData.visit_purpose,
          visit_date: preRegisterData.visit_date,
          visit_time: this.formatTimeForBackend(preRegisterData.visit_time),
          expected_duration_hours: this.convertDurationToHours(preRegisterData.estimated_duration),
          additional_notes: preRegisterData.additional_notes || null,
          // NUEVOS CAMPOS DE VEHÍCULO
          vehicle_make: preRegisterData.vehicle_make || null,
          vehicle_model: preRegisterData.vehicle_model || null,
          vehicle_license_plate: preRegisterData.vehicle_license_plate || null,
        };

        console.log("📄 Using simple endpoint with existing visitor_id:", transformedData);
        const response = await api.post("/pre-registrations/", transformedData);
        console.log("✅ Pre-register created:", response.data);
        return response.data;
      } else {
        // CASO 2: No tienes visitor_id, crear visitante nuevo
        const transformedData = {
          visitor_name: preRegisterData.visitor_name || preRegisterData.name,
          visitor_email: preRegisterData.email || preRegisterData.visitor_email,
          visitor_phone: preRegisterData.phone || preRegisterData.visitor_phone || "",
          visitor_company: preRegisterData.company || null,
          visitor_identification:
            preRegisterData.identification || preRegisterData.visitor_identification || "",
          authorizer_id: preRegisterData.authorizer_id || 1,
          visit_purpose: preRegisterData.purpose || preRegisterData.visit_purpose,
          visit_date: preRegisterData.visit_date,
          visit_time: this.formatTimeForBackend(preRegisterData.visit_time),
          expected_duration_hours: this.convertDurationToHours(preRegisterData.estimated_duration),
          additional_notes: preRegisterData.additional_notes || null,
          // NUEVOS CAMPOS DE VEHÍCULO
          vehicle_make: preRegisterData.vehicle_make || null,
          vehicle_model: preRegisterData.vehicle_model || null,
          vehicle_license_plate: preRegisterData.vehicle_license_plate || null,
        };

        console.log("📄 Using with-visitor endpoint:", transformedData);
        const response = await api.post("/pre-registrations/with-visitor/", transformedData);
        console.log("✅ Pre-register created:", response.data);
        return response.data;
      }
    } catch (error) {
      console.error("❌ Error creating pre-register:", error);

      if (error.response?.status === 422) {
        const validationErrors = error.response.data.detail;
        console.error("🚨 Validation errors:", validationErrors);
        throw new Error(`Errores de validación: ${validationErrors.map((e) => e.msg).join(", ")}`);
      }

      throw error;
    }
  },

  /**
   * Convertir duración de minutos a horas
   * @param {number|string} duration - Duración en minutos
   * @returns {number} Duración en horas (entre 1 y 12)
   */
  convertDurationToHours(duration) {
    if (!duration) return 2; // Default 2 horas

    const minutes = parseInt(duration);
    if (isNaN(minutes)) return 2;

    // Convertir minutos a horas
    let hours = Math.round(minutes / 60);

    // Asegurar que esté entre 1 y 12
    if (hours < 1) hours = 1;
    if (hours > 12) hours = 12;

    console.log(`⏱️ Converting duration: ${minutes} minutes = ${hours} hours`);
    return hours;
  },

  /**
   * Formatear tiempo para el backend
   * @param {string} timeString - Tiempo en formato HH:MM
   * @returns {string} Tiempo en formato HH:MM:SS
   */
  formatTimeForBackend(timeString) {
    if (!timeString) return "00:00:00";

    // Si ya tiene formato completo HH:MM:SS, devolverlo tal como está
    if (timeString.split(":").length === 3) {
      return timeString;
    }

    // Si tiene formato HH:MM, agregar :00
    if (timeString.split(":").length === 2) {
      return `${timeString}:00`;
    }

    // Si es solo HH, agregar :00:00
    if (timeString.split(":").length === 1) {
      return `${timeString.padStart(2, "0")}:00:00`;
    }

    // Fallback
    return "00:00:00";
  },

  /**
   * NUEVA: Validar formato de placa
   * @param {string} licensePlate - Placa a validar
   * @returns {boolean} True si es válida
   */
  validateLicensePlate(licensePlate) {
    if (!licensePlate) return true; // Es opcional

    // Quitar espacios y convertir a mayúsculas
    const plate = licensePlate.trim().toUpperCase();

    // Validar longitud (6-10 caracteres)
    if (plate.length < 6 || plate.length > 10) {
      return false;
    }

    // Validar que contenga solo letras, números y guiones
    const plateRegex = /^[A-Z0-9\-]+$/;
    return plateRegex.test(plate);
  },

  /**
   * NUEVA: Formatear placa para mostrar
   * @param {string} licensePlate - Placa a formatear
   * @returns {string} Placa formateada
   */
  formatLicensePlate(licensePlate) {
    if (!licensePlate) return "";
    return licensePlate.trim().toUpperCase();
  },

  /**
   * Obtener pre-registro por ID
   * @param {number} id - ID del pre-registro
   * @returns {Promise<Object>} Pre-registro
   */
  async getById(id) {
    try {
      console.log(`📝 Getting pre-register ${id}`);
      const response = await api.get(`/pre-registrations/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`⚠️ Pre-register ${id} endpoint not available`);
      throw new Error("Pre-registro no encontrado");
    }
  },

  /**
   * Aprobar pre-registro
   * @param {number} id - ID del pre-registro
   * @param {string} notes - Notas de aprobación
   * @returns {Promise<Object>} Pre-registro aprobado
   */
  async approve(id, notes = "") {
    try {
      console.log(`✅ Approving pre-register ${id}`);
      const response = await api.post(`/pre-registrations/${id}/approve`, { notes });
      console.log("✅ Pre-register approved:", response.data);
      return response.data;
    } catch (error) {
      console.warn("⚠️ Pre-register approve endpoint not available, simulating success");

      return {
        id,
        status: "APPROVED",
        approved_at: new Date().toISOString(),
        approved_by: "admin@empresa.com",
        approval_notes: notes,
      };
    }
  },

  /**
   * Rechazar pre-registro
   * @param {number} id - ID del pre-registro
   * @param {string} reason - Razón del rechazo
   * @returns {Promise<Object>} Pre-registro rechazado
   */
  async reject(id, reason = "") {
    try {
      console.log(`❌ Rejecting pre-register ${id} with reason:`, reason);
      const response = await api.post(`/pre-registrations/${id}/reject`, { reason });
      console.log("✅ Pre-register rejected:", response.data);
      return response.data;
    } catch (error) {
      console.warn("⚠️ Pre-register reject endpoint not available, simulating success");

      return {
        id,
        status: "REJECTED",
        rejected_at: new Date().toISOString(),
        rejected_by: "admin@empresa.com",
        rejection_reason: reason,
      };
    }
  },

  /**
   * Actualizar pre-registro
   * @param {number} id - ID del pre-registro
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} Pre-registro actualizado
   */
  async update(id, updateData) {
    try {
      console.log(`📝 Updating pre-register ${id}`, updateData);

      // Transformar datos para el backend incluyendo campos de vehículo
      const transformedData = {
        visit_purpose: updateData.purpose || updateData.visit_purpose,
        visit_date: updateData.visit_date,
        visit_time: this.formatTimeForBackend(updateData.visit_time),
        expected_duration_hours: this.convertDurationToHours(updateData.estimated_duration),
        additional_notes: updateData.additional_notes || null,
        // NUEVOS CAMPOS DE VEHÍCULO
        vehicle_make: updateData.vehicle_make || null,
        vehicle_model: updateData.vehicle_model || null,
        vehicle_license_plate: updateData.vehicle_license_plate || null,
      };

      const response = await api.put(`/pre-registrations/${id}`, transformedData);
      console.log("✅ Pre-register updated:", response.data);
      return response.data;
    } catch (error) {
      console.warn("⚠️ Pre-register update endpoint not available");
      throw new Error("No se pudo actualizar el pre-registro");
    }
  },

  /**
   * Eliminar pre-registro
   * @param {number} id - ID del pre-registro
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  async delete(id) {
    try {
      console.log(`🗑️ Deleting pre-register ${id}`);
      const response = await api.delete(`/pre-registrations/${id}`);
      console.log("✅ Pre-register deleted:", response.data);
      return response.data;
    } catch (error) {
      console.warn("⚠️ Pre-register delete endpoint not available");
      throw new Error("No se pudo eliminar el pre-registro");
    }
  },

  /**
   * Datos mock para desarrollo ACTUALIZADOS CON CAMPOS DE VEHÍCULO
   * @param {Object} filters - Filtros a aplicar
   * @returns {Array} Datos mock filtrados
   */
  getMockData(filters = {}) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);

    const mockData = [
      {
        id: 1,
        visitor_name: "Ana Rodríguez",
        visitor_email: "ana.rodriguez@innovatech.com",
        visitor_phone: "+52 555 1234567",
        visitor_company: "Innovación Tech",
        visitor_identification: "INE",
        visitor_identification_number: "RODA850312MDFXXX01",
        authorizer_name: "Jorge Mendez",
        authorizer_email: "jorge.mendez@empresa.com",
        visit_date: tomorrow.toISOString().split("T")[0],
        visit_time: "10:00:00",
        visit_purpose: "Demostración de producto",
        expected_duration_hours: 2,
        status: "PENDING",
        additional_notes: "Requiere proyector y sala de juntas",
        // NUEVOS CAMPOS DE VEHÍCULO
        vehicle_make: "Toyota",
        vehicle_model: "Corolla",
        vehicle_license_plate: "ABC-123-XY",
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        requested_by: "sistema@empresa.com",
      },
      {
        id: 2,
        visitor_name: "Roberto Silva",
        visitor_email: "roberto.silva@serviciospro.com",
        visitor_phone: "+52 555 9876543",
        visitor_company: "Servicios Pro",
        visitor_identification: "RFC",
        visitor_identification_number: "SILR901201XXX",
        authorizer_name: "Sofia Castro",
        authorizer_email: "sofia.castro@empresa.com",
        visit_date: tomorrow.toISOString().split("T")[0],
        visit_time: "14:30:00",
        visit_purpose: "Reunión comercial",
        expected_duration_hours: 1,
        status: "APPROVED",
        additional_notes: "",
        // SIN VEHÍCULO
        vehicle_make: null,
        vehicle_model: null,
        vehicle_license_plate: null,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        requested_by: "recepcion@empresa.com",
      },
      {
        id: 3,
        visitor_name: "Carmen Vega",
        visitor_email: "carmen.vega@consultores.com",
        visitor_phone: "+52 555 5555555",
        visitor_company: "Consultores ABC",
        visitor_identification: "CURP",
        visitor_identification_number: "VEGC800215MDFXXX02",
        authorizer_name: "Luis Hernández",
        authorizer_email: "luis.hernandez@empresa.com",
        visit_date: dayAfter.toISOString().split("T")[0],
        visit_time: "09:00:00",
        visit_purpose: "Auditoría",
        expected_duration_hours: 4,
        status: "REJECTED",
        additional_notes: "Auditoría anual de sistemas",
        // NUEVOS CAMPOS DE VEHÍCULO
        vehicle_make: "Honda",
        vehicle_model: "Civic",
        vehicle_license_plate: "DEF-456-ZW",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        requested_by: "admin@empresa.com",
        rejection_reason: "Fecha no disponible, proponer alternativa",
      },
      {
        id: 4,
        visitor_name: "Miguel Torres",
        visitor_email: "miguel.torres@logistica.com",
        visitor_phone: "+52 555 7777777",
        visitor_company: "Logística Express",
        visitor_identification: "INE",
        visitor_identification_number: "TORM750810HDFRR09",
        authorizer_name: "Patricia Moreno",
        authorizer_email: "patricia.moreno@empresa.com",
        visit_date: today.toISOString().split("T")[0],
        visit_time: "16:00:00",
        visit_purpose: "Entrega de equipos",
        expected_duration_hours: 1,
        status: "APPROVED",
        additional_notes: "Entrega en muelle de carga",
        // NUEVOS CAMPOS DE VEHÍCULO
        vehicle_make: "Ford",
        vehicle_model: "Transit",
        vehicle_license_plate: "GHI-789-UV",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        requested_by: "logistica@empresa.com",
      },
    ];

    // Aplicar filtros si están presentes
    let filteredData = mockData;

    if (filters.status) {
      filteredData = filteredData.filter((item) => item.status === filters.status);
    }

    if (filters.visit_date_from) {
      filteredData = filteredData.filter((item) => item.visit_date >= filters.visit_date_from);
    }

    if (filters.visit_date_to) {
      filteredData = filteredData.filter((item) => item.visit_date <= filters.visit_date_to);
    }

    if (filters.vehicle_license_plate) {
      filteredData = filteredData.filter((item) =>
        item.vehicle_license_plate
          ?.toLowerCase()
          .includes(filters.vehicle_license_plate.toLowerCase())
      );
    }

    if (filters.has_vehicle !== undefined) {
      if (filters.has_vehicle) {
        filteredData = filteredData.filter((item) => item.vehicle_license_plate);
      } else {
        filteredData = filteredData.filter((item) => !item.vehicle_license_plate);
      }
    }

    if (filters.visitor_name) {
      filteredData = filteredData.filter((item) =>
        item.visitor_name.toLowerCase().includes(filters.visitor_name.toLowerCase())
      );
    }

    if (filters.company) {
      filteredData = filteredData.filter(
        (item) =>
          item.visitor_company &&
          item.visitor_company.toLowerCase().includes(filters.company.toLowerCase())
      );
    }

    return filteredData;
  },
};

// ====================================
// 👥 SERVICIO DE USUARIOS
// ====================================
export const userService = {
  /**
   * Obtener todos los usuarios
   * @returns {Promise<Array>} Lista de usuarios
   */
  async getAll() {
    try {
      console.log("👥 Loading users");
      const response = await api.get("/users/");
      console.log("✅ Users loaded:", response.data?.length || 0);
      return response.data;
    } catch (error) {
      console.warn("⚠️ Users endpoint not available, using mock data");
      return this.getMockUsers();
    }
  },

  /**
   * Obtener solo usuarios autorizadores
   * @returns {Promise<Array>} Lista de autorizadores
   */
  async getAuthorizers() {
    try {
      console.log("👥 Loading authorizers");
      const response = await api.get("/users/authorizers");
      console.log("✅ Authorizers loaded:", response.data?.length || 0);
      return response.data;
    } catch (error) {
      console.warn("⚠️ Authorizers endpoint not available, using mock data");
      return this.getMockAuthorizers();
    }
  },

  /**
   * Obtener usuario por ID
   * @param {number} id - ID del usuario
   * @returns {Promise<Object>} Usuario
   */
  async getById(id) {
    try {
      console.log(`👥 Getting user ${id}`);
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`⚠️ User ${id} endpoint not available`);
      throw new Error("Usuario no encontrado");
    }
  },

  /**
   * Datos mock para desarrollo - Autorizadores
   */
  getMockAuthorizers() {
    return [
      {
        id: 1,
        full_name: "Jorge Mendez",
        email: "jorge.mendez@empresa.com",
        department: "Recursos Humanos",
        position: "Gerente de RRHH",
        phone: "+52 55 1234 5678",
        is_authorizer: true,
        is_admin: false,
        is_active: true,
      },
      {
        id: 2,
        full_name: "Sofia Castro",
        email: "sofia.castro@empresa.com",
        department: "Operaciones",
        position: "Directora de Operaciones",
        phone: "+52 55 2345 6789",
        is_authorizer: true,
        is_admin: true,
        is_active: true,
      },
      {
        id: 3,
        full_name: "Ricardo Morales",
        email: "ricardo.morales@empresa.com",
        department: "Tecnología",
        position: "CTO",
        phone: "+52 55 3456 7890",
        is_authorizer: true,
        is_admin: false,
        is_active: true,
      },
      {
        id: 4,
        full_name: "Ana Gutierrez",
        email: "ana.gutierrez@empresa.com",
        department: "Seguridad",
        position: "Jefe de Seguridad",
        phone: "+52 55 4567 8901",
        is_authorizer: true,
        is_admin: false,
        is_active: true,
      },
    ];
  },

  /**
   * Datos mock para desarrollo - Todos los usuarios
   */
  getMockUsers() {
    const authorizers = this.getMockAuthorizers();
    const regularUsers = [
      {
        id: 5,
        full_name: "Carlos Lopez",
        email: "carlos.lopez@empresa.com",
        department: "Contabilidad",
        position: "Contador",
        phone: "+52 55 5678 9012",
        is_authorizer: false,
        is_admin: false,
        is_active: true,
      },
    ];
    return [...authorizers, ...regularUsers];
  },
};

// ... (mantener todos los otros servicios existentes)

// Exportar todas las configuraciones
export { api, apiUpload };
