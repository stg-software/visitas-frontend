/* eslint-disable react/prop-types */
// src/layouts/pre-register/index.js
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Alert,
  Tooltip,
  Menu,
  MenuItem,
  Fab,
  TextField,
  Autocomplete,
  Avatar,
  Divider,
  Paper,
  Box,
  Radio,
} from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Servicios de API
import { preRegisterService, visitorService, userService } from "../../services/apiServices";

// Componente del Formulario Principal
const PreRegisterForm = ({ preRegister, onSave, onCancel, isEdit = false }) => {
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [selectedAuthorizer, setSelectedAuthorizer] = useState(null);
  const [visitors, setVisitors] = useState([]);
  const [authorizers, setAuthorizers] = useState([]);
  const [loadingVisitors, setLoadingVisitors] = useState(false);
  const [loadingAuthorizers, setLoadingAuthorizers] = useState(false);

  const [formData, setFormData] = useState({
    visitor_id: null,
    authorizer_id: null,
    visit_purpose: "",
    visit_date: "",
    visit_time: "",
    expected_duration_hours: 2,
    additional_notes: "",
    ...preRegister,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadVisitors();
    loadAuthorizers();
    if (!isEdit) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData((prev) => ({
        ...prev,
        visit_date: tomorrow.toISOString().split("T")[0],
        visit_time: "10:00",
      }));
    }
  }, [isEdit]);

  const loadVisitors = async () => {
    setLoadingVisitors(true);
    try {
      const data = await visitorService.getAll();
      console.log("Visitantes cargados:", data);
      setVisitors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading visitors:", error);
      setVisitors([]);
    } finally {
      setLoadingVisitors(false);
    }
  };

  const loadAuthorizers = async () => {
    setLoadingAuthorizers(true);
    try {
      const data = await userService.getAuthorizers();
      console.log("Autorizadores cargados:", data);
      setAuthorizers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading authorizers:", error);
      setAuthorizers([]);
    } finally {
      setLoadingAuthorizers(false);
    }
  };

  const handleChange = (field) => (event) => {
    const value = event.target ? event.target.value : event;
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleVisitorSelect = (event, newValue) => {
    console.log("Visitante seleccionado:", newValue);
    setSelectedVisitor(newValue);
    setFormData((prev) => ({
      ...prev,
      visitor_id: newValue?.id || null,
    }));

    if (errors.visitor_id) {
      setErrors((prev) => ({ ...prev, visitor_id: "" }));
    }
  };

  const handleAuthorizerSelect = (event, newValue) => {
    console.log("Autorizador seleccionado:", newValue);
    setSelectedAuthorizer(newValue);
    setFormData((prev) => ({
      ...prev,
      authorizer_id: newValue?.id || null,
    }));

    if (errors.authorizer_id) {
      setErrors((prev) => ({ ...prev, authorizer_id: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.visitor_id) {
      newErrors.visitor_id = "Debe seleccionar un visitante";
    }

    if (!formData.authorizer_id) {
      newErrors.authorizer_id = "Debe seleccionar un autorizador";
    }
    if (!formData.visit_purpose.trim()) {
      newErrors.visit_purpose = "El propósito de la visita es requerido";
    }
    if (!formData.visit_date) {
      newErrors.visit_date = "La fecha de visita es requerida";
    }
    if (!formData.visit_time) {
      newErrors.visit_time = "La hora de visita es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        visitor_id: formData.visitor_id,
        authorizer_id: formData.authorizer_id,
        visit_date: formData.visit_date,
        visit_time: formData.visit_time,
        purpose: formData.visit_purpose.trim(),
        estimated_duration: parseInt(formData.expected_duration_hours) * 60,
        additional_notes: formData.additional_notes.trim() || null,
      };

      console.log("Datos a enviar:", submitData);
      await onSave(submitData);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <DialogContent data-testid="preregister-dialog" id="preregister-dialog-description">
          <MDBox component="div" sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              {/* Selección de Visitante */}
              <Grid item xs={12}>
                <MDTypography variant="h6" color="primary">
                  Selección de Visitante
                </MDTypography>
                <MDTypography variant="body2" color="text" sx={{ mt: 1, mb: 2 }}>
                  Selecciona un visitante registrado en el sistema
                </MDTypography>
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  options={visitors}
                  getOptionLabel={(option) =>
                    `${option.full_name} - ${option.identification}: ${option.no_identification}`
                  }
                  value={selectedVisitor}
                  onChange={handleVisitorSelect}
                  loading={loadingVisitors}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Seleccionar Visitante"
                      error={!!errors.visitor_id}
                      helperText={errors.visitor_id}
                      required
                      placeholder="Buscar por nombre o identificación"
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Avatar sx={{ mr: 2, width: 32, height: 32 }} src={option.photo_url}>
                        {option.full_name?.charAt(0) || "?"}
                      </Avatar>
                      <Box>
                        <MDTypography variant="body2" fontWeight="medium">
                          {option.full_name}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          {option.identification}: {option.no_identification}
                        </MDTypography>
                      </Box>
                    </Box>
                  )}
                />
              </Grid>

              {/* Información del Visitante Seleccionado */}
              {selectedVisitor && (
                <Grid item xs={12}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      backgroundColor: "#f8f9fa",
                      border: "1px solid #e9ecef",
                    }}
                  >
                    <MDBox display="flex" alignItems="center">
                      <Avatar sx={{ mr: 2, width: 50, height: 50 }} src={selectedVisitor.photo_url}>
                        {selectedVisitor.full_name?.charAt(0) || "?"}
                      </Avatar>
                      <MDBox sx={{ flexGrow: 1 }}>
                        <MDTypography variant="h6" fontWeight="medium">
                          {selectedVisitor.full_name}
                        </MDTypography>
                        <MDTypography variant="body2" color="text">
                          {selectedVisitor.email} • {selectedVisitor.company || "Sin empresa"}
                        </MDTypography>
                        <MDTypography variant="body2" color="text">
                          Tel: {selectedVisitor.phone || "No especificado"} • ID:{" "}
                          {selectedVisitor.identification} - {selectedVisitor.no_identification}
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  </Paper>
                </Grid>
              )}

              {/* Información del Autorizador */}
              <Grid item xs={12}>
                <Divider />
                <MDTypography variant="h6" color="primary" sx={{ mt: 2 }}>
                  Información del Autorizador
                </MDTypography>
                <MDTypography variant="body2" color="text" sx={{ mt: 1, mb: 2 }}>
                  Selecciona el empleado que autorizará la visita
                </MDTypography>
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  options={authorizers}
                  getOptionLabel={(option) =>
                    `${option.full_name} - ${option.department || "Sin departamento"}`
                  }
                  value={selectedAuthorizer}
                  onChange={handleAuthorizerSelect}
                  loading={loadingAuthorizers}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Seleccionar Autorizador"
                      error={!!errors.authorizer_id}
                      helperText={errors.authorizer_id}
                      required
                      placeholder="Buscar por nombre o departamento"
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                        {option.full_name?.charAt(0) || "?"}
                      </Avatar>
                      <Box>
                        <MDTypography variant="body2" fontWeight="medium">
                          {option.full_name}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          {option.department || "Sin departamento"} •{" "}
                          {option.position || "Sin posición"}
                        </MDTypography>
                      </Box>
                    </Box>
                  )}
                />
              </Grid>

              {/* Información del Autorizador Seleccionado */}
              {selectedAuthorizer && (
                <Grid item xs={12}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      backgroundColor: "#f0f8ff",
                      border: "1px solid #b3d9ff",
                    }}
                  >
                    <MDBox display="flex" alignItems="center">
                      <Avatar sx={{ mr: 2, width: 50, height: 50 }}>
                        {selectedAuthorizer.full_name?.charAt(0) || "?"}
                      </Avatar>
                      <MDBox sx={{ flexGrow: 1 }}>
                        <MDTypography variant="h6" fontWeight="medium">
                          {selectedAuthorizer.full_name}
                        </MDTypography>
                        <MDTypography variant="body2" color="text">
                          {selectedAuthorizer.email} •{" "}
                          {selectedAuthorizer.department || "Sin departamento"}
                        </MDTypography>
                        <MDTypography variant="body2" color="text">
                          {selectedAuthorizer.position || "Sin posición"} • Tel:{" "}
                          {selectedAuthorizer.phone || "No especificado"}
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  </Paper>
                </Grid>
              )}

              {/* Información de la Visita */}
              <Grid item xs={12}>
                <Divider />
                <MDTypography variant="h6" color="primary" sx={{ mt: 2 }}>
                  Información de la Visita
                </MDTypography>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDInput
                  type="date"
                  label="Fecha de Visita"
                  value={formData.visit_date}
                  onChange={handleChange("visit_date")}
                  fullWidth
                  required
                  error={!!errors.visit_date}
                  helperText={errors.visit_date}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: new Date().toISOString().split("T")[0] }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDInput
                  type="time"
                  label="Hora de Visita"
                  value={formData.visit_time}
                  onChange={handleChange("visit_time")}
                  fullWidth
                  required
                  error={!!errors.visit_time}
                  helperText={errors.visit_time}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <MDInput
                  type="text"
                  label="Propósito de la Visita"
                  value={formData.visit_purpose}
                  onChange={handleChange("visit_purpose")}
                  fullWidth
                  multiline
                  rows={2}
                  required
                  error={!!errors.visit_purpose}
                  helperText={errors.visit_purpose}
                  placeholder="Reunión de negocios, presentación..."
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDInput
                  type="number"
                  label="Duración (horas)"
                  value={formData.expected_duration_hours}
                  onChange={handleChange("expected_duration_hours")}
                  fullWidth
                  inputProps={{ min: 1, max: 12, step: 0.5 }}
                />
              </Grid>
              <Grid item xs={12}>
                <MDInput
                  type="text"
                  label="Notas Adicionales"
                  value={formData.additional_notes}
                  onChange={handleChange("additional_notes")}
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Información adicional..."
                />
              </Grid>
            </Grid>
          </MDBox>
        </DialogContent>

        <DialogActions>
          <MDButton
            onClick={onCancel}
            variant="outlined"
            color="secondary"
            aria-label="Cancelar formulario de pre-registro"
          >
            Cancelar
          </MDButton>
          <MDButton
            type="submit"
            variant="gradient"
            color="primary"
            disabled={isSubmitting}
            aria-label={
              isSubmitting
                ? "Guardando pre-registro..."
                : isEdit
                ? "Actualizar pre-registro"
                : "Crear pre-registro"
            }
          >
            {isSubmitting ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}
          </MDButton>
        </DialogActions>
      </form>
    </>
  );
};

