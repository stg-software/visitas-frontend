// src/layouts/VisitCheckIn/index.js
import React, { useState } from "react";
import {
  Grid,
  Card,
  Icon,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Chip,
  Avatar,
  Paper,
  CircularProgress,
  Divider,
  MenuItem,
  TextField,
} from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

// Services
import api from "../../services/axiosConfig";
import PhotoCapture from "components/PhotoCapture";

function VisitCheckIn() {
  // Estados principales
  const [mode, setMode] = useState("face"); // 'face' o 'plate'
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [matches, setMatches] = useState([]);
  const [processingImage, setProcessingImage] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  // Cambiar modo
  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setMode(newMode);
      setResult(null);
      setError(null);
      setProcessingImage(null);
      setPhotoFile(null);
    }
  };

  // Convertir base64 a Blob (igual que original)
  const base64ToBlob = (base64) => {
    const parts = base64.split(";base64,");
    const contentType = parts[0].split(":")[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
  };

  // Procesar reconocimiento facial (igual que original)
  const processFaceRecognition = async (imageBase64) => {
    try {
      setLoading(true);
      setError(null);
      setProcessingImage(imageBase64);

      const blob = base64ToBlob(imageBase64);
      const formData = new FormData();
      formData.append("file", blob, "capture.jpg");

      console.log("🔍 Procesando reconocimiento facial...");

      const response = await api.post("/images/process-face", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Respuesta:", response.data);

      if (response.data.recognized && response.data.visitor_id) {
        const visitorResponse = await api.get(`/visitors/${response.data.visitor_id}`);

        setResult({
          type: "success",
          message: `¡Visitante reconocido! ${visitorResponse.data.full_name}`,
          visitor: visitorResponse.data,
          similarity: response.data.similarity_score,
          face_encoding: response.data.face_encoding,
        });

        await checkPreRegistration(response.data.visitor_id);
      } else {
        setResult({
          type: "warning",
          message: "No se reconoció el rostro en el sistema",
          face_encoding: response.data.face_encoding,
        });
      }
    } catch (err) {
      console.error("❌ Error:", err);
      setError(err.response?.data?.detail || "Error al procesar reconocimiento facial");
    } finally {
      setLoading(false);
    }
  };

  // Procesar reconocimiento de placa (igual que original)
  const processPlateRecognition = async (imageBase64) => {
    try {
      setLoading(true);
      setError(null);
      setProcessingImage(imageBase64);

      const blob = base64ToBlob(imageBase64);
      const formData = new FormData();
      formData.append("file", blob, "plate.jpg");

      console.log("🚗 Procesando placa...");

      const response = await api.post("/images/process-plate", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Respuesta:", response.data);

      if (response.data.detected && response.data.plate_text) {
        await searchPreRegistrationByPlate(response.data.plate_text, response.data.confidence);
      } else {
        setResult({
          type: "warning",
          message: "No se detectó placa vehicular",
        });
      }
    } catch (err) {
      console.error("❌ Error:", err);
      setError(err.response?.data?.detail || "Error al procesar placa");
    } finally {
      setLoading(false);
    }
  };

  // Buscar pre-registro por placa (igual que original)
  const searchPreRegistrationByPlate = async (licensePlate, confidence) => {
    try {
      console.log(`🔍 Buscando pre-registros para: ${licensePlate}`);

      const response = await api.get("/pre-registrations/", {
        params: {
          vehicle_license_plate: licensePlate,
          status: "approved",
        },
      });

      if (response.data && response.data.length > 0) {
        setMatches(response.data);
        setShowDialog(true);
        setResult({
          type: "success",
          message: `Placa detectada: ${licensePlate}`,
          plate: licensePlate,
          confidence: confidence,
        });
      } else {
        setResult({
          type: "warning",
          message: `Placa ${licensePlate} detectada, sin pre-registros aprobados`,
          plate: licensePlate,
          confidence: confidence,
        });
      }
    } catch (err) {
      console.error("❌ Error:", err);
      setError("Error al buscar pre-registros");
    }
  };

  // Verificar pre-registro (igual que original)
  const checkPreRegistration = async (visitorId) => {
    try {
      const response = await api.get("/pre-registrations/", {
        params: {
          visitor_id: visitorId,
          status: "approved",
        },
      });

      if (response.data && response.data.length > 0) {
        setMatches(response.data);
        setShowDialog(true);
      }
    } catch (err) {
      console.error("Error verificando pre-registro:", err);
    }
  };

  // Iniciar visita (igual que original)
  // Reemplazar la función startVisit en tu archivo index.js

  const startVisit = async (preRegistrationId = null) => {
    try {
      setLoading(true);

      // CORRECCIÓN: Obtener visitor_id correctamente según el modo
      let visitorId = 1; // fallback

      if (mode === "face" && result?.visitor?.id) {
        // Modo facial: usar el visitor del reconocimiento facial
        visitorId = result.visitor.id;
      } else if (mode === "plate" && preRegistrationId) {
        // Modo placa: obtener visitor_id del pre-registro seleccionado
        const selectedPreReg = matches.find((m) => m.id === preRegistrationId);
        if (selectedPreReg && selectedPreReg.visitor_id) {
          visitorId = selectedPreReg.visitor_id;
          console.log(`✅ Usando visitor_id ${visitorId} del pre-registro ${preRegistrationId}`);
        } else {
          console.warn("⚠️ No se pudo obtener visitor_id del pre-registro");
        }
      }

      const visitData = {
        visitor_id: visitorId,
        visit_type: mode === "face" ? "person_only" : "vehicle_only",
        pre_registration_id: preRegistrationId,
        notes:
          mode === "face"
            ? `Check-in facial - ${(result.similarity * 100).toFixed(1)}%`
            : `Check-in vehicular - ${result.plate}`,
      };

      console.log("📤 Enviando datos de visita:", visitData);

      await api.post("/visits", visitData);

      setResult({
        ...result,
        type: "success",
        message: "✅ ¡Visita iniciada exitosamente!",
      });

      setShowDialog(false);

      setTimeout(() => {
        setResult(null);
        setError(null);
        setProcessingImage(null);
      }, 3000);
    } catch (err) {
      console.error("❌ Error al iniciar visita:", err);
      setError(err.response?.data?.detail || "Error al iniciar visita");
    } finally {
      setLoading(false);
    }
  };

  // === Integración mínima con PhotoCapture ===
  const handlePhotoCapture = (file) => {
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      // guardamos como Data URL para que base64ToBlob funcione igual que antes
      setProcessingImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleClearPhoto = () => {
    setPhotoFile(null);
    setProcessingImage(null);
  };

  // Mantener el mismo botón y función de "Capturar Imagen"
  // Ahora usa la imagen proveniente de PhotoCapture (processingImage)
  const handleCapture = () => {
    const imageSrc = processingImage;
    if (!imageSrc) {
      setError("No se pudo capturar imagen");
      return;
    }
    if (mode === "face") {
      processFaceRecognition(imageSrc);
    } else {
      processPlateRecognition(imageSrc);
    }
  };

  // Formatear fecha (igual que original)
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

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {/* Header */}
            <MDBox mb={3}>
              <MDTypography variant="h3" fontWeight="medium">
                Check-in de Visitas
              </MDTypography>
              <MDTypography variant="body2" color="text">
                Sistema de reconocimiento facial y vehicular para registro de visitas
              </MDTypography>
            </MDBox>

            {/* Selector de modo */}
            <Card sx={{ mb: 3 }}>
              <MDBox p={3}>
                <MDBox mb={2}>
                  <MDTypography variant="h6" fontWeight="medium" gutterBottom>
                    Seleccionar Método de Identificación
                  </MDTypography>
                </MDBox>
                <MDBox display="flex" justifyContent="center">
                  <ToggleButtonGroup
                    value={mode}
                    exclusive
                    onChange={handleModeChange}
                    color="primary"
                  >
                    <ToggleButton value="face">
                      <Icon sx={{ mr: 1 }}>face</Icon>
                      Reconocimiento Facial
                    </ToggleButton>
                    <ToggleButton value="plate">
                      <Icon sx={{ mr: 1 }}>directions_car</Icon>
                      Reconocimiento de Placa
                    </ToggleButton>
                  </ToggleButtonGroup>
                </MDBox>
              </MDBox>
            </Card>

            {/* Cámara y Captura */}
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" gutterBottom>
                      Vista de Cámara
                    </MDTypography>

                    {/* Sustituimos Webcam por PhotoCapture (mínimo cambio) */}
                    <Paper elevation={3} sx={{ p: 1, borderRadius: 2, mb: 2 }}>
                      <PhotoCapture
                        onPhotoCapture={handlePhotoCapture}
                        currentPhoto={photoFile}
                        onClearPhoto={handleClearPhoto}
                      />
                    </Paper>

                    {/* Instrucciones (igual) */}
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <MDBox>
                        <MDTypography variant="body2" fontWeight="medium" gutterBottom>
                          {mode === "face"
                            ? "Instrucciones - Modo Facial:"
                            : "Instrucciones - Modo Vehicular:"}
                        </MDTypography>
                        <MDTypography variant="body2">
                          {mode === "face"
                            ? "Posicione su rostro frente a la cámara, asegúrese de tener buena iluminación y presione 'Capturar Imagen'"
                            : "Enfoque la placa del vehículo de manera clara y legible, luego presione 'Capturar Imagen'"}
                        </MDTypography>
                      </MDBox>
                    </Alert>

                    {/* Botón de captura (misma UI / mismo handler) */}
                    <MDBox display="flex" justifyContent="center">
                      <MDButton
                        variant="gradient"
                        color="primary"
                        size="large"
                        onClick={handleCapture}
                        disabled={loading}
                        startIcon={
                          loading ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            <Icon>camera_alt</Icon>
                          )
                        }
                      >
                        {loading ? "Procesando..." : "Procesar Imagen"}
                      </MDButton>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>

              {/* Panel de Resultados (sin cambios) */}
              <Grid item xs={12} lg={4}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" gutterBottom>
                      Resultado del Procesamiento
                    </MDTypography>

                    {/* Imagen capturada (igual) */}
                    {processingImage && (
                      <Paper elevation={1} sx={{ p: 1, mb: 2, borderRadius: 2 }}>
                        <img
                          src={processingImage}
                          alt="Captura"
                          style={{ width: "100%", borderRadius: "8px" }}
                        />
                        <MDTypography
                          variant="caption"
                          color="text"
                          sx={{ mt: 1, display: "block" }}
                        >
                          Imagen capturada
                        </MDTypography>
                      </Paper>
                    )}

                    {/* Resultado (igual) */}
                    {result && (
                      <Alert severity={result.type} sx={{ mb: 2 }}>
                        <MDBox>
                          <MDTypography variant="body2" fontWeight="medium">
                            {result.message}
                          </MDTypography>

                          {result.visitor && (
                            <MDBox mt={1}>
                              <Divider sx={{ my: 1 }} />
                              <MDTypography variant="caption" color="text">
                                <strong>Empresa:</strong> {result.visitor.company || "N/A"}
                              </MDTypography>
                              <br />
                              <MDTypography variant="caption" color="text">
                                <strong>Email:</strong> {result.visitor.email || "N/A"}
                              </MDTypography>
                              <br />
                              <MDTypography variant="caption" color="text">
                                <strong>Confianza:</strong> {(result.similarity * 100).toFixed(1)}%
                              </MDTypography>
                            </MDBox>
                          )}

                          {result.plate && (
                            <MDBox mt={1}>
                              <Divider sx={{ my: 1 }} />
                              <MDTypography variant="caption" color="text">
                                <strong>Placa:</strong> {result.plate}
                              </MDTypography>
                              <br />
                              <MDTypography variant="caption" color="text">
                                <strong>Confianza:</strong> {(result.confidence * 100).toFixed(1)}%
                              </MDTypography>
                            </MDBox>
                          )}
                        </MDBox>
                      </Alert>
                    )}

                    {/* Error (igual) */}
                    {error && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                      </Alert>
                    )}

                    {/* Botón de acción (igual) */}
                    {result && result.type === "success" && result.visitor && !showDialog && (
                      <MDButton
                        variant="gradient"
                        color="success"
                        fullWidth
                        onClick={() => startVisit()}
                        disabled={loading}
                      >
                        Iniciar Visita Ahora
                      </MDButton>
                    )}

                    {/* Estados (igual) */}
                    {loading && !result && (
                      <MDBox display="flex" flexDirection="column" alignItems="center" py={3}>
                        <CircularProgress size={40} />
                        <MDTypography variant="body2" color="text" mt={2}>
                          Procesando imagen...
                        </MDTypography>
                      </MDBox>
                    )}

                    {!loading && !result && !error && !processingImage && (
                      <MDBox textAlign="center" py={3}>
                        <Icon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}>
                          {mode === "face" ? "face" : "directions_car"}
                        </Icon>
                        <MDTypography variant="body2" color="text">
                          Captura una imagen para comenzar el proceso de identificación
                        </MDTypography>
                      </MDBox>
                    )}
                  </MDBox>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </MDBox>

      {/* Diálogo de pre-registros (sin cambios) */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <MDTypography variant="h4" fontWeight="medium">
            Pre-registros Aprobados Encontrados
          </MDTypography>
        </DialogTitle>
        <DialogContent>
          <MDTypography variant="body2" color="text" mb={2}>
            Se encontraron los siguientes pre-registros aprobados. Seleccione uno para iniciar la
            visita:
          </MDTypography>

          <List>
            {matches.map((preReg) => (
              <ListItem
                key={preReg.id}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  mb: 2,
                  p: 2,
                }}
              >
                <MDBox display="flex" alignItems="center" width="100%">
                  <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                    <Icon>person</Icon>
                  </Avatar>
                  <MDBox flexGrow={1}>
                    <MDTypography variant="h6" fontWeight="medium">
                      {preReg.visitor_name || "Visitante"}
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                      {preReg.visit_purpose}
                    </MDTypography>
                    <Grid container spacing={1} mt={0.5}>
                      <Grid item xs={6}>
                        <MDTypography variant="caption" color="text">
                          <Icon sx={{ fontSize: 14, mr: 0.5, verticalAlign: "middle" }}>
                            calendar_today
                          </Icon>
                          {formatDateTime(preReg.visit_date, preReg.visit_time)}
                        </MDTypography>
                      </Grid>
                      {preReg.vehicle_license_plate && (
                        <Grid item xs={6}>
                          <Chip
                            icon={<Icon>directions_car</Icon>}
                            label={preReg.vehicle_license_plate}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Grid>
                      )}
                    </Grid>
                  </MDBox>
                  <MDButton
                    variant="gradient"
                    color="success"
                    onClick={() => startVisit(preReg.id)}
                    disabled={loading}
                  >
                    Seleccionar
                  </MDButton>
                </MDBox>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setShowDialog(false)} variant="outlined" color="secondary">
            Cancelar
          </MDButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default VisitCheckIn;
