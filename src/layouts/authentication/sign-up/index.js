/**
=========================================================
* Material Dashboard 2 React - v2.2.0 - Sistema de Control de Visitas
=========================================================

* Sign-Up adaptado para Sistema Automatizado de Control de Visitas
* Proyecto: Maestría en Inteligencia Artificial - UNIR

=========================================================
*/

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Images - Usando la misma imagen que sign-in
import bgImage from "assets/images/header/Header1.jpg";

function Cover() {
  const navigate = useNavigate();

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    role: "user", // Rol por defecto
  });

  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

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

  // Manejar checkbox de términos
  const handleTermsChange = (event) => {
    setAcceptTerms(event.target.checked);
    if (error) setError("");
  };

  // Validaciones del formulario
  const validateForm = () => {
    // Validar nombre
    if (!formData.name.trim()) {
      setError("El nombre es requerido");
      return false;
    }

    if (formData.name.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres");
      return false;
    }

    // Validar email
    if (!formData.email) {
      setError("El email es requerido");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Por favor ingresa un email válido");
      return false;
    }

    // Validar contraseña
    if (!formData.password) {
      setError("La contraseña es requerida");
      return false;
    }

    if (formData.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return false;
    }

    // Validar confirmación de contraseña
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return false;
    }

    // Validar departamento
    if (!formData.department.trim()) {
      setError("El departamento es requerido");
      return false;
    }

    // Validar términos
    if (!acceptTerms) {
      setError("Debes aceptar los términos y condiciones");
      return false;
    }

    return true;
  };

  // Función simulada de registro
  const mockRegister = async (userData) => {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simular verificación de email existente
    const existingEmails = ["admin@visitas.com", "operador@visitas.com", "demo@visitas.com"];

    if (existingEmails.includes(userData.email)) {
      throw new Error("Este email ya está registrado en el sistema");
    }

    // Simular registro exitoso
    return {
      success: true,
      user: {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        department: userData.department,
        role: userData.role,
        status: "pending_approval", // Requiere aprobación del admin
      },
      message: "Usuario registrado exitosamente. Pendiente de aprobación.",
    };
  };

  // Manejar envío del formulario
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError("");

    try {
      // En producción aquí llamarías a tu API real
      // const response = await authService.register(formData);

      // Por ahora usamos mock
      const response = await mockRegister(formData);

      setSuccess(
        "¡Registro exitoso! Tu cuenta ha sido creada y está pendiente de aprobación por un administrador. Recibirás un email cuando sea activada."
      );

      // Limpiar formulario
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        department: "",
        role: "user",
      });
      setAcceptTerms(false);

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate("/authentication/sign-in");
      }, 3000);
    } catch (error) {
      console.error("Error en registro:", error);
      setError(error.message || "Error al registrar usuario. Inténtalo nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CoverLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Únete al Sistema
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Crea tu cuenta para acceder al sistema de control de visitas
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

          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            {/* Nombre completo */}
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Nombre Completo"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
                disabled={isLoading}
              />
            </MDBox>

            {/* Email */}
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                required
                disabled={isLoading}
              />
            </MDBox>

            {/* Departamento */}
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Departamento/Área"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                fullWidth
                required
                disabled={isLoading}
                placeholder="ej: Recursos Humanos, IT, Seguridad"
              />
            </MDBox>

            {/* Rol del usuario */}
            {/* <MDBox mb={2}>
              <FormControl fullWidth disabled={isLoading}>
                <InputLabel>Rol Solicitado</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  label="Rol Solicitado"
                >
                  <MenuItem value="user">Usuario (Acceso básico)</MenuItem>
                  <MenuItem value="operator">Operador (Gestión de visitas)</MenuItem>
                </Select>
              </FormControl>
            </MDBox> */}

            {/* Contraseña */}
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
              />
            </MDBox>

            {/* Confirmar contraseña */}
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Confirmar Contraseña"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                fullWidth
                required
                disabled={isLoading}
              />
            </MDBox>

            {/* Validaciones de contraseña */}
            <MDBox mb={2} p={2} borderRadius="lg" backgroundColor="grey.100">
              <MDTypography variant="caption" color="text" fontWeight="bold">
                Requisitos de contraseña:
              </MDTypography>
              <MDTypography variant="caption" display="block" color="text">
                • Mínimo 8 caracteres
              </MDTypography>
              <MDTypography variant="caption" display="block" color="text">
                • Se recomienda incluir mayúsculas, minúsculas y números
              </MDTypography>
            </MDBox>

            {/* Términos y condiciones */}
            {/* <MDBox display="flex" alignItems="center" ml={-1} mb={2}>
              <Checkbox checked={acceptTerms} onChange={handleTermsChange} disabled={isLoading} />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
                onClick={() => setAcceptTerms(!acceptTerms)}
              >
                &nbsp;&nbsp;Acepto los&nbsp;
              </MDTypography>
              <MDTypography
                component="a"
                href="#"
                variant="button"
                fontWeight="bold"
                color="info"
                textGradient
              >
                Términos y Condiciones
              </MDTypography>
              <MDTypography variant="button" fontWeight="regular" color="text">
                &nbsp;y la&nbsp;
              </MDTypography>
              <MDTypography
                component="a"
                href="#"
                variant="button"
                fontWeight="bold"
                color="info"
                textGradient
              >
                Política de Privacidad
              </MDTypography>
            </MDBox> */}

            {/* Información importante */}
            {/* <MDBox mb={3} p={2} borderRadius="lg" backgroundColor="info.100">
              <MDTypography variant="caption" color="info" fontWeight="bold">
                Nota Importante:
              </MDTypography>
              <MDTypography variant="caption" display="block" color="info">
                Tu cuenta será revisada por un administrador antes de ser activada. Esto puede tomar
                24-48 horas hábiles.
              </MDTypography>
            </MDBox> */}

            {/* Botón de registro */}
            <MDBox mt={4} mb={1}>
              <MDButton
                variant="gradient"
                color="info"
                fullWidth
                type="submit"
                disabled={isLoading || !acceptTerms}
              >
                {isLoading ? (
                  <Grid container spacing={1} alignItems="center" justifyContent="center">
                    <Grid item>
                      <CircularProgress size={20} color="inherit" />
                    </Grid>
                    <Grid item>Creando cuenta...</Grid>
                  </Grid>
                ) : (
                  "Crear Cuenta"
                )}
              </MDButton>
            </MDBox>

            {/* Link a sign-in */}
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                ¿Ya tienes una cuenta?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-in"
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
                  Iniciar Sesión
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default Cover;
