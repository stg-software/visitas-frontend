/**
=========================================================
* Material Dashboard 2 React - v2.2.0 - Sistema de Control de Visitas
=========================================================

* Adaptado para Sistema Automatizado de Control de Visitas
* Proyecto: Maestría en Inteligencia Artificial - UNIR
* Autor: Santiago Torres Gonzalez

=========================================================
*/

import Icon from "@mui/material/Icon";
import PeopleIcon from "@mui/icons-material/People";
// import CameraAltIcon from "@mui/icons-material/CameraAlt";
// import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
// import AssessmentIcon from "@mui/icons-material/Assessment";
// import SecurityIcon from "@mui/icons-material/Security";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

// Layouts
import Dashboard from "layouts/dashboard";
// import Tables from "layouts/tables";
// import Billing from "layouts/billing";
// import Notifications from "layouts/notifications";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import PreRegisterPage from "layouts/pre-register";
import VisitorManagement from "layouts/visitor-management";
import Approvals from "layouts/approvals";
import VisitCheckIn from "layouts/VisitCheckIn";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
    // 🆕 Propiedades de control
    visible: true, // Mostrar/ocultar ruta
    requireAuth: true, // Requiere autenticación
    roles: ["admin", "operator", "user"], // Roles permitidos
    showInSidebar: true, // Mostrar en sidebar
    showInBreadcrumb: true, // Mostrar en breadcrumb
    isPublic: false, // Ruta pública (sin auth)
  },
  {
    type: "collapse",
    name: "Autorizaciones",
    key: "approvals",
    icon: <Icon fontSize="small">check_circle</Icon>,
    route: "/approvals",
    component: <Approvals />,
    // 🆕 Propiedades de control
    visible: true, // Mostrar/ocultar ruta
    requireAuth: true, // Requiere autenticación
    roles: ["admin", "operator", "user"], // Roles permitidos
    showInSidebar: true, // Mostrar en sidebar
    showInBreadcrumb: true, // Mostrar en breadcrumb
    isPublic: false, // Ruta pública (sin auth)
  },
  // {
  //   type: "collapse",
  //   name: "Reconocimiento Facial",
  //   key: "face-recognition",
  //   icon: <CameraAltIcon fontSize="small" />,
  //   route: "/recognition/face",
  //   component: <Tables />,
  //   // 🔐 Solo para admin y operadores
  //   visible: true,
  //   requireAuth: true,
  //   roles: ["admin", "operator"],
  //   showInSidebar: true,
  //   showInBreadcrumb: true,
  //   isPublic: false,
  //   // 🆕 Propiedades adicionales
  //   badge: "IA", // Badge en el sidebar
  //   description: "Reconocimiento facial en tiempo real",
  // },
  // {
  //   type: "collapse",
  //   name: "Reconocimiento de Placas",
  //   key: "plate-recognition",
  //   icon: <DirectionsCarIcon fontSize="small" />,
  //   route: "/recognition/plates",
  //   component: <Tables />,
  //   visible: true,
  //   requireAuth: true,
  //   roles: ["admin", "operator"],
  //   showInSidebar: true,
  //   showInBreadcrumb: true,
  //   isPublic: false,
  //   badge: "ANPR",
  // },
  {
    type: "collapse",
    name: "Gestión de Visitantes",
    key: "visitors",
    icon: <PeopleIcon fontSize="small" />,
    route: "/visitors",
    component: <VisitorManagement />,
    visible: true,
    requireAuth: true,
    roles: ["admin", "operator", "user"],
    showInSidebar: true,
    showInBreadcrumb: true,
    isPublic: false,
  },
  {
    type: "collapse",
    name: "Pre-Registro",
    key: "pre-register",
    icon: <PersonAddIcon fontSize="small" />,
    route: "/pre-register",
    component: <PreRegisterPage />,
    visible: true,
    requireAuth: true,
    roles: ["admin", "operator", "user"],
    showInSidebar: true,
    showInBreadcrumb: true,
    isPublic: false,
  },
  {
    type: "collapse",
    name: "Check-In de Visitas",
    key: "visit-check-in",
    icon: <Icon fontSize="small">play_circle_outline</Icon>,
    route: "/visit-check-in",
    component: <VisitCheckIn />,
    visible: true,
    requireAuth: true,
    roles: ["admin", "operator", "user"],
    showInSidebar: true,
    showInBreadcrumb: true,
    isPublic: false,
  },
  // {
  //   type: "collapse",
  //   name: "Reportes y Analytics",
  //   key: "reports",
  //   icon: <AssessmentIcon fontSize="small" />,
  //   route: "/reports",
  //   component: <Billing />,
  //   visible: true,
  //   requireAuth: true,
  //   roles: ["admin"], // 🔒 Solo administradores
  //   showInSidebar: true,
  //   showInBreadcrumb: true,
  //   isPublic: false,
  //   badge: "Premium",
  // },
  // {
  //   type: "collapse",
  //   name: "Centro de Seguridad",
  //   key: "security",
  //   icon: <SecurityIcon fontSize="small" />,
  //   route: "/security",
  //   component: <Notifications />,
  //   visible: true,
  //   requireAuth: true,
  //   roles: ["admin"],
  //   showInSidebar: true,
  //   showInBreadcrumb: true,
  //   isPublic: false,
  //   badge: "Alert",
  // },
  // 🔧 Configuración de sistema (oculta por defecto)
  // {
  //   type: "collapse",
  //   name: "Configuración Avanzada",
  //   key: "advanced-config",
  //   icon: <Icon fontSize="small">settings</Icon>,
  //   route: "/config/advanced",
  //   component: <Profile />,
  //   visible: false, // 🚫 Oculta por defecto
  //   requireAuth: true,
  //   roles: ["admin"],
  //   showInSidebar: false,
  //   showInBreadcrumb: true,
  //   isPublic: false,
  //   // 🆕 Condicionales dinámicas
  //   showIf: () => {
  //     // Solo mostrar si está en modo desarrollo
  //     return process.env.REACT_APP_ENV === "development";
  //   },
  // },
  // {
  //   type: "collapse",
  //   name: "Perfil de Usuario",
  //   key: "profile",
  //   icon: <Icon fontSize="small">person</Icon>,
  //   route: "/profile",
  //   component: <Profile />,
  //   visible: true,
  //   requireAuth: true,
  //   roles: ["admin", "operator", "user"],
  //   showInSidebar: true,
  //   showInBreadcrumb: true,
  //   isPublic: false,
  // },
  // 🔓 Rutas públicas (autenticación)
  {
    type: null, // No aparece en sidebar
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
    visible: true,
    requireAuth: false,
    showInSidebar: false,
    showInBreadcrumb: false,
    isPublic: true,
  },
  {
    type: null,
    name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: <SignUp />,
    visible: false, // 🚫 Registro deshabilitado
    requireAuth: false,
    showInSidebar: false,
    showInBreadcrumb: false,
    isPublic: true,
  },
];

