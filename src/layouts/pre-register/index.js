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
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  FormControlLabel,
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
import { preRegisterService, visitorService } from "../../services/apiServices";

// Componente de Selección de Visitante
const VisitorSelector = ({ selectedVisitorId, onVisitorSelect, onCancel }) => {
  const [visitors, setVisitors] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    loadVisitors();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, visitors]);

  const loadVisitors = async () => {
    setLoading(true);
    try {
      const data = await visitorService.getAll();
      console.log("Visitantes cargados para selección:", data);
      setVisitors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading visitors for selection:", error);
      setVisitors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredVisitors(visitors);
      return;
    }

    const filtered = visitors.filter(
      (visitor) =>
        visitor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (visitor.company && visitor.company.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setFilteredVisitors(filtered);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const paginatedVisitors = filteredVisitors.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <>
      <DialogContent sx={{ minWidth: "800px", minHeight: "600px" }}>
        <MDBox sx={{ mb: 3 }}>
          <MDTypography variant="body2" color="text">
            Selecciona un visitante de la lista o busca por nombre, email o empresa
          </MDTypography>
        </MDBox>

        {/* Búsqueda */}
        <MDBox sx={{ mb: 3 }}>
          <MDInput
            type="text"
            label="Buscar visitante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: <Icon>search</Icon>,
            }}
            placeholder="Nombre, email o empresa"
          />
        </MDBox>

        {/* Tabla de visitantes */}
        <Paper elevation={2} sx={{ mb: 3 }}>
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Seleccionar</TableCell>
                  <TableCell>Visitante</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Empresa</TableCell>
                  <TableCell>Identificación</TableCell>
                  <TableCell>Registro</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <MDTypography variant="body2" color="text">
                        Cargando visitantes...
                      </MDTypography>
                    </TableCell>
                  </TableRow>
                ) : paginatedVisitors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <MDTypography variant="body2" color="text">
                        {searchTerm
                          ? "No se encontraron visitantes con ese criterio"
                          : "No hay visitantes registrados"}
                      </MDTypography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedVisitors.map((visitor) => (
                    <TableRow
                      key={visitor.id}
                      hover
                      selected={selectedVisitorId === visitor.id}
                      sx={{ cursor: "pointer" }}
                      onClick={() => onVisitorSelect(visitor)}
                    >
                      <TableCell>
                        <Radio
                          checked={selectedVisitorId === visitor.id}
                          onChange={() => onVisitorSelect(visitor)}
                          value={visitor.id}
                          name="visitor-selection"
                        />
                      </TableCell>
                      <TableCell>
                        <MDBox display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, width: 32, height: 32 }} src={visitor.photo_url}>
                            {visitor.full_name?.charAt(0) || "?"}
                          </Avatar>
                          <MDBox>
                            <MDTypography variant="body2" fontWeight="medium">
                              {visitor.full_name || "Sin nombre"}
                            </MDTypography>
                            <MDTypography variant="caption" color="text">
                              {visitor.phone || "Sin teléfono"}
                            </MDTypography>
                          </MDBox>
                        </MDBox>
                      </TableCell>
                      <TableCell>
                        <MDTypography variant="body2">{visitor.email || "Sin email"}</MDTypography>
                      </TableCell>
                      <TableCell>
                        <MDTypography variant="body2">
                          {visitor.company || "Sin empresa"}
                        </MDTypography>
                      </TableCell>
                      <TableCell>
                        <MDBox>
                          <MDTypography variant="body2" fontWeight="medium">
                            {visitor.identification || "Sin ID"}
                          </MDTypography>
                          <MDTypography variant="caption" color="text">
                            {visitor.no_identification || "Sin número"}
                          </MDTypography>
                        </MDBox>
                      </TableCell>
                      <TableCell>
                        <MDTypography variant="caption" color="text">
                          {visitor.created_at ? formatDate(visitor.created_at) : "Sin fecha"}
                        </MDTypography>
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
            count={filteredVisitors.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`
            }
          />
        </Paper>
      </DialogContent>

      <DialogActions>
        <MDButton onClick={onCancel} variant="outlined" color="secondary">
          Cancelar
        </MDButton>
        <MDButton
          onClick={() => {
            const visitorToSelect = visitors.find((v) => v.id === selectedVisitorId);
            console.log("Confirmando selección de visitante:", visitorToSelect);
            if (visitorToSelect) {
              onVisitorSelect(visitorToSelect);
            }
          }}
          variant="gradient"
          color="primary"
          disabled={!selectedVisitorId}
        >
          Seleccionar Visitante
        </MDButton>
      </DialogActions>
    </>
  );
};

// Componente del Formulario Principal
const PreRegisterForm = ({ preRegister, onSave, onCancel, isEdit = false }) => {
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [authorizers, setAuthorizers] = useState([]);
  const [showVisitorSelector, setShowVisitorSelector] = useState(false);

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

  const loadAuthorizers = async () => {
    try {
      // Simulando carga de autorizadores - reemplazar con API real
      setAuthorizers([
        { id: 2, name: "Jorge Mendez", email: "jorge.mendez@empresa.com" },
        { id: 3, name: "Sofia Castro", email: "sofia.castro@empresa.com" },
        { id: 4, name: "Luis Hernandez", email: "luis.hernandez@empresa.com" },
      ]);
    } catch (error) {
      console.error("Error loading authorizers:", error);
    }
  };

  const handleChange = (field) => (event) => {
    const value = event.target ? event.target.value : event;
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleVisitorSelect = (visitor) => {
    if (visitor) {
      console.log("Visitante seleccionado:", visitor);
      setSelectedVisitor(visitor);
      setFormData((prev) => ({
        ...prev,
        visitor_id: visitor.id,
      }));
    }
    setShowVisitorSelector(false);
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
        visit_date: formData.visit_date,
        visit_time: formData.visit_time,
        purpose: formData.visit_purpose.trim(),
        host_name: authorizers.find((a) => a.id === formData.authorizer_id)?.name || "",
        host_email: authorizers.find((a) => a.id === formData.authorizer_id)?.email || "",
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
              {/* Información del Visitante */}
              <Grid item xs={12}>
                <MDTypography variant="h6" color="primary">
                  Selección de Visitante
                </MDTypography>
                <MDTypography variant="body2" color="text" sx={{ mt: 1 }}>
                  Los pre-registros requieren seleccionar un visitante existente en el sistema
                </MDTypography>
              </Grid>

              <Grid item xs={12}>
                {selectedVisitor ? (
                  <Paper elevation={1} sx={{ p: 2 }}>
                    <MDBox display="flex" alignItems="center" justifyContent="space-between">
                      <MDBox display="flex" alignItems="center">
                        <Avatar
                          sx={{ mr: 2, width: 40, height: 40 }}
                          src={selectedVisitor.photo_url}
                        >
                          {selectedVisitor.full_name?.charAt(0) || "?"}
                        </Avatar>
                        <MDBox>
                          <MDTypography variant="body2" fontWeight="medium">
                            {selectedVisitor.full_name}
                          </MDTypography>
                          <MDTypography variant="caption" color="text">
                            {selectedVisitor.email} • {selectedVisitor.company || "Sin empresa"}
                          </MDTypography>
                          <MDTypography variant="caption" color="text" display="block">
                            Tel: {selectedVisitor.phone || "No especificado"} • ID:{" "}
                            {selectedVisitor.identification} - {selectedVisitor.no_identification}
                          </MDTypography>
                        </MDBox>
                      </MDBox>
                      <MDButton
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => setShowVisitorSelector(true)}
                      >
                        Cambiar
                      </MDButton>
                    </MDBox>
                  </Paper>
                ) : (
                  <MDBox>
                    <MDButton
                      variant="outlined"
                      color="primary"
                      onClick={() => setShowVisitorSelector(true)}
                      fullWidth
                      sx={{ py: 2 }}
                      startIcon={<Icon>person_search</Icon>}
                    >
                      Seleccionar Visitante
                    </MDButton>
                    {errors.visitor_id && (
                      <MDTypography
                        variant="caption"
                        color="error"
                        sx={{ mt: 1, display: "block" }}
                      >
                        {errors.visitor_id}
                      </MDTypography>
                    )}
                  </MDBox>
                )}
              </Grid>

              {/* Información del Autorizador */}
              <Grid item xs={12}>
                <Divider />
                <MDTypography variant="h6" color="primary" sx={{ mt: 2 }}>
                  Información del Autorizador
                </MDTypography>
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  options={authorizers}
                  getOptionLabel={(option) => `${option.name} (${option.email})`}
                  value={authorizers.find((a) => a.id === formData.authorizer_id) || null}
                  onChange={(event, newValue) =>
                    handleChange("authorizer_id")(newValue?.id || null)
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Seleccionar Autorizador"
                      error={!!errors.authorizer_id}
                      helperText={errors.authorizer_id}
                      required
                    />
                  )}
                />
              </Grid>

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

      {/* Diálogo de selección de visitante */}
      <Dialog
        open={showVisitorSelector}
        onClose={() => setShowVisitorSelector(false)}
        maxWidth="lg"
        fullWidth
        aria-labelledby="visitor-selector-title"
      >
        <DialogTitle id="visitor-selector-title">
          <MDTypography variant="h4" fontWeight="medium">
            Seleccionar Visitante
          </MDTypography>
        </DialogTitle>
        <VisitorSelector
          selectedVisitorId={selectedVisitor?.id || null}
          onVisitorSelect={handleVisitorSelect}
          onCancel={() => setShowVisitorSelector(false)}
        />
      </Dialog>
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
    pending: 8,
    approved: 15,
    today: 3,
    thisWeek: 12,
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
                      Esta Semana
                    </MDTypography>
                    <MDTypography variant="h4" fontWeight="medium">
                      {stats.thisWeek}
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
                                  {preRegister.host_name || "-"}
                                </MDTypography>
                                <MDTypography variant="caption" color="text">
                                  {preRegister.host_email || "-"}
                                </MDTypography>
                              </MDBox>
                            </TableCell>
                            <TableCell>
                              <MDTypography variant="body2">
                                {preRegister.purpose || "-"}
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
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`
                  }
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
        <MenuItem onClick={closeActionMenu}>
          <Icon sx={{ mr: 1 }}>check</Icon>
          Aprobar
        </MenuItem>
        <MenuItem onClick={closeActionMenu} sx={{ color: "error.main" }}>
          <Icon sx={{ mr: 1 }}>close</Icon>
          Rechazar
        </MenuItem>
      </Menu>

      <Footer />
    </DashboardLayout>
  );
}

export default PreRegisterManagement;
