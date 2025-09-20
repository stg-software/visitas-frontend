/* eslint-disable react/prop-types */
// src/layouts/visits/index.js
import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  Icon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Tooltip,
  Menu,
  MenuItem,
  Fab,
  TextField,
  Avatar,
  Divider,
  Paper,
  Box,
  Typography,
} from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

// Servicios de API
import { visitService, preRegisterService } from "../../services/apiServices";

//DataGrid
import { DataGrid } from "@mui/x-data-grid";

// Componente para el Diálogo de Finalización de Visita
const EndVisitDialog = ({ visit, isOpen, onClose, onConfirm }) => {
  const [endNotes, setEndNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(visit.id, endNotes);
      setEndNotes("");
      onClose();
    } catch (error) {
      console.error("Error ending visit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Obtener información del visitante (puede venir de relación o campos directos)
  const getVisitorInfoForDialog = (visit) => {
    if (visit?.visitor) {
      return {
        name: visit.visitor.full_name,
        email: visit.visitor.email || "Sin email",
        photo: null, // Tu modelo no tiene photo_url
        company: visit.visitor.company || "Sin empresa",
        identification: visit.visitor.identification || "",
        no_identification: visit.visitor.no_identification || "",
      };
    }
    return {
      name: "Visitante desconocido",
      email: "Sin email",
      photo: null,
      company: "Sin empresa",
      identification: "",
      no_identification: "",
    };
  };

  const visitorInfo = visit
    ? getVisitorInfoForDialog(visit)
    : { name: "", email: "", photo: null, company: "", identification: "", no_identification: "" };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <MDTypography variant="h4" fontWeight="medium">
          Finalizar Visita
        </MDTypography>
      </DialogTitle>
      <DialogContent>
        <MDBox pt={2}>
          {visit && (
            <>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #e9ecef",
                  mb: 3,
                }}
              >
                <MDBox display="flex" alignItems="center">
                  <Avatar sx={{ mr: 2, width: 50, height: 50 }} src={visitorInfo.photo}>
                    {visitorInfo.name?.charAt(0) || "?"}
                  </Avatar>
                  <MDBox sx={{ flexGrow: 1 }}>
                    <MDTypography variant="h6" fontWeight="medium">
                      {visitorInfo.name}
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                      Email: {visitorInfo.email}
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                      Empresa: {visitorInfo.company}
                    </MDTypography>
                    {visitorInfo.no_identification && (
                      <MDTypography variant="body2" color="text">
                        ID: {visitorInfo.identification} - {visitorInfo.no_identification}
                      </MDTypography>
                    )}
                    <MDTypography variant="body2" color="text">
                      Tipo de visita:{" "}
                      {visit.visit_type
                        ? visit.visit_type === "person_only"
                          ? "Solo persona"
                          : visit.visit_type === "vehicle_only"
                          ? "Solo vehículo"
                          : visit.visit_type === "person_and_vehicle"
                          ? "Persona + vehículo"
                          : visit.visit_type
                        : "No especificado"}
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                      Hora de entrada:{" "}
                      {visit.entry_time
                        ? new Date(visit.entry_time).toLocaleTimeString()
                        : "No registrada"}
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                      Estado: {getStatusLabel(visit.status || "active")}
                    </MDTypography>

                    {/* Mostrar método de reconocimiento usado */}
                    <MDBox mt={1}>
                      {visit.face_recognition_confidence && (
                        <MDBox display="flex" alignItems="center" mb={0.5}>
                          <Icon sx={{ mr: 0.5, fontSize: 16, color: "success.main" }}>face</Icon>
                          <MDTypography variant="caption" color="success.main">
                            Reconocimiento facial:{" "}
                            {parseFloat(visit.face_recognition_confidence).toFixed(2)}
                          </MDTypography>
                        </MDBox>
                      )}
                      {visit.plate_recognition_confidence && (
                        <MDBox display="flex" alignItems="center">
                          <Icon sx={{ mr: 0.5, fontSize: 16, color: "info.main" }}>
                            local_parking
                          </Icon>
                          <MDTypography variant="caption" color="info.main">
                            Reconocimiento de placa:{" "}
                            {parseFloat(visit.plate_recognition_confidence).toFixed(2)}
                          </MDTypography>
                        </MDBox>
                      )}
                      {!visit.face_recognition_confidence &&
                        !visit.plate_recognition_confidence && (
                          <MDBox display="flex" alignItems="center">
                            <Icon sx={{ mr: 0.5, fontSize: 16, color: "warning.main" }}>
                              keyboard
                            </Icon>
                            <MDTypography variant="caption" color="warning.main">
                              Ingreso manual
                            </MDTypography>
                          </MDBox>
                        )}
                    </MDBox>
                  </MDBox>
                </MDBox>
              </Paper>

              <MDInput
                type="text"
                label="Notas de Finalización (Opcional)"
                value={endNotes}
                onChange={(e) => setEndNotes(e.target.value)}
                fullWidth
                multiline
                rows={3}
                placeholder="Observaciones sobre la visita, incidencias, etc..."
              />
            </>
          )}
        </MDBox>
      </DialogContent>
      <DialogActions>
        <MDButton onClick={onClose} variant="outlined" color="secondary">
          Cancelar
        </MDButton>
        <MDButton onClick={handleSubmit} variant="gradient" color="error" disabled={isSubmitting}>
          {isSubmitting ? "Finalizando..." : "Finalizar Visita"}
        </MDButton>
      </DialogActions>
    </Dialog>
  );
};

