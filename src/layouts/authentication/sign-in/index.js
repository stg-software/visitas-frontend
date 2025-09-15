/**
=========================================================
* Sign-In Corregido - Sistema de Control de Visitas
* Con debugging de tokens y manejo mejorado de errores
=========================================================
*/

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Services
import { authService } from "services/apiServices";

// Images
import bgImage from "assets/images/header/Header1.jpg";
import my_brnad from "assets/logo_white_circle.png";

function Basic() {
  const navigate = useNavigate();

  // Estados del formulario
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Manejar cambios en los inputs
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar errores al escribir
    if (error) setError("");
  };

  // Validaciones
  const validateForm = () => {
    if (!formData.username) {
      setError("El usuario o email es requerido");
      return false;
    }

    if (formData.username.length < 3) {
      setError("El usuario debe tener al menos 3 caracteres");
      return false;
    }

    if (!formData.password) {
      setError("La contraseña es requerida");
      return false;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    return true;
  };

  // 🆕 Función para probar token actual
  const testCurrentToken = async () => {
    try {
      console.log("🧪 Testing current token...");
      const user = await authService.verifyToken();
      console.log("✅ Token is valid, user:", user);
      alert(`Token válido!\nUsuario: ${user.email || user.username || "N/A"}`);
    } catch (error) {
      console.error("❌ Token is invalid:", error);
      alert(`Token inválido: ${error.message}`);
    }
  };

  // 🆕 Función para limpiar todos los datos
  const clearAllData = () => {
    localStorage.clear();
    console.log("🗑️ All localStorage data cleared");
    alert("Todos los datos locales han sido eliminados");
    window.location.reload();
  };

  // Manejar envío del formulario
  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log("🚀 Form submitted!");
    console.log("Form data:", { username: formData.username, password: "***" });

    if (!validateForm()) {
      console.log("❌ Validation failed");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("📞 Calling authService.login...");

      // Llamar al servicio de autenticación
      const response = await authService.login(formData.username, formData.password);

      console.log("✅ Login response received:", response);

      setSuccess("¡Inicio de sesión exitoso! Obteniendo información del usuario...");

      // Obtener información del usuario
      try {
        console.log("📞 Getting user info...");
        const userInfo = await authService.getCurrentUserInfo();
        localStorage.setItem("user_data", JSON.stringify(userInfo));

        setSuccess("¡Bienvenido! Redirigiendo al dashboard...");

        // Redirigir al dashboard después de 1 segundo
        setTimeout(() => {
          navigate("/dashboard");
          window.location.reload();
        }, 1000);
      } catch (userError) {
        console.warn("⚠️ Error al obtener info del usuario:", userError);

        // Si no se puede obtener la info del usuario, crear datos básicos
        const basicUserData = {
          username: formData.username,
          email: formData.username.includes("@") ? formData.username : null,
          name: formData.username.includes("@")
            ? formData.username.split("@")[0]
            : formData.username,
          role: "user",
        };
        localStorage.setItem("user_data", JSON.stringify(basicUserData));

        setSuccess("¡Inicio de sesión exitoso! Redirigiendo...");

        setTimeout(() => {
          navigate("/dashboard");
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error("❌ Error en login:", error);
      setError(error.message || "Error al iniciar sesión. Verifica tus credenciales.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={2}
          // mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Sistema de Control de Visitas
          </MDTypography>
          <MDTypography variant="body2" color="white" mt={1}>
            Inicia sesión para acceder al sistema
          </MDTypography>
        </MDBox>

        <MDBox pt={4} pb={3} px={3}>
          {/* Mostrar alertas */}
          {error && (
            <MDBox mb={2}>
              <Alert severity="error">{error}</Alert>
            </MDBox>
          )}

          {success && (
            <MDBox mb={2}>
              <Alert severity="success">{success}</Alert>
            </MDBox>
          )}

          {/* Botones de debugging - solo en desarrollo */}
          {/* {process.env.NODE_ENV === "development" && (
            <MDBox mb={3} p={2} borderRadius="lg" backgroundColor="grey.100">
              <MDTypography variant="caption" color="text" fontWeight="bold" mb={1}>
                🔧 Herramientas de Debugging
              </MDTypography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={testCurrentToken}
                    color="primary"
                  >
                    🧪 Probar Token
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={clearAllData}
                    color="warning"
                  >
                    🗑️ Limpiar Todo
                  </Button>
                </Grid>
              </Grid>
              <MDTypography variant="caption" display="block" color="text" mt={1}>
                API: {process.env.REACT_APP_API_URL || "http://localhost:8000/api/v1"}
              </MDTypography>
              <MDTypography variant="caption" display="block" color="text">
                Token actual:{" "}
                {localStorage.getItem("access_token")
                  ? `${localStorage.getItem("access_token").substring(0, 20)}...`
                  : "No hay token"}
              </MDTypography>
            </MDBox>
          )} */}

          <MDBox
            component="img"
            src={my_brnad}
            alt="InToGlobe"
            width="30%"
            mb={4}
            display="block"
            mx="auto"
          />

          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            {/* Input de usuario */}
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Usuario o Email"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                fullWidth
                required
                disabled={isLoading}
                autoComplete="username"
                placeholder="Ingresa tu usuario o email"
              />
            </MDBox>

            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Contraseña"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                fullWidth
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </MDBox>

            <MDBox mt={4} mb={1}>
              <MDButton
                variant="gradient"
                color="info"
                fullWidth
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Grid container spacing={1} alignItems="center" justifyContent="center">
                    <Grid item>
                      <CircularProgress size={20} color="inherit" />
                    </Grid>
                    <Grid item>{success ? "Redirigiendo..." : "Iniciando sesión..."}</Grid>
                  </Grid>
                ) : (
                  "Iniciar Sesión"
                )}
              </MDButton>
            </MDBox>

            {/* Divisor */}
            {/* <MDBox my={3}>
              <Divider>
                <MDTypography variant="caption" color="text">
                  o
                </MDTypography>
              </Divider>
            </MDBox> */}

            {/* Link a registro */}
            {/* <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                ¿No tienes una cuenta?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-up"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                  sx={{
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Crear cuenta nueva
                </MDTypography>
              </MDTypography>
            </MDBox> */}

            {/* Botón alternativo de registro */}
            {/* <MDBox mt={2} mb={1}>
              <MDButton
                component={Link}
                to="/authentication/sign-up"
                variant="outlined"
                color="info"
                fullWidth
                disabled={isLoading}
              >
                Registrarse como Nuevo Usuario
              </MDButton>
            </MDBox> */}

            {/* Soporte */}
            {/* <MDBox mt={2} textAlign="center">
              <MDTypography variant="caption" color="text">
                ¿Problemas para acceder?{" "}
                <MDTypography
                  component="a"
                  href="mailto:soporte@visitas.com"
                  variant="caption"
                  color="info"
                  fontWeight="medium"
                >
                  Contactar soporte
                </MDTypography>
              </MDTypography>
            </MDBox> */}
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Basic;
