/**
 * Componente de Loading para el Sistema de Control de Visitas
 */

import { CircularProgress, Box } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function Loading({ message = "Cargando..." }) {
  return (
    <MDBox
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      gap={2}
    >
      <CircularProgress size={60} color="info" />
      <MDTypography variant="h6" color="text">
        {message}
      </MDTypography>
    </MDBox>
  );
}

export default Loading;
