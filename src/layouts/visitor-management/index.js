/**
 * Material Dashboard 2 React - v2.1.0
 * Sistema de Control de Visitas
 * Page: Gestión de Visitantes - ACTUALIZADO CON FOTO EN BASE64
 */

import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Fab from "@mui/material/Fab";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Importar servicio de API
import { visitorService } from "services/apiServices";
import PhotoCapture from "components/PhotoCapture";

// Función auxiliar para convertir File a Base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remover el prefijo "data:image/...;base64," para obtener solo el string base64
      const base64String = reader.result.split(",")[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Componente para el formulario de visitante actualizado
const VisitorForm = ({ visitor, onSave, onCancel, isEdit = false }) => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    company: "",
    identification: "",
    no_identification: "",
    ...visitor,
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));

    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handlePhotoCapture = async (file) => {
    console.log("=== CAPTURA DE FOTO ===");
    console.log("Archivo recibido:", file);

    setPhotoFile(file);

    try {
      // Convertir el archivo a base64
      const base64String = await fileToBase64(file);
      setPhotoBase64(base64String);

      console.log("Foto convertida a base64, longitud:", base64String.length);
      console.log("Primeros 50 caracteres:", base64String.substring(0, 50));

      // Limpiar error de foto si existe
      if (errors.photo) {
        setErrors((prev) => ({
          ...prev,
          photo: "",
        }));
      }
    } catch (error) {
      console.error("Error al convertir foto a base64:", error);
      setErrors((prev) => ({
        ...prev,
        photo: "Error al procesar la imagen",
      }));
    }
  };

  const handleClearPhoto = () => {
    console.log("=== LIMPIANDO FOTO ===");
    setPhotoFile(null);
    setPhotoBase64(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "El nombre completo es requerido";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El formato del email no es válido";
    }

    if (!formData.identification.trim()) {
      newErrors.identification = "El tipo de identificación es requerido";
    }

    if (!formData.no_identification.trim()) {
      newErrors.no_identification = "El número de identificación es requerido";
    }

    // Validar foto solo para nuevos visitantes (no para edición)
    if (!isEdit && !photoBase64) {
      newErrors.photo = "Es necesario capturar una foto del visitante";
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
      console.log("=== ENVIANDO DATOS DEL FORMULARIO ===");
      console.log("Datos del formulario:", formData);
      console.log("Foto en base64 disponible:", !!photoBase64);

      // Preparar datos para envío
      const submitData = {
        ...formData,
        // Incluir la foto en base64 si está disponible
        ...(photoBase64 && { photo_base64: photoBase64 }),
      };

      console.log("Datos finales a enviar:", {
        ...submitData,
        photo_base64: photoBase64
          ? `[Base64 string de ${photoBase64.length} caracteres]`
          : undefined,
      });

      await onSave(submitData);
    } catch (error) {
      console.error("Error al guardar visitante:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogContent data-testid="visitor-dialog" id="visitor-dialog-description">
        <MDBox component="div" sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            {/* Información Personal */}
            <Grid item xs={12}>
              <MDTypography variant="h6" color="primary">
                Información Personal
              </MDTypography>
            </Grid>

            <Grid item xs={12}>
              <MDInput
                type="text"
                label="Nombre Completo"
                value={formData.full_name}
                onChange={handleChange("full_name")}
                fullWidth
                required
                error={!!errors.full_name}
                helperText={errors.full_name}
                autoFocus
                aria-describedby={errors.full_name ? "fullname-error" : undefined}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <MDInput
                type="email"
                label="Email"
                value={formData.email}
                onChange={handleChange("email")}
                fullWidth
                required
                error={!!errors.email}
                helperText={errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <MDInput
                type="tel"
                label="Teléfono"
                value={formData.phone}
                onChange={handleChange("phone")}
                fullWidth
                error={!!errors.phone}
                helperText={errors.phone}
                placeholder="+52 555 123 4567"
                aria-describedby={errors.phone ? "phone-error" : undefined}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <MDInput
                type="text"
                label="Empresa"
                value={formData.company}
                onChange={handleChange("company")}
                fullWidth
                error={!!errors.company}
                helperText={errors.company}
                aria-describedby={errors.company ? "company-error" : undefined}
              />
            </Grid>

            {/* Información de Identificación */}
            <Grid item xs={12}>
              <Divider />
              <MDTypography variant="h6" color="primary" sx={{ mt: 2 }}>
                Información de Identificación
              </MDTypography>
            </Grid>

            <Grid item xs={12} md={6}>
              <MDInput
                type="text"
                label="Tipo de Identificación"
                value={formData.identification}
                onChange={handleChange("identification")}
                fullWidth
                required
                error={!!errors.identification}
                helperText={errors.identification}
                placeholder="INE, Pasaporte, Cédula, etc."
                aria-describedby={errors.identification ? "identification-error" : undefined}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <MDInput
                type="text"
                label="Número de Identificación"
                value={formData.no_identification}
                onChange={handleChange("no_identification")}
                fullWidth
                required
                error={!!errors.no_identification}
                helperText={errors.no_identification}
                placeholder="Número del documento"
                aria-describedby={errors.no_identification ? "no-identification-error" : undefined}
              />
            </Grid>

            {/* Captura de Foto */}
            <Grid item xs={12}>
              <Divider />
              <MDBox sx={{ mt: 2 }}>
                <PhotoCapture
                  onPhotoCapture={handlePhotoCapture}
                  currentPhoto={photoFile}
                  onClearPhoto={handleClearPhoto}
                />
                {errors.photo && (
                  <MDTypography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
                    {errors.photo}
                  </MDTypography>
                )}
                {/* Información de depuración */}
                {photoBase64 && (
                  <MDBox sx={{ mt: 1 }}>
                    <MDTypography variant="caption" color="success">
                      ✓ Foto lista para envío (Base64: {photoBase64.length} caracteres)
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
      </DialogContent>

      <DialogActions>
        <MDButton
          onClick={onCancel}
          variant="outlined"
          color="secondary"
          aria-label="Cancelar formulario de visitante"
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
              ? "Guardando visitante..."
              : isEdit
              ? "Actualizar visitante"
              : "Crear visitante"
          }
        >
          {isSubmitting ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}
        </MDButton>
      </DialogActions>
    </form>
  );
};

VisitorForm.propTypes = {
  visitor: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isEdit: PropTypes.bool,
};

// Componente principal
function VisitorManagement() {
  // Estados principales
  const [visitors, setVisitors] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados para la tabla
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para el diálogo
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState(null);

  // Estados para alertas
  const [alert, setAlert] = useState({ show: false, message: "", severity: "success" });

  // Estados para menú de acciones
  const [actionMenu, setActionMenu] = useState({ anchorEl: null, visitor: null });

  // Efectos
  useEffect(() => {
    console.log("=== CONFIGURACIÓN DE VISITANTES ===");
    console.log("API URL:", process.env.REACT_APP_API_URL || "http://localhost:8000");
    console.log("Token disponible:", !!localStorage.getItem("access_token"));
    console.log("Servicio importado:", !!visitorService);

    loadVisitors();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, visitors]);

  // Funciones de carga de datos
  const loadVisitors = async () => {
    console.log("=== CARGANDO VISITANTES ===");
    setLoading(true);
    try {
      const data = await visitorService.getAll();
      console.log("Visitantes cargados exitosamente:", data);
      setVisitors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading visitors:", error);
      showAlert("Error al cargar visitantes: " + error.message, "error");
      setVisitors([]);
    } finally {
      setLoading(false);
    }
  };

  // Función de búsqueda
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredVisitors(visitors);
      return;
    }

    const filtered = visitors.filter(
      (visitor) =>
        visitor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (visitor.company && visitor.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
        visitor.identification.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (visitor.no_identification &&
          visitor.no_identification.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setFilteredVisitors(filtered);
    setPage(0);
  };

  // Funciones de gestión de visitantes
  const handleCreateVisitor = async (visitorData) => {
    console.log("=== CREANDO VISITANTE ===");
    console.log("Datos a enviar:", {
      ...visitorData,
      photo_base64: visitorData.photo_base64
        ? `[Base64 de ${visitorData.photo_base64.length} caracteres]`
        : undefined,
    });

    console.log("Enviando datos como JSON, no FormData");
    console.log("Datos a enviar:", visitorData);

    try {
      // Enviar los datos como JSON en lugar de FormData
      const newVisitor = await visitorService.create(visitorData);
      console.log("Visitante creado exitosamente:", newVisitor);

      await loadVisitors();

      setDialogOpen(false);
      setEditingVisitor(null);
      showAlert("Visitante creado exitosamente", "success");
    } catch (error) {
      console.error("Error creating visitor:", error);
      showAlert("Error al crear visitante: " + error.message, "error");
    }
  };

  const handleUpdateVisitor = async (visitorData) => {
    console.log("=== ACTUALIZANDO VISITANTE ===");
    console.log("ID:", editingVisitor.id);
    console.log("Datos a actualizar:", {
      ...visitorData,
      photo_base64: visitorData.photo_base64
        ? `[Base64 de ${visitorData.photo_base64.length} caracteres]`
        : undefined,
    });

    try {
      const updatedVisitor = await visitorService.update(editingVisitor.id, visitorData);
      console.log("Visitante actualizado exitosamente:", updatedVisitor);

      await loadVisitors();

      setDialogOpen(false);
      setEditingVisitor(null);
      showAlert("Visitante actualizado exitosamente", "success");
    } catch (error) {
      console.error("Error updating visitor:", error);
      showAlert("Error al actualizar visitante: " + error.message, "error");
    }
  };

  const handleDeleteVisitor = async (visitorId) => {
    if (!window.confirm("¿Está seguro de que desea eliminar este visitante?")) {
      return;
    }

    console.log("=== ELIMINANDO VISITANTE ===");
    console.log("ID a eliminar:", visitorId);

    try {
      await visitorService.delete(visitorId);
      console.log("Visitante eliminado exitosamente");

      await loadVisitors();

      showAlert("Visitante eliminado exitosamente", "success");
    } catch (error) {
      console.error("Error deleting visitor:", error);
      showAlert("Error al eliminar visitante: " + error.message, "error");
    }
    closeActionMenu();
  };

  // Funciones de UI
  const showAlert = (message, severity = "success") => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ show: false, message: "", severity: "success" }), 4000);
  };

  const openCreateDialog = () => {
    setEditingVisitor(null);
    setDialogOpen(true);
    setTimeout(() => {
      const firstInput = document.querySelector('[data-testid="visitor-dialog"] input');
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);
  };

  const openEditDialog = (visitor) => {
    setEditingVisitor(visitor);
    setDialogOpen(true);
    closeActionMenu();
    setTimeout(() => {
      const firstInput = document.querySelector('[data-testid="visitor-dialog"] input');
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingVisitor(null);
  };

  const openActionMenu = (event, visitor) => {
    setActionMenu({ anchorEl: event.currentTarget, visitor });
  };

  const closeActionMenu = () => {
    setActionMenu({ anchorEl: null, visitor: null });
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (isActive) => {
    return isActive ? "success" : "default";
  };

  const getStatusLabel = (isActive) => {
    return isActive ? "Activo" : "Inactivo";
  };

  // Datos paginados
  const paginatedVisitors = filteredVisitors.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
                  Gestión de Visitantes
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  Administra la base de datos de visitantes registrados
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

            {/* Filtros y búsqueda */}
            <Card sx={{ mb: 3 }}>
              <MDBox p={3}>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <MDInput
                      type="text"
                      label="Buscar visitantes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      fullWidth
                      InputProps={{
                        startAdornment: <Icon>search</Icon>,
                      }}
                      placeholder="Nombre, email, empresa o identificación"
                    />
                  </Grid>
                  <Grid item xs={12} md={6} display="flex" justifyContent="flex-end">
                    <MDButton
                      variant="gradient"
                      color="primary"
                      onClick={openCreateDialog}
                      startIcon={<Icon>add</Icon>}
                    >
                      Nuevo Visitante
                    </MDButton>
                  </Grid>
                </Grid>
              </MDBox>
            </Card>

            {/* Tabla de visitantes */}
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" fontWeight="medium" gutterBottom>
                  Lista de Visitantes ({filteredVisitors.length})
                </MDTypography>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Visitante</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Empresa</TableCell>
                        <TableCell>Identificación</TableCell>
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
                              Cargando visitantes...
                            </MDTypography>
                          </TableCell>
                        </TableRow>
                      ) : paginatedVisitors.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            <MDTypography variant="body2" color="text">
                              {searchTerm
                                ? "No se encontraron visitantes con ese criterio"
                                : "No hay visitantes registrados"}
                            </MDTypography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedVisitors.map((visitor) => (
                          <TableRow key={visitor.id} hover>
                            <TableCell>
                              <MDBox display="flex" alignItems="center">
                                {visitor.face_encoding && (
                                  <Avatar
                                    sx={{ mr: 2, width: 40, height: 40 }}
                                    src={visitor.photo_url}
                                  >
                                    {visitor.full_name.charAt(0)}
                                  </Avatar>
                                )}
                                <MDBox>
                                  <MDTypography variant="body2" fontWeight="medium">
                                    {visitor.full_name}
                                  </MDTypography>
                                  <MDTypography variant="caption" color="text">
                                    {visitor.phone || "-"}
                                  </MDTypography>
                                </MDBox>
                              </MDBox>
                            </TableCell>
                            <TableCell>
                              <MDTypography variant="body2">{visitor.email}</MDTypography>
                            </TableCell>
                            <TableCell>
                              <MDTypography variant="body2">{visitor.company || "-"}</MDTypography>
                            </TableCell>
                            <TableCell>
                              <MDBox>
                                <MDTypography variant="body2" fontWeight="medium">
                                  {visitor.identification}
                                </MDTypography>
                                <MDTypography variant="caption" color="text">
                                  {visitor.no_identification}
                                </MDTypography>
                              </MDBox>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={getStatusLabel(visitor.is_active)}
                                color={getStatusColor(visitor.is_active)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <MDTypography variant="caption" color="text">
                                {formatDate(visitor.created_at)}
                              </MDTypography>
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Más opciones">
                                <IconButton
                                  size="small"
                                  onClick={(e) => openActionMenu(e, visitor)}
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
                  count={filteredVisitors.length}
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

      {/* FAB para crear visitante en móvil */}
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
        maxWidth="md"
        fullWidth
        disablePortal={false}
        keepMounted={false}
        aria-labelledby="visitor-dialog-title"
        aria-describedby="visitor-dialog-description"
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
        <DialogTitle id="visitor-dialog-title">
          <MDTypography variant="h4" fontWeight="medium">
            {editingVisitor ? "Editar Visitante" : "Nuevo Visitante"}
          </MDTypography>
        </DialogTitle>

        <VisitorForm
          visitor={editingVisitor}
          onSave={editingVisitor ? handleUpdateVisitor : handleCreateVisitor}
          onCancel={closeDialog}
          isEdit={!!editingVisitor}
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
        <MenuItem onClick={() => openEditDialog(actionMenu.visitor)}>
          <Icon sx={{ mr: 1 }}>edit</Icon>
          Editar
        </MenuItem>
        <MenuItem
          onClick={() => handleDeleteVisitor(actionMenu.visitor?.id)}
          sx={{ color: "error.main" }}
        >
          <Icon sx={{ mr: 1 }}>delete</Icon>
          Eliminar
        </MenuItem>
      </Menu>

      <Footer />
    </DashboardLayout>
  );
}

export default VisitorManagement;
