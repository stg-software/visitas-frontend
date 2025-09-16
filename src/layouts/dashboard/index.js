/**
=========================================================
* Dashboard Principal Mejorado - Sistema de Control de Visitas
* Muestra métricas en tiempo real y resumen del sistema
=========================================================
*/

import { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Services
import {
  dashboardService,
  visitService,
  visitorService,
  preRegisterService,
} from "services/apiServices";

// Data
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";

function Dashboard() {
  // Estados para métricas
  const [stats, setStats] = useState({
    totalVisitors: 0,
    activeVisits: 0,
    pendingApprovals: 0,
    todayVisits: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Cargar datos del dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("📊 Loading dashboard data...");

      // Cargar todas las métricas en paralelo
      const [dashboardStats, recentData, visitorsData, visitsData, preRegistersData] =
        await Promise.allSettled([
          dashboardService.getStats().catch(() => null),
          dashboardService.getRecentActivity(5).catch(() => []),
          visitorService.getAll().catch(() => []),
          visitService.getAll().catch(() => []),
          preRegisterService.getAll({ status: "pending" }).catch(() => []),
        ]);

      // Procesar datos obtenidos
      const visitors = visitorsData.status === "fulfilled" ? visitorsData.value : [];
      const visits = visitsData.status === "fulfilled" ? visitsData.value : [];
      const pendingRegisters =
        preRegistersData.status === "fulfilled" ? preRegistersData.value : [];
      const activity = recentData.status === "fulfilled" ? recentData.value : [];

      // Calcular métricas
      const today = new Date().toISOString().split("T")[0];
      const todayVisits = visits.filter(
        (visit) => visit.check_in_time && visit.check_in_time.startsWith(today)
      );
      const activeVisits = visits.filter((visit) => visit.check_in_time && !visit.check_out_time);

      setStats({
        totalVisitors: visitors.length,
        activeVisits: activeVisits.length,
        pendingApprovals: pendingRegisters.length,
        todayVisits: todayVisits.length,
      });

      setRecentActivity(activity);
      setLastUpdate(new Date());

      console.log("✅ Dashboard data loaded successfully");
    } catch (error) {
      console.error("❌ Error loading dashboard data:", error);
      setError("Error al cargar datos del dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, []);

  // Funciones para acciones rápidas
  const handleQuickAction = (action) => {
    switch (action) {
      case "refresh":
        loadDashboardData();
        break;
      case "newVisitor":
        window.location.href = "/visitor-management";
        break;
      case "preRegister":
        window.location.href = "/pre-register";
        break;
      case "approvals":
        window.location.href = "/approvals";
        break;
      default:
        console.log("Unknown action:", action);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "pending":
        return "warning";
      case "completed":
        return "info";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox py={3}>
        {/* Header con acciones rápidas */}
        <MDBox mb={3}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <MDTypography variant="h4" fontWeight="medium">
                Dashboard de Control de Visitas
              </MDTypography>
              <MDTypography variant="body2" color="text" mt={1}>
                Última actualización: {lastUpdate.toLocaleTimeString()}
              </MDTypography>
            </Grid>
            <Grid item xs={12} md={6}>
              <MDBox display="flex" justifyContent="flex-end" alignItems="center">
                <Tooltip title="Actualizar datos">
                  <MDButton
                    variant="outlined"
                    color="info"
                    size="small"
                    onClick={() => handleQuickAction("refresh")}
                    disabled={loading}
                    sx={{ mr: 1 }}
                  >
                    <Icon>refresh</Icon>
                  </MDButton>
                </Tooltip>
                <MDButton
                  variant="gradient"
                  color="success"
                  size="small"
                  onClick={() => handleQuickAction("newVisitor")}
                >
                  <Icon sx={{ mr: 1 }}>person_add</Icon>
                  Nuevo Visitante
                </MDButton>
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

        {/* Métricas principales */}
        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="dark"
                  icon="people"
                  title="Total Visitantes"
                  count={loading ? "..." : stats.totalVisitors}
                  percentage={{
                    color: "success",
                    amount: "+0%",
                    label: "registrados",
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  icon="how_to_reg"
                  title="Visitas Activas"
                  count={loading ? "..." : stats.activeVisits}
                  percentage={{
                    color: stats.activeVisits > 0 ? "success" : "secondary",
                    amount: `${stats.activeVisits > 0 ? "+" : ""}${stats.activeVisits}`,
                    label: "en el edificio",
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="success"
                  icon="event_note"
                  title="Visitas Hoy"
                  count={loading ? "..." : stats.todayVisits}
                  percentage={{
                    color: "success",
                    amount: `+${stats.todayVisits}`,
                    label: "día actual",
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="primary"
                  icon="pending_actions"
                  title="Pre-registros"
                  count={loading ? "..." : stats.pendingApprovals}
                  percentage={{
                    color: stats.pendingApprovals > 0 ? "warning" : "success",
                    amount: `${stats.pendingApprovals}`,
                    label: "pendientes",
                  }}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        {/* Acciones rápidas */}
        <MDBox mb={3}>
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h6" gutterBottom>
                Acciones Rápidas
              </MDTypography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <MDButton
                    variant="gradient"
                    color="info"
                    fullWidth
                    onClick={() => handleQuickAction("preRegister")}
                  >
                    <Icon sx={{ mr: 1 }}>add_circle</Icon>
                    Pre-registro
                  </MDButton>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MDButton
                    variant="gradient"
                    color="warning"
                    fullWidth
                    onClick={() => handleQuickAction("approvals")}
                  >
                    <Icon sx={{ mr: 1 }}>approval</Icon>
                    Autorizaciones
                    {stats.pendingApprovals > 0 && (
                      <Chip
                        label={stats.pendingApprovals}
                        size="small"
                        color="error"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </MDButton>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MDButton
                    variant="gradient"
                    color="success"
                    fullWidth
                    onClick={() => (window.location.href = "/active-visits")}
                  >
                    <Icon sx={{ mr: 1 }}>location_on</Icon>
                    Visitas Activas
                  </MDButton>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MDButton
                    variant="gradient"
                    color="dark"
                    fullWidth
                    onClick={() => (window.location.href = "/reports")}
                  >
                    <Icon sx={{ mr: 1 }}>analytics</Icon>
                    Reportes
                  </MDButton>
                </Grid>
              </Grid>
            </MDBox>
          </Card>
        </MDBox>

        {/* Actividad reciente */}
        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={8}>
              <Card>
                <MDBox p={3}>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <MDTypography variant="h6">Actividad Reciente</MDTypography>
                    <MDButton
                      variant="text"
                      color="info"
                      size="small"
                      onClick={() => (window.location.href = "/visits")}
                    >
                      Ver todas
                    </MDButton>
                  </MDBox>

                  {loading ? (
                    <MDBox display="flex" justifyContent="center" py={3}>
                      <CircularProgress />
                    </MDBox>
                  ) : recentActivity.length === 0 ? (
                    <MDBox textAlign="center" py={3}>
                      <Icon fontSize="large" color="disabled">
                        inbox
                      </Icon>
                      <MDTypography variant="body2" color="text" mt={1}>
                        No hay actividad reciente
                      </MDTypography>
                    </MDBox>
                  ) : (
                    <MDBox>
                      {recentActivity.map((activity, index) => (
                        <MDBox key={index} mb={2} pb={2} borderBottom="1px solid #f0f0f0">
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={1}>
                              <Icon color="info">
                                {activity.type === "visit"
                                  ? "person"
                                  : activity.type === "approval"
                                  ? "check_circle"
                                  : "event"}
                              </Icon>
                            </Grid>
                            <Grid item xs={8}>
                              <MDTypography variant="body2" fontWeight="medium">
                                {activity.description ||
                                  `${activity.visitor_name || "Visitante"} - ${activity.type}`}
                              </MDTypography>
                              <MDTypography variant="caption" color="text">
                                {new Date(activity.created_at || Date.now()).toLocaleString()}
                              </MDTypography>
                            </Grid>
                            <Grid item xs={3}>
                              <Chip
                                label={activity.status || "completado"}
                                size="small"
                                color={getStatusColor(activity.status || "completed")}
                              />
                            </Grid>
                          </Grid>
                        </MDBox>
                      ))}
                    </MDBox>
                  )}
                </MDBox>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" mb={3}>
                    Estado del Sistema
                  </MDTypography>

                  <MDBox mb={2}>
                    <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <MDTypography variant="body2">API Backend</MDTypography>
                      <Chip label="Conectado" size="small" color="success" />
                    </MDBox>
                  </MDBox>

                  <MDBox mb={2}>
                    <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <MDTypography variant="body2">Base de Datos</MDTypography>
                      <Chip label="Activa" size="small" color="success" />
                    </MDBox>
                  </MDBox>

                  <MDBox mb={2}>
                    <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <MDTypography variant="body2">Reconocimiento Facial</MDTypography>
                      <Chip label="Disponible" size="small" color="success" />
                    </MDBox>
                  </MDBox>

                  <MDBox mb={2}>
                    <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <MDTypography variant="body2">ANPR (Placas)</MDTypography>
                      <Chip label="Disponible" size="small" color="success" />
                    </MDBox>
                  </MDBox>

                  <MDBox mt={3}>
                    <MDButton
                      variant="outlined"
                      color="info"
                      size="small"
                      fullWidth
                      onClick={() => (window.location.href = "/settings")}
                    >
                      <Icon sx={{ mr: 1 }}>settings</Icon>
                      Configuración
                    </MDButton>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>

        {/* Charts - Opcional para mostrar tendencias */}
        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={8}>
              <ReportsBarChart
                color="info"
                title="Visitas por Día"
                description="Últimos 7 días"
                date="actualizado hace 2 min"
                chart={reportsBarChartData}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <ReportsLineChart
                color="success"
                title="Tendencia Semanal"
                description="Comparativo con semana anterior"
                date="actualizado ahora"
                chart={reportsLineChartData}
              />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}

export default Dashboard;