// 🆕 Función para filtrar rutas basado en usuario y configuración
export const getFilteredRoutes = (userRole = null, showHidden = false) => {
  return routes.filter((route) => {
    // 1. Verificar visibilidad básica
    if (!route.visible && !showHidden) return false;

    // 2. Verificar función condicional
    if (route.showIf && !route.showIf()) return false;

    // 3. Verificar permisos de rol
    if (route.requireAuth && userRole) {
      return route.roles.includes(userRole);
    }

    // 4. Rutas públicas siempre se muestran
    if (route.isPublic) return true;

    return true;
  });
};

// 🆕 Función para obtener solo rutas del sidebar
export const getSidebarRoutes = (userRole = null) => {
  return getFilteredRoutes(userRole).filter(
    (route) => route.showInSidebar && route.type === "collapse"
  );
};

// 🆕 Función para verificar si una ruta requiere autenticación
export const isProtectedRoute = (routePath) => {
  const route = routes.find((r) => r.route === routePath);
  return route ? route.requireAuth : true; // Por defecto protegida
};

// 🆕 Función para verificar permisos de usuario en ruta
export const hasRoutePermission = (routePath, userRole) => {
  const route = routes.find((r) => r.route === routePath);
  if (!route) return false;

  if (route.isPublic) return true;
  if (!route.requireAuth) return true;

  return route.roles.includes(userRole);
};

export default routes;