// Componente Principal
function VisitsManagement() {
  // Estados principales
  const [visits, setVisits] = useState([]);
  const [filteredVisits, setFilteredVisits] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados para la tabla
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "active", "completed", "cancelled"
  const [vehicleFilter, setVehicleFilter] = useState("all"); // "all", "with_vehicle", "without_vehicle"

  // Estados para el diálogo de finalización
  const [endVisitDialog, setEndVisitDialog] = useState({ open: false, visit: null });

  // Estados para alertas
  const [alert, setAlert] = useState({ show: false, message: "", severity: "success" });

  // Estados para menú de acciones
  const [actionMenu, setActionMenu] = useState({ anchorEl: null, visit: null });

  // Efectos
  useEffect(() => {
    console.log("=== CONFIGURACIÓN DE VISITAS ===");
    console.log("API URL:", process.env.REACT_APP_API_URL || "http://localhost:8000");
    console.log("Token disponible:", !!localStorage.getItem("access_token"));
    console.log("Servicio importado:", !!visitService);

    loadVisits();

    // Auto-refresh cada 30 segundos para visitas activas
    const interval = setInterval(() => {
      if (statusFilter === "active") {
        loadVisits();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [statusFilter]);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, statusFilter, vehicleFilter, visits]);

  // Funciones de carga de datos
  const loadVisits = async () => {
    console.log("=== CARGANDO VISITAS ===");
    setLoading(true);
    try {
      // Usar el servicio actualizado de visitas
      const data = await visitService.getAll();
      console.log("Visitas cargadas exitosamente:", data);
      setVisits(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading visits:", error);
      showAlert("Error al cargar visitas: " + error.message, "error");
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  // Función de búsqueda actualizada para los campos del backend
  const handleSearch = () => {
    let filtered = [...visits];

    // Filtro por texto general
    if (searchTerm.trim()) {
      filtered = filtered.filter((visit) => {
        const searchLower = searchTerm.toLowerCase();

        // Buscar en información del visitante
        const visitorName = visit.visitor?.full_name || "";
        const visitorEmail = visit.visitor?.email || "";
        const visitorCompany = visit.visitor?.company || "";
        const visitorId = visit.visitor?.no_identification || "";

        // Buscar en información del vehículo (desde pre-registro)
        const vehiclePlate = visit.pre_registration?.vehicle_license_plate || "";
        const vehicleMake = visit.pre_registration?.vehicle_make || "";

        // Buscar en notas
        const notes = visit.notes || "";

        return (
          visitorName.toLowerCase().includes(searchLower) ||
          visitorEmail.toLowerCase().includes(searchLower) ||
          visitorCompany.toLowerCase().includes(searchLower) ||
          visitorId.toLowerCase().includes(searchLower) ||
          vehiclePlate.toLowerCase().includes(searchLower) ||
          vehicleMake.toLowerCase().includes(searchLower) ||
          notes.toLowerCase().includes(searchLower)
        );
      });
    }

    // Filtro por estado (usando enums del backend)
    if (statusFilter === "active") {
      filtered = filtered.filter((visit) => visit.status === "active");
    } else if (statusFilter === "completed") {
      filtered = filtered.filter((visit) => visit.status === "completed");
    } else if (statusFilter === "cancelled") {
      filtered = filtered.filter((visit) => visit.status === "cancelled");
    }

    // Filtro por vehículo (usando datos del pre-registro)
    if (vehicleFilter === "with_vehicle") {
      filtered = filtered.filter(
        (visit) =>
          visit.pre_registration?.vehicle_license_plate &&
          visit.pre_registration.vehicle_license_plate.trim() !== ""
      );
    } else if (vehicleFilter === "without_vehicle") {
      filtered = filtered.filter(
        (visit) =>
          !visit.pre_registration?.vehicle_license_plate ||
          visit.pre_registration.vehicle_license_plate.trim() === ""
      );
    }

    setFilteredVisits(filtered);
    setPage(0);
  };

  // Funciones de gestión de visitas adaptadas al backend
  const handleEndVisit = async (visitId, endNotes = "") => {
    console.log("=== FINALIZANDO VISITA ===");
    console.log("ID:", visitId);
    console.log("Notas:", endNotes);

    try {
      // Usar el endpoint de completar visita del backend
      await visitService.completeVisit(visitId, endNotes);
      console.log("Visita finalizada exitosamente");

      await loadVisits();
      showAlert("Visita finalizada exitosamente", "success");
    } catch (error) {
      console.error("Error ending visit:", error);
      showAlert("Error al finalizar visita: " + error.message, "error");
    }
  };

  // Función para completar visita usando el endpoint correcto
  const completeVisit = async (visitId, notes = "") => {
    try {
      const response = await fetch(`/api/v1/visits/${visitId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        throw new Error("Error al completar la visita");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  // Funciones de UI
  const showAlert = (message, severity = "success") => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ show: false, message: "", severity: "success" }), 4000);
  };

  const openEndVisitDialog = (visit) => {
    setEndVisitDialog({ open: true, visit });
    closeActionMenu();
  };

  const closeEndVisitDialog = () => {
    setEndVisitDialog({ open: false, visit: null });
  };

  const openActionMenu = (event, visit) => {
    setActionMenu({ anchorEl: event.currentTarget, visit });
  };

  const closeActionMenu = () => {
    setActionMenu({ anchorEl: null, visit: null });
  };

  // Formateo de datos adaptado a los campos del backend
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDuration = (entryTime, exitTime = null) => {
    if (!entryTime) return "-";

    const start = new Date(entryTime);
    const end = exitTime ? new Date(exitTime) : new Date();
    const diffMs = end - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "info";
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "active":
        return "Activa";
      case "completed":
        return "Completada";
      case "cancelled":
        return "Cancelada";
      default:
        return "Desconocido";
    }
  };

  // Formatear información del vehículo adaptado al modelo de pre-registro
  const formatVehicleInfo = (visit) => {
    // Los datos del vehículo vienen del pre-registro
    if (visit.pre_registration) {
      const { vehicle_make, vehicle_model, vehicle_license_plate } = visit.pre_registration;

      if (vehicle_license_plate) {
        const parts = [];
        if (vehicle_make) parts.push(vehicle_make);
        if (vehicle_model) parts.push(vehicle_model);
        const vehicleDescription = parts.length > 0 ? parts.join(" ") : "Vehículo";
        return `${vehicleDescription} - ${vehicle_license_plate}`;
      }
    }
    return "Sin vehículo";
  };

  // Obtener información del visitante usando los campos correctos del modelo
  const getVisitorInfo = (visit) => {
    if (visit.visitor) {
      return {
        name: visit.visitor.full_name,
        email: visit.visitor.email || "-",
        photo: null, // Tu modelo no tiene photo_url, solo face_encoding
        identification: visit.visitor.no_identification || "-",
        company: visit.visitor.company || "-",
        phone: visit.visitor.phone || "-",
      };
    }
    return {
      name: "Visitante desconocido",
      email: "-",
      photo: null,
      identification: "-",
      company: "-",
      phone: "-",
    };
  };

  // Estadísticas adaptadas (usando datos del pre-registro para vehículos)
  const stats = {
    active: filteredVisits.filter((visit) => visit.status === "active").length,
    completed: filteredVisits.filter((visit) => visit.status === "completed").length,
    today: filteredVisits.filter((visit) => {
      if (!visit.entry_time) return false;
      const today = new Date().toDateString();
      const visitDate = new Date(visit.entry_time).toDateString();
      return visitDate === today;
    }).length,
    withVehicle: filteredVisits.filter(
      (visit) =>
        visit.pre_registration?.vehicle_license_plate &&
        visit.pre_registration.vehicle_license_plate.trim() !== ""
    ).length,
  };

  // Columnas del DataGrid adaptadas al modelo del backend
  const columns = [
    {
      field: "visitor",
      headerName: "Visitante",
      minWidth: 250,
      flex: 1,
      renderCell: (params) => {
        const visitorInfo = getVisitorInfo(params.row);
        return (
          <MDBox display="flex" alignItems="center">
            <Avatar sx={{ mr: 2, width: 40, height: 40 }} src={visitorInfo.photo}>
              {visitorInfo.name?.charAt(0) || "?"}
            </Avatar>
            <MDBox>
              <MDTypography variant="body2" fontWeight="medium">
                {visitorInfo.name}
              </MDTypography>
              <MDTypography variant="caption" color="text">
                {visitorInfo.email}
              </MDTypography>
              {visitorInfo.company && visitorInfo.company !== "-" && (
                <MDTypography variant="caption" color="text" display="block">
                  {visitorInfo.company}
                </MDTypography>
              )}
            </MDBox>
          </MDBox>
        );
      },
    },
    {
      field: "visit_type",
      headerName: "Tipo",
      minWidth: 140,
      renderCell: (params) => {
        const getTypeIcon = (type) => {
          switch (type) {
            case "person_only":
              return "person";
            case "vehicle_only":
              return "directions_car";
            case "person_and_vehicle":
              return "people_alt";
            default:
              return "help";
          }
        };

        const getTypeLabel = (type) => {
          switch (type) {
            case "person_only":
              return "Solo persona";
            case "vehicle_only":
              return "Solo vehículo";
            case "person_and_vehicle":
              return "Persona + vehículo";
            default:
              return type || "-";
          }
        };

        return (
          <MDBox display="flex" alignItems="center">
            <Icon sx={{ mr: 1, fontSize: 16, color: "primary.main" }}>
              {getTypeIcon(params.row.visit_type)}
            </Icon>
            <MDTypography variant="body2">{getTypeLabel(params.row.visit_type)}</MDTypography>
          </MDBox>
        );
      },
    },
    {
      field: "entry_time",
      headerName: "Entrada",
      minWidth: 160,
      flex: 1,
      valueGetter: (params) => formatDateTime(params.row.entry_time),
    },
    {
      field: "duration",
      headerName: "Duración",
      minWidth: 100,
      valueGetter: (params) => calculateDuration(params.row.entry_time, params.row.exit_time),
    },
    {
      field: "vehicle",
      headerName: "Vehículo",
      minWidth: 160,
      flex: 1,
      renderCell: (params) => {
        const hasVehicle = params.row.pre_registration?.vehicle_license_plate;

        if (hasVehicle) {
          return (
            <MDBox display="flex" alignItems="center">
              <Icon sx={{ mr: 1, color: "primary.main", fontSize: 16 }}>directions_car</Icon>
              <MDBox>
                <MDTypography variant="body2" fontWeight="medium">
                  {params.row.pre_registration.vehicle_license_plate}
                </MDTypography>
                {(params.row.pre_registration.vehicle_make ||
                  params.row.pre_registration.vehicle_model) && (
                  <MDTypography variant="caption" color="text">
                    {[
                      params.row.pre_registration.vehicle_make,
                      params.row.pre_registration.vehicle_model,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  </MDTypography>
                )}
              </MDBox>
            </MDBox>
          );
        } else {
          return (
            <MDTypography variant="body2" color="text">
              Sin vehículo
            </MDTypography>
          );
        }
      },
    },
    {
      field: "status",
      headerName: "Estado",
      minWidth: 120,
      renderCell: (params) => (
        <Chip
          label={getStatusLabel(params.row.status)}
          color={getStatusColor(params.row.status)}
          size="small"
        />
      ),
    },
    {
      field: "recognition_method",
      headerName: "Método de Acceso",
      minWidth: 180,
      renderCell: (params) => {
        const hasFaceRecognition = params.row.face_recognition_confidence;
        const hasPlateRecognition = params.row.plate_recognition_confidence;

        return (
          <MDBox>
            {hasFaceRecognition && (
              <MDBox display="flex" alignItems="center" mb={0.5}>
                <Icon sx={{ mr: 0.5, fontSize: 14, color: "success.main" }}>face</Icon>
                <MDTypography variant="caption" color="text">
                  Facial: {parseFloat(hasFaceRecognition).toFixed(2)}
                </MDTypography>
              </MDBox>
            )}
            {hasPlateRecognition && (
              <MDBox display="flex" alignItems="center">
                <Icon sx={{ mr: 0.5, fontSize: 14, color: "info.main" }}>local_parking</Icon>
                <MDTypography variant="caption" color="text">
                  Placa: {parseFloat(hasPlateRecognition).toFixed(2)}
                </MDTypography>
              </MDBox>
            )}
            {!hasFaceRecognition && !hasPlateRecognition && (
              <MDBox display="flex" alignItems="center">
                <Icon sx={{ mr: 0.5, fontSize: 14, color: "warning.main" }}>keyboard</Icon>
                <MDTypography variant="caption" color="text">
                  Manual
                </MDTypography>
              </MDBox>
            )}
          </MDBox>
        );
      },
    },
    {
      field: "actions",
      headerName: "Acciones",
      sortable: false,
      minWidth: 100,
      renderCell: (params) => (
        <Tooltip title="Más opciones">
          <IconButton size="small" onClick={(e) => openActionMenu(e, params.row)}>
            <Icon>more_vert</Icon>
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            {/* Header */}
            <MDBox mb={3} display="flex" justifyContent="space-between" alignItems="center">
              <MDBox>
                <MDTypography variant="h3" fontWeight="medium">
                  Gestión de Visitas
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  Monitorea y gestiona las visitas activas y finalizadas
                </MDTypography>
              </MDBox>
              <MDButton
                variant="gradient"
                color="info"
                onClick={loadVisits}
                startIcon={<Icon>refresh</Icon>}
                disabled={loading}
              >
                {loading ? "Actualizando..." : "Actualizar"}
              </MDButton>
            </MDBox>

            {/* Alerta */}
            {alert.show && (
              <MDBox mb={3}>
                <Alert
                  severity={alert.severity}
                  onClose={() => setAlert({ show: false, message: "", severity: "success" })}
                >
                  {alert.message}
                </Alert>
              </MDBox>
            )}

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <MDBox p={3}>
                    <MDBox display="flex" alignItems="center" justifyContent="space-between">
                      <MDBox>
                        <MDTypography variant="body2" color="text" gutterBottom>
                          Visitas Activas
                        </MDTypography>
                        <MDTypography variant="h4" fontWeight="medium">
                          {stats.active}
                        </MDTypography>
                      </MDBox>
                      <Icon sx={{ fontSize: 32, color: "info.main" }}>people</Icon>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <MDBox p={3}>
                    <MDBox display="flex" alignItems="center" justifyContent="space-between">
                      <MDBox>
                        <MDTypography variant="body2" color="text" gutterBottom>
                          Completadas
                        </MDTypography>
                        <MDTypography variant="h4" fontWeight="medium">
                          {stats.completed}
                        </MDTypography>
                      </MDBox>
                      <Icon sx={{ fontSize: 32, color: "success.main" }}>check_circle</Icon>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <MDBox p={3}>
                    <MDBox display="flex" alignItems="center" justifyContent="space-between">
                      <MDBox>
                        <MDTypography variant="body2" color="text" gutterBottom>
                          Hoy
                        </MDTypography>
                        <MDTypography variant="h4" fontWeight="medium">
                          {stats.today}
                        </MDTypography>
                      </MDBox>
                      <Icon sx={{ fontSize: 32, color: "warning.main" }}>today</Icon>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <MDBox p={3}>
                    <MDBox display="flex" alignItems="center" justifyContent="space-between">
                      <MDBox>
                        <MDTypography variant="body2" color="text" gutterBottom>
                          Con Vehículo
                        </MDTypography>
                        <MDTypography variant="h4" fontWeight="medium">
                          {stats.withVehicle}
                        </MDTypography>
                      </MDBox>
                      <Icon sx={{ fontSize: 32, color: "primary.main" }}>directions_car</Icon>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>
            </Grid>

            {/* Filtros y búsqueda */}
            <Card sx={{ mb: 3 }}>
              <MDBox p={3}>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <MDInput
                      type="text"
                      label="Buscar visitas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      fullWidth
                      InputProps={{
                        startAdornment: <Icon>search</Icon>,
                      }}
                      placeholder="Visitante, email, placa..."
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      select
                      label="Estado"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      fullWidth
                      variant="outlined"
                    >
                      <MenuItem value="all">Todas</MenuItem>
                      <MenuItem value="active">Activas</MenuItem>
                      <MenuItem value="completed">Completadas</MenuItem>
                      <MenuItem value="cancelled">Canceladas</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      select
                      label="Vehículo"
                      value={vehicleFilter}
                      onChange={(e) => setVehicleFilter(e.target.value)}
                      fullWidth
                      variant="outlined"
                    >
                      <MenuItem value="all">Todos</MenuItem>
                      <MenuItem value="with_vehicle">Con vehículo</MenuItem>
                      <MenuItem value="without_vehicle">Sin vehículo</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={4} display="flex" justifyContent="flex-end" gap={1}>
                    <MDButton
                      variant="outlined"
                      color="secondary"
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                        setVehicleFilter("all");
                      }}
                      startIcon={<Icon>clear</Icon>}
                    >
                      Limpiar
                    </MDButton>
                  </Grid>
                </Grid>
              </MDBox>
            </Card>

            {/* DataGrid */}
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" fontWeight="medium" gutterBottom>
                  Lista de Visitas ({filteredVisits.length})
                </MDTypography>

                <div style={{ width: "100%" }}>
                  <DataGrid
                    autoHeight
                    rows={filteredVisits}
                    columns={columns}
                    getRowId={(row) => row.id}
                    pageSize={rowsPerPage}
                    onPageSizeChange={(newPageSize) => setRowsPerPage(newPageSize)}
                    pagination
                    paginationModel={{ page, pageSize: rowsPerPage }}
                    onPaginationModelChange={(model) => {
                      setPage(model.page);
                      setRowsPerPage(model.pageSize);
                    }}
                    disableRowSelectionOnClick
                    loading={loading}
                    sx={{
                      "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: "#f5f5f5",
                        fontWeight: "bold",
                      },
                      "& .MuiDataGrid-cell": {
                        whiteSpace: "nowrap",
                      },
                    }}
                  />
                </div>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Diálogo de finalización de visita */}
      <EndVisitDialog
        visit={endVisitDialog.visit}
        isOpen={endVisitDialog.open}
        onClose={closeEndVisitDialog}
        onConfirm={handleEndVisit}
      />

      {/* Menú de acciones */}
      <Menu
        anchorEl={actionMenu.anchorEl}
        open={Boolean(actionMenu.anchorEl)}
        onClose={closeActionMenu}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {actionMenu.visit?.status === "active" && (
          <MenuItem
            onClick={() => openEndVisitDialog(actionMenu.visit)}
            sx={{ color: "error.main" }}
          >
            <Icon sx={{ mr: 1 }}>exit_to_app</Icon>
            Finalizar Visita
          </MenuItem>
        )}
        <MenuItem onClick={closeActionMenu}>
          <Icon sx={{ mr: 1 }}>visibility</Icon>
          Ver Detalles
        </MenuItem>
        {actionMenu.visit?.status === "completed" && (
          <MenuItem onClick={closeActionMenu}>
            <Icon sx={{ mr: 1 }}>print</Icon>
            Generar Reporte
          </MenuItem>
        )}
      </Menu>
    </DashboardLayout>
  );
}

export default VisitsManagement;
