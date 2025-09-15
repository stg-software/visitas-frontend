/**
=========================================================
* Material Dashboard 2 React - v2.2.0 - Sistema de Control de Visitas
=========================================================

* Navbar mejorado con controles de tema, idioma y sesión
* Proyecto: Maestría en Inteligencia Artificial - UNIR

=========================================================
*/

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

// @material-ui core components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

// @mui icons
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import LanguageIcon from "@mui/icons-material/Language";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";

// Material Dashboard 2 React example components
import Breadcrumbs from "examples/Breadcrumbs";
import NotificationItem from "examples/Items/NotificationItem";

// Custom styles for DashboardNavbar
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarMobileMenu,
} from "examples/Navbars/DashboardNavbar/styles";

// Material Dashboard 2 React context
import {
  useMaterialUIController,
  setTransparentNavbar,
  setMiniSidenav,
  setOpenConfigurator,
  setDarkMode,
} from "context";

function DashboardNavbar({ absolute, light, isMini }) {
  const navigate = useNavigate();
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, openConfigurator, darkMode } = controller;

  // Estados para menús
  const [openNotifications, setOpenNotifications] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const route = useLocation().pathname.split("/").slice(1);

  // Obtener datos del usuario
  useEffect(() => {
    const userData = localStorage.getItem("user_data");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    // Setting the navbar type
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    // A function that sets the transparent state of the navbar.
    function handleTransparentNavbar() {
      setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    }

    window.addEventListener("scroll", handleTransparentNavbar);
    handleTransparentNavbar();

    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  // Handlers para acciones
  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  // 🆕 Handler para cambiar tema
  const handleToggleTheme = () => {
    setDarkMode(dispatch, !darkMode);
  };

  // 🆕 Handler para cambiar idioma (deshabilitado por ahora)
  const handleLanguageChange = () => {
    // TODO: Implementar cambio de idioma
    console.log("Cambio de idioma - Función no implementada aún");
  };

  // 🆕 Handler para cerrar sesión
  const handleLogout = () => {
    // Limpiar datos de sesión
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_data");

    // Redirigir al login
    navigate("/authentication/sign-in");

    // Opcional: recargar página para limpiar estado
    window.location.reload();
  };

  // Handlers para menús
  const handleOpenNotifications = (event) => setOpenNotifications(event.currentTarget);
  const handleCloseNotifications = () => setOpenNotifications(false);

  const handleOpenUserMenu = (event) => setOpenUserMenu(event.currentTarget);
  const handleCloseUserMenu = () => setOpenUserMenu(false);

  // Render del menú de notificaciones
  const renderNotificationsMenu = () => (
    <Menu
      anchorEl={openNotifications}
      anchorReference={null}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      open={Boolean(openNotifications)}
      onClose={handleCloseNotifications}
      sx={{ mt: 2 }}
    >
      <NotificationItem icon={<Icon>camera_alt</Icon>} title="Nuevo visitante reconocido" />
      <NotificationItem icon={<Icon>directions_car</Icon>} title="Vehículo registrado en entrada" />
      <NotificationItem icon={<Icon>security</Icon>} title="Alerta de seguridad resuelta" />
    </Menu>
  );

  // 🆕 Render del menú de usuario
  const renderUserMenu = () => (
    <Menu
      anchorEl={openUserMenu}
      anchorReference={null}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={Boolean(openUserMenu)}
      onClose={handleCloseUserMenu}
      sx={{ mt: 2 }}
    >
      {/* Información del usuario */}
      <MDBox px={2} py={1}>
        <MDTypography variant="h6" fontWeight="medium">
          {currentUser?.name || "Usuario"}
        </MDTypography>
        <MDTypography variant="caption" color="text">
          {currentUser?.email || "email@ejemplo.com"}
        </MDTypography>
        <MDTypography variant="caption" color="success" display="block">
          Rol: {currentUser?.role || "user"}
        </MDTypography>
      </MDBox>

      <Divider />

      {/* Opciones del menú */}
      <MenuItem
        onClick={() => {
          handleCloseUserMenu();
          navigate("/profile");
        }}
      >
        <ListItemIcon>
          <PersonIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Mi Perfil</ListItemText>
      </MenuItem>

      {/* <MenuItem
        onClick={() => {
          handleCloseUserMenu();
          handleConfiguratorOpen();
        }}
      >
        <ListItemIcon>
          <SettingsIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Configuración</ListItemText>
      </MenuItem> */}

      <Divider />

      <MenuItem
        onClick={() => {
          handleCloseUserMenu();
          handleLogout();
        }}
      >
        <ListItemIcon>
          <LogoutIcon fontSize="small" color="error" />
        </ListItemIcon>
        <ListItemText>
          <MDTypography color="error">Cerrar Sesión</MDTypography>
        </ListItemText>
      </MenuItem>
    </Menu>
  );

  // Styles for the navbar icons
  const iconsStyle = ({ palette: { dark, white, text }, functions: { rgba } }) => ({
    color: () => {
      let colorValue = light || darkMode ? white.main : dark.main;

      if (transparentNavbar && !light) {
        colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
      }

      return colorValue;
    },
  });

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) => navbar(theme, { transparentNavbar, absolute, light, darkMode })}
    >
      <Toolbar sx={(theme) => navbarContainer(theme)}>
        <MDBox color="inherit" mb={{ xs: 1, md: 0 }} sx={(theme) => navbarRow(theme, { isMini })}>
          <Breadcrumbs icon="home" title={route[route.length - 1]} route={route} light={light} />
        </MDBox>

        {isMini ? null : (
          <MDBox sx={(theme) => navbarRow(theme, { isMini })}>
            {/* Búsqueda (opcional) */}
            {/* <MDBox pr={1} display={{ xs: "none", md: "block" }}>
              <MDInput label="Buscar visitante..." size="small" />
            </MDBox> */}

            <MDBox color={light ? "white" : "inherit"} display="flex" alignItems="center">
              {/* 🆕 Botón de cambio de tema */}
              <Tooltip title={darkMode ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}>
                <IconButton
                  size="small"
                  disableRipple
                  color="inherit"
                  sx={navbarIconButton}
                  onClick={handleToggleTheme}
                >
                  {darkMode ? (
                    <LightModeIcon sx={iconsStyle} fontSize="small" />
                  ) : (
                    <DarkModeIcon sx={iconsStyle} fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>

              {/* 🆕 Botón de idioma (deshabilitado) */}
              <Tooltip title="Cambio de idioma (próximamente)">
                <span>
                  <IconButton
                    size="small"
                    disableRipple
                    color="inherit"
                    sx={{ ...navbarIconButton, opacity: 0.5 }}
                    onClick={handleLanguageChange}
                    disabled
                  >
                    <LanguageIcon sx={iconsStyle} fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>

              {/* Botón de notificaciones */}
              <Tooltip title="Notificaciones">
                <IconButton
                  size="small"
                  disableRipple
                  color="inherit"
                  sx={navbarIconButton}
                  onClick={handleOpenNotifications}
                >
                  <Icon sx={iconsStyle}>notifications</Icon>
                </IconButton>
              </Tooltip>

              {/* Botón de menú móvil */}
              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarMobileMenu}
                onClick={handleMiniSidenav}
              >
                <Icon sx={iconsStyle} fontSize="medium">
                  {miniSidenav ? "menu_open" : "menu"}
                </Icon>
              </IconButton>

              {/* 🆕 Botón de usuario/cerrar sesión */}
              <Tooltip title="Menú de usuario">
                <IconButton
                  size="small"
                  disableRipple
                  color="inherit"
                  sx={navbarIconButton}
                  onClick={handleOpenUserMenu}
                >
                  <PersonIcon sx={iconsStyle} fontSize="small" />
                </IconButton>
              </Tooltip>

              {/* Renderizar menús */}
              {renderNotificationsMenu()}
              {renderUserMenu()}
            </MDBox>
          </MDBox>
        )}
      </Toolbar>
    </AppBar>
  );
}

// Setting default values for the props of DashboardNavbar
DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

// Typechecking props for the DashboardNavbar
DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;