// Componente Principal
function PreRegisterManagement() {
  // Estados principales
  const [preRegisters, setPreRegisters] = useState([]);
  const [filteredPreRegisters, setFilteredPreRegisters] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados para la tabla
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para el diálogo
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPreRegister, setEditingPreRegister] = useState(null);

  // Estados para alertas
  const [alert, setAlert] = useState({ show: false, message: "", severity: "success" });

  // Estados para menú de acciones
  const [actionMenu, setActionMenu] = useState({ anchorEl: null, preRegister: null });

  // Efectos
  useEffect(() => {
    console.log("=== CONFIGURACIÓN DE PRE-REGISTROS ===");
    console.log("API URL:", process.env.REACT_APP_API_URL || "http://localhost:8000");
    console.log("Token disponible:", !!localStorage.getItem("access_token"));
    console.log("Servicio importado:", !!preRegisterService);

    loadPreRegisters();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, preRegisters]);

  // Funciones de carga de datos
  const loadPreRegisters = async () => {
    console.log("=== CARGANDO PRE-REGISTROS ===");
    setLoading(true);
    try {
      const data = await preRegisterService.getAll();
      console.log("Pre-registros cargados exitosamente:", data);
      setPreRegisters(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading pre-registers:", error);
      showAlert("Error al cargar pre-registros: " + error.message, "error");
      setPreRegisters([]);
    } finally {
      setLoading(false);
    }
  };

  // Función de búsqueda
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredPreRegisters(preRegisters);
      return;
    }

    const filtered = preRegisters.filter(
      (preRegister) =>
        preRegister.visitor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        preRegister.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        preRegister.host_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredPreRegisters(filtered);
    setPage(0);
  };

  // Funciones de gestión de pre-registros
  const handleCreatePreRegister = async (preRegisterData) => {
    console.log("=== CREANDO PRE-REGISTRO ===");
    console.log("Datos a enviar:", preRegisterData);

    try {
      const newPreRegister = await preRegisterService.create(preRegisterData);
      console.log("Pre-registro creado exitosamente:", newPreRegister);

      await loadPreRegisters();

      setDialogOpen(false);
      setEditingPreRegister(null);
      showAlert("Pre-registro creado exitosamente", "success");
    } catch (error) {
      console.error("Error creating pre-register:", error);
      showAlert("Error al crear pre-registro: " + error.message, "error");
    }
  };

  const handleUpdatePreRegister = async (preRegisterData) => {
    console.log("=== ACTUALIZANDO PRE-REGISTRO ===");
    console.log("ID:", editingPreRegister.id);
    console.log("Datos a actualizar:", preRegisterData);

    try {
      const updatedPreRegister = await preRegisterService.update(
        editingPreRegister.id,
        preRegisterData
      );
      console.log("Pre-registro actualizado exitosamente:", updatedPreRegister);

      await loadPreRegisters();

      setDialogOpen(false);
      setEditingPreRegister(null);
      showAlert("Pre-registro actualizado exitosamente", "success");
    } catch (error) {
      console.error("Error updating pre-register:", error);
      showAlert("Error al actualizar pre-registro: " + error.message, "error");
    }
  };

  const handleDeletePreRegister = async (preRegisterId) => {
    if (!window.confirm("¿Está seguro de que desea eliminar este pre-registro?")) {
      return;
    }

    console.log("=== ELIMINANDO PRE-REGISTRO ===");
    console.log("ID a eliminar:", preRegisterId);

    try {
      await preRegisterService.delete(preRegisterId);
      console.log("Pre-registro eliminado exitosamente");

      await loadPreRegisters();

      showAlert("Pre-registro eliminado exitosamente", "success");
    } catch (error) {
      console.error("Error deleting pre-register:", error);
      showAlert("Error al eliminar pre-registro: " + error.message, "error");
    }
    closeActionMenu();
  };

  const handleApprove = async (preRegisterId) => {
    try {
      await preRegisterService.approve(preRegisterId, "Aprobado desde el panel de administración");
      await loadPreRegisters();
      showAlert("Pre-registro aprobado exitosamente", "success");
    } catch (error) {
      console.error("Error al aprobar:", error);
      showAlert("Error al aprobar pre-registro: " + error.message, "error");
    }
    closeActionMenu();
  };

  const handleReject = async (preRegisterId) => {
    const reason = prompt("Ingrese la razón del rechazo:");
    if (reason) {
      try {
        await preRegisterService.reject(preRegisterId, reason);
        await loadPreRegisters();
        showAlert("Pre-registro rechazado", "info");
      } catch (error) {
        console.error("Error al rechazar:", error);
        showAlert("Error al rechazar pre-registro: " + error.message, "error");
      }
    }
    closeActionMenu();
  };

  // Funciones de UI
  const showAlert = (message, severity = "success") => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ show: false, message: "", severity: "success" }), 4000);
  };

  const openCreateDialog = () => {
    setEditingPreRegister(null);
    setDialogOpen(true);
    setTimeout(() => {
      const firstInput = document.querySelector('[data-testid="preregister-dialog"] input');
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);
  };

  const openEditDialog = (preRegister) => {
    setEditingPreRegister(preRegister);
    setDialogOpen(true);
    closeActionMenu();
    setTimeout(() => {
      const firstInput = document.querySelector('[data-testid="preregister-dialog"] input');
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingPreRegister(null);
  };

  const openActionMenu = (event, preRegister) => {
    setActionMenu({ anchorEl: event.currentTarget, preRegister });
  };

  const closeActionMenu = () => {
    setActionMenu({ anchorEl: null, preRegister: null });
  };

  // Funciones de paginación
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Formateo de datos
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString, timeString) => {
    const date = new Date(`${dateString}T${timeString}`);
    return date.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "approved":
        return "success";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "approved":
        return "Aprobado";
      case "rejected":
        return "Rechazado";
      default:
        return "Desconocido";
    }
  };

  // Datos paginados
  const paginatedPreRegisters = filteredPreRegisters.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Datos simulados para mostrar las estadísticas
  const stats = {
    pending: filteredPreRegisters.filter((pr) => pr.status === "pending").length,
    approved: filteredPreRegisters.filter((pr) => pr.status === "approved").length,
    today: filteredPreRegisters.filter(
      (pr) => pr.visit_date === new Date().toISOString().split("T")[0]
    ).length,
    thisWeek: filteredPreRegisters.length,
  };

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
                  Gestión de Pre-registros
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  Administra las solicitudes de visita y pre-registros de visitantes
                </MDTypography>
              </MDBox>
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
                    <MDTypography variant="body2" color="text" gutterBottom>
                      Pendientes
                    </MDTypography>
                    <MDTypography variant="h4" fontWeight="medium">
                      {stats.pending}
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="body2" color="text" gutterBottom>
                      Aprobados
                    </MDTypography>
                    <MDTypography variant="h4" fontWeight="medium">
                      {stats.approved}
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="body2" color="text" gutterBottom>
                      Hoy
                    </MDTypography>
                    <MDTypography variant="h4" fontWeight="medium">
                      {stats.today}
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="body2" color="text" gutterBottom>
                      Total
                    </MDTypography>
                    <MDTypography variant="h4" fontWeight="medium">
                      {filteredPreRegisters.length}
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>
            </Grid>

            {/* Filtros y búsqueda */}
            <Card sx={{ mb: 3 }}>
              <MDBox p={3}>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <MDInput
                      type="text"
                      label="Buscar pre-registros..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      fullWidth
                      InputProps={{
                        startAdornment: <Icon>search</Icon>,
                      }}
                      placeholder="Visitante, propósito, anfitrión"
                    />
                  </Grid>
                  <Grid item xs={12} md={6} display="flex" justifyContent="flex-end">
                    <MDButton
                      variant="gradient"
                      color="primary"
                      onClick={openCreateDialog}
                      startIcon={<Icon>add</Icon>}
                    >
                      Nuevo Pre-registro
                    </MDButton>
                  </Grid>
                </Grid>
              </MDBox>
            </Card>

            {/* Tabla de pre-registros */}
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" fontWeight="medium" gutterBottom>
                  Lista de Pre-registros ({filteredPreRegisters.length})
                </MDTypography>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Visitante</TableCell>
                        <TableCell>Anfitrión</TableCell>
                        <TableCell>Propósito</TableCell>
                        <TableCell>Fecha/Hora</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Registro</TableCell>
                        <TableCell align="center">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            <MDTypography variant="body2" color="text">
                              Cargando pre-registros...
                            </MDTypography>
                          </TableCell>
                        </TableRow>
                      ) : paginatedPreRegisters.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            <MDTypography variant="body2" color="text">
                              {searchTerm
                                ? "No se encontraron pre-registros con ese criterio"
                                : "No hay pre-registros"}
                            </MDTypography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedPreRegisters.map((preRegister) => (
                          <TableRow key={preRegister.id} hover>
                            <TableCell>
                              <MDBox>
                                <MDTypography variant="body2" fontWeight="medium">
                                  {preRegister.visitor_name || "-"}
                                </MDTypography>
                                <MDTypography variant="caption" color="text">
                                  {preRegister.visitor_email || "-"}
                                </MDTypography>
                              </MDBox>
                            </TableCell>
                            <TableCell>
                              <MDBox>
                                <MDTypography variant="body2" fontWeight="medium">
                                  {preRegister.authorizer_name || "-"}
                                </MDTypography>
                                <MDTypography variant="caption" color="text">
                                  {preRegister.authorizer_email || "-"}
                                </MDTypography>
                              </MDBox>
                            </TableCell>
                            <TableCell>
                              <MDTypography variant="body2">
                                {preRegister.visit_purpose || preRegister.purpose || "-"}
                              </MDTypography>
                            </TableCell>
                            <TableCell>
                              <MDTypography variant="body2">
                                {preRegister.visit_date && preRegister.visit_time
                                  ? formatDateTime(preRegister.visit_date, preRegister.visit_time)
                                  : "-"}
                              </MDTypography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={getStatusLabel(preRegister.status || "pending")}
                                color={getStatusColor(preRegister.status || "pending")}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <MDTypography variant="caption" color="text">
                                {formatDate(preRegister.created_at || new Date())}
                              </MDTypography>
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Más opciones">
                                <IconButton
                                  size="small"
                                  onClick={(e) => openActionMenu(e, preRegister)}
                                >
                                  <Icon>more_vert</Icon>
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Paginación */}
                <TablePagination
                  component="div"
                  count={filteredPreRegisters.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  labelRowsPerPage="Filas por página:"
                  labelDisplayedRows={(paginationInfo) => {
                    const { from, to, count } = paginationInfo;
                    const total = count !== -1 ? count : `más de ${to}`;
                    return `${from}–${to} de ${total}`;
                  }}
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* FAB para crear pre-registro en móvil */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={openCreateDialog}
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          display: { xs: "flex", md: "none" },
        }}
      >
        <Icon>add</Icon>
      </Fab>

      {/* Diálogo de creación/edición */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        maxWidth="lg"
        fullWidth
        disablePortal={false}
        keepMounted={false}
        aria-labelledby="preregister-dialog-title"
        aria-describedby="preregister-dialog-description"
        disableRestoreFocus={false}
        PaperProps={{
          sx: { minHeight: "600px" },
          "aria-modal": true,
          role: "dialog",
        }}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        }}
      >
        <DialogTitle id="preregister-dialog-title">
          <MDTypography variant="h4" fontWeight="medium">
            {editingPreRegister ? "Editar Pre-registro" : "Nuevo Pre-registro"}
          </MDTypography>
        </DialogTitle>

        <PreRegisterForm
          preRegister={editingPreRegister}
          onSave={editingPreRegister ? handleUpdatePreRegister : handleCreatePreRegister}
          onCancel={closeDialog}
          isEdit={!!editingPreRegister}
        />
      </Dialog>

      {/* Menú de acciones */}
      <Menu
        anchorEl={actionMenu.anchorEl}
        open={Boolean(actionMenu.anchorEl)}
        onClose={closeActionMenu}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={() => openEditDialog(actionMenu.preRegister)}>
          <Icon sx={{ mr: 1 }}>edit</Icon>
          Editar
        </MenuItem>
        <MenuItem
          onClick={() => handleDeletePreRegister(actionMenu.preRegister?.id)}
          sx={{ color: "error.main" }}
        >
          <Icon sx={{ mr: 1 }}>delete</Icon>
          Eliminar
        </MenuItem>
        {actionMenu.preRegister?.status === "pending" && (
          <>
            <MenuItem onClick={() => handleApprove(actionMenu.preRegister?.id)}>
              <Icon sx={{ mr: 1 }}>check</Icon>
              Aprobar
            </MenuItem>
            <MenuItem
              onClick={() => handleReject(actionMenu.preRegister?.id)}
              sx={{ color: "error.main" }}
            >
              <Icon sx={{ mr: 1 }}>close</Icon>
              Rechazar
            </MenuItem>
          </>
        )}
      </Menu>

      <Footer />
    </DashboardLayout>
  );
}

export default PreRegisterManagement;
