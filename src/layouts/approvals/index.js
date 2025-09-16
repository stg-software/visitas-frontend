/**
=========================================================
* Dashboard de Autorizaciones - Control de Visitas
* Gestión de solicitudes pendientes de aprobación
=========================================================
*/

import { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Badge from "@mui/material/Badge";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

// Services
import { preRegisterService, authService } from "services/apiServices";

function Approvals() {
  // Estados principales
  const [preRegisters, setPreRegisters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Estados para filtros
  const [filter, setFilter] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para modal de acción
  const [actionModal, setActionModal] = useState({
    open: false,
    type: "", // "approve" o "reject"
    preRegister: null,
    notes: "",
    loading: false,
  });

  // Usuario actual
  const currentUser = authService.getCurrentUser();

  // Cargar pre-registros
  const loadPreRegisters = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Loading pre-registers with filter:", filter);

      const filters = {};
      if (filter !== "all") {
        filters.status = filter;
      }

      const data = await preRegisterService.getAll(filters);
      setPreRegisters(data);

      console.log("Pre-registers loaded:", data.length);
    } catch (error) {
      console.error("Error loading pre-registers:", error);
      setError("Error al cargar las solicitudes");
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar datos
  useEffect(() => {
    loadPreRegisters();
  }, [filter]);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(loadPreRegisters, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  // Filtrar pre-registros por búsqueda
  const filteredPreRegisters = preRegisters.filter((pr) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      pr.visitor_name?.toLowerCase().includes(searchLower) ||
      pr.company?.toLowerCase().includes(searchLower) ||
      pr.purpose?.toLowerCase().includes(searchLower) ||
      pr.host_name?.toLowerCase().includes(searchLower)
    );
  });

  // Contar solicitudes por estado
  const getCounts = () => {
    return {
      pending: preRegisters.filter((pr) => pr.status === "pending").length,
      approved: preRegisters.filter((pr) => pr.status === "approved").length,
      rejected: preRegisters.filter((pr) => pr.status === "rejected").length,
      all: preRegisters.length,
    };
  };

  // Abrir modal de acción
  const openActionModal = (type, preRegister) => {
    setActionModal({
      open: true,
      type,
      preRegister,
      notes: "",
      loading: false,
    });
  };

  // Cerrar modal de acción
  const closeActionModal = () => {
    setActionModal({
      open: false,
      type: "",
      preRegister: null,
      notes: "",
      loading: false,
    });
  };

  // Ejecutar acción (aprobar/rechazar)
  const executeAction = async () => {
    const { type, preRegister, notes } = actionModal;

    setActionModal((prev) => ({ ...prev, loading: true }));
    setError("");

    try {
      let result;

      if (type === "approve") {
        result = await preRegisterService.approve(preRegister.id, notes);
        setSuccess(`Solicitud de ${preRegister.visitor_name} aprobada exitosamente`);
      } else {
        if (!notes.trim()) {
          setError("La razón del rechazo es requerida");
          setActionModal((prev) => ({ ...prev, loading: false }));
          return;
        }
        result = await preRegisterService.reject(preRegister.id, notes);
        setSuccess(`Solicitud de ${preRegister.visitor_name} rechazada`);
      }

      console.log("Action result:", result);

      // Recargar datos
      await loadPreRegisters();

      // Cerrar modal
      closeActionModal();
    } catch (error) {
      console.error("Error executing action:", error);
      setError(error.message || "Error al procesar la solicitud");
      setActionModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // Obtener color del estado
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

  // Obtener texto del estado
  const getStatusText = (status) => {
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

  // Formatear fecha y hora
  const formatDateTime = (date, time) => {
    const dateObj = new Date(date);
    const options = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return `${dateObj.toLocaleDateString("es-ES", options)} a las ${time}`;
  };

  // Verificar si el usuario puede aprobar (es el anfitrión o admin)
  const canApprove = (preRegister) => {
    return (
      currentUser?.role === "admin" ||
      currentUser?.email === preRegister.host_email ||
      currentUser?.name === preRegister.host_name
    );
  };

  const counts = getCounts();

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox py={3}>
        {/* Header */}
        <MDBox mb={3}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <MDTypography variant="h4" fontWeight="medium">
                Dashboard de Autorizaciones
              </MDTypography>
              <MDTypography variant="body2" color="text" mt={1}>
                Gestiona las solicitudes de visita pendientes de aprobación
              </MDTypography>
            </Grid>
            <Grid item xs={12} md={6}>
              <MDBox display="flex" justifyContent="flex-end" alignItems="center">
                <TextField
                  size="small"
                  placeholder="Buscar solicitudes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ mr: 2, minWidth: 200 }}
                />
                <Tooltip title="Actualizar">
                  <MDButton
                    variant="outlined"
                    color="info"
                    size="small"
                    onClick={loadPreRegisters}
                    disabled={loading}
                  >
                    <Icon>refresh</Icon>
                  </MDButton>
                </Tooltip>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        {/* Alertas */}
        {error && (
          <MDBox mb={3}>
            <Alert severity="error" onClose={() => setError("")}>
              {error}
            </Alert>
          </MDBox>
        )}

        {success && (
          <MDBox mb={3}>
            <Alert severity="success" onClose={() => setSuccess("")}>
              {success}
            </Alert>
          </MDBox>
        )}

        {/* Filtros */}
        <MDBox mb={3}>
          <Grid container spacing={2}>
            <Grid item>
              <MDButton
                variant={filter === "pending" ? "gradient" : "outlined"}
                color="warning"
                size="small"
                onClick={() => setFilter("pending")}
              >
                <Badge badgeContent={counts.pending} color="error">
                  Pendientes
                </Badge>
              </MDButton>
            </Grid>
            <Grid item>
              <MDButton
                variant={filter === "approved" ? "gradient" : "outlined"}
                color="success"
                size="small"
                onClick={() => setFilter("approved")}
              >
                Aprobadas ({counts.approved})
              </MDButton>
            </Grid>
            <Grid item>
              <MDButton
                variant={filter === "rejected" ? "gradient" : "outlined"}
                color="error"
                size="small"
                onClick={() => setFilter("rejected")}
              >
                Rechazadas ({counts.rejected})
              </MDButton>
            </Grid>
            <Grid item>
              <MDButton
                variant={filter === "all" ? "gradient" : "outlined"}
                color="info"
                size="small"
                onClick={() => setFilter("all")}
              >
                Todas ({counts.all})
              </MDButton>
            </Grid>
          </Grid>
        </MDBox>

        {/* Lista de solicitudes */}
        <Grid container spacing={3}>
          {loading ? (
            <Grid item xs={12}>
              <MDBox display="flex" justifyContent="center" py={6}>
                <CircularProgress size={40} />
              </MDBox>
            </Grid>
          ) : filteredPreRegisters.length === 0 ? (
            <Grid item xs={12}>
              <Card>
                <MDBox p={6} textAlign="center">
                  <Icon fontSize="large" color="disabled">
                    inbox
                  </Icon>
                  <MDTypography variant="h6" color="text" mt={2}>
                    No hay solicitudes
                  </MDTypography>
                  <MDTypography variant="body2" color="text" mt={1}>
                    {searchTerm
                      ? "No se encontraron solicitudes que coincidan con tu búsqueda"
                      : `No hay solicitudes ${filter === "all" ? "" : filter}s en este momento`}
                  </MDTypography>
                </MDBox>
              </Card>
            </Grid>
          ) : (
            filteredPreRegisters.map((preRegister) => (
              <Grid item xs={12} key={preRegister.id}>
                <Card>
                  <MDBox p={3}>
                    <Grid container spacing={3} alignItems="center">
                      {/* Información principal */}
                      <Grid item xs={12} md={6}>
                        <MDBox mb={1}>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item>
                              <MDTypography variant="h6" fontWeight="medium">
                                {preRegister.visitor_name}
                              </MDTypography>
                            </Grid>
                            <Grid item>
                              <Chip
                                label={getStatusText(preRegister.status)}
                                size="small"
                                color={getStatusColor(preRegister.status)}
                              />
                            </Grid>
                          </Grid>
                        </MDBox>

                        <MDTypography variant="body2" color="text" mb={0.5}>
                          <Icon fontSize="small" sx={{ mr: 1 }}>
                            business
                          </Icon>
                          {preRegister.company || "Sin empresa"}
                        </MDTypography>

                        <MDTypography variant="body2" color="text" mb={0.5}>
                          <Icon fontSize="small" sx={{ mr: 1 }}>
                            email
                          </Icon>
                          {preRegister.email}
                        </MDTypography>

                        <MDTypography variant="body2" color="text" mb={0.5}>
                          <Icon fontSize="small" sx={{ mr: 1 }}>
                            event
                          </Icon>
                          {formatDateTime(preRegister.visit_date, preRegister.visit_time)}
                        </MDTypography>

                        <MDTypography variant="body2" color="text">
                          <Icon fontSize="small" sx={{ mr: 1 }}>
                            person
                          </Icon>
                          Anfitrión: {preRegister.host_name}
                        </MDTypography>
                      </Grid>

                      {/* Detalles de la visita */}
                      <Grid item xs={12} md={4}>
                        <MDTypography variant="body2" color="text" mb={1}>
                          <strong>Propósito:</strong> {preRegister.purpose}
                        </MDTypography>

                        <MDTypography variant="body2" color="text" mb={1}>
                          <strong>Duración:</strong> {preRegister.estimated_duration || 60} minutos
                        </MDTypography>

                        {preRegister.additional_notes && (
                          <MDTypography variant="body2" color="text" mb={1}>
                            <strong>Notas:</strong> {preRegister.additional_notes}
                          </MDTypography>
                        )}

                        <MDTypography variant="caption" color="text">
                          Solicitado: {new Date(preRegister.created_at).toLocaleDateString("es-ES")}
                        </MDTypography>
                      </Grid>

                      {/* Acciones */}
                      <Grid item xs={12} md={2}>
                        <MDBox display="flex" flexDirection="column" gap={1}>
                          {preRegister.status === "pending" && canApprove(preRegister) && (
                            <>
                              <MDButton
                                variant="gradient"
                                color="success"
                                size="small"
                                fullWidth
                                onClick={() => openActionModal("approve", preRegister)}
                              >
                                <Icon sx={{ mr: 1 }}>check_circle</Icon>
                                Aprobar
                              </MDButton>

                              <MDButton
                                variant="gradient"
                                color="error"
                                size="small"
                                fullWidth
                                onClick={() => openActionModal("reject", preRegister)}
                              >
                                <Icon sx={{ mr: 1 }}>cancel</Icon>
                                Rechazar
                              </MDButton>
                            </>
                          )}

                          {preRegister.status === "pending" && !canApprove(preRegister) && (
                            <MDTypography variant="caption" color="text" textAlign="center">
                              Solo el anfitrión puede aprobar esta solicitud
                            </MDTypography>
                          )}

                          {preRegister.status !== "pending" && (
                            <MDBox textAlign="center">
                              <MDTypography variant="caption" color="text">
                                {preRegister.status === "approved"
                                  ? `Aprobado el ${new Date(
                                      preRegister.approved_at || preRegister.created_at
                                    ).toLocaleDateString("es-ES")}`
                                  : `Rechazado el ${new Date(
                                      preRegister.rejected_at || preRegister.created_at
                                    ).toLocaleDateString("es-ES")}`}
                              </MDTypography>
                              {preRegister.rejection_reason && (
                                <MDTypography
                                  variant="caption"
                                  color="error"
                                  display="block"
                                  mt={0.5}
                                >
                                  Razón: {preRegister.rejection_reason}
                                </MDTypography>
                              )}
                            </MDBox>
                          )}
                        </MDBox>
                      </Grid>
                    </Grid>
                  </MDBox>
                </Card>
              </Grid>
            ))
          )}
        </Grid>

        {/* Modal de confirmación de acción */}
        <Dialog open={actionModal.open} onClose={closeActionModal} maxWidth="sm" fullWidth>
          <DialogTitle>
            {actionModal.type === "approve" ? "Aprobar Solicitud" : "Rechazar Solicitud"}
          </DialogTitle>

          <DialogContent>
            {actionModal.preRegister && (
              <MDBox>
                <MDTypography variant="body1" mb={2}>
                  {actionModal.type === "approve"
                    ? `¿Confirmas la aprobación de la visita de ${actionModal.preRegister.visitor_name}?`
                    : `¿Confirmas el rechazo de la solicitud de ${actionModal.preRegister.visitor_name}?`}
                </MDTypography>

                <MDBox mb={2} p={2} borderRadius="lg" backgroundColor="grey.100">
                  <MDTypography variant="body2" mb={1}>
                    <strong>Visitante:</strong> {actionModal.preRegister.visitor_name}
                  </MDTypography>
                  <MDTypography variant="body2" mb={1}>
                    <strong>Fecha:</strong>{" "}
                    {formatDateTime(
                      actionModal.preRegister.visit_date,
                      actionModal.preRegister.visit_time
                    )}
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>Propósito:</strong> {actionModal.preRegister.purpose}
                  </MDTypography>
                </MDBox>

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={
                    actionModal.type === "approve"
                      ? "Notas adicionales (opcional)"
                      : "Razón del rechazo *"
                  }
                  value={actionModal.notes}
                  onChange={(e) => setActionModal((prev) => ({ ...prev, notes: e.target.value }))}
                  required={actionModal.type === "reject"}
                  placeholder={
                    actionModal.type === "approve"
                      ? "Agrega cualquier información adicional para el visitante..."
                      : "Explica por qué se rechaza la solicitud..."
                  }
                />
              </MDBox>
            )}
          </DialogContent>

          <DialogActions>
            <MDButton
              variant="outlined"
              color="secondary"
              onClick={closeActionModal}
              disabled={actionModal.loading}
            >
              Cancelar
            </MDButton>

            <MDButton
              variant="gradient"
              color={actionModal.type === "approve" ? "success" : "error"}
              onClick={executeAction}
              disabled={actionModal.loading}
            >
              {actionModal.loading ? (
                <>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                  Procesando...
                </>
              ) : (
                <>
                  <Icon sx={{ mr: 1 }}>
                    {actionModal.type === "approve" ? "check_circle" : "cancel"}
                  </Icon>
                  {actionModal.type === "approve" ? "Aprobar" : "Rechazar"}
                </>
              )}
            </MDButton>
          </DialogActions>
        </Dialog>
      </MDBox>
    </DashboardLayout>
  );
}

export default Approvals;
