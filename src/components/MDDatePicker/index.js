/**
 * Material Dashboard 2 React - v2.1.0
 * Sistema de Control de Visitas
 * Componente: MDDatePicker Simple (Corregido para compatibilidad)
 */

import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import { TextField } from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

const MDDatePicker = forwardRef(
  (
    {
      label,
      value,
      onChange,
      error,
      helperText,
      disabled,
      minDate,
      maxDate,
      required,
      fullWidth,
      variant,
      size,
      name, // Agregado para compatibilidad con formularios
      ...other
    },
    ref
  ) => {
    // Convertir fecha a formato YYYY-MM-DD para input[type="date"]
    const formatDateForInput = (date) => {
      if (!date) return "";

      if (date instanceof Date) {
        return date.toISOString().split("T")[0];
      }

      if (typeof date === "string") {
        // Si ya está en formato YYYY-MM-DD, devolverlo tal como está
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return date;
        }
        // Intentar parsear la fecha
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toISOString().split("T")[0];
        }
      }

      return "";
    };

    // Manejar cambios de fecha - Corregido para compatibilidad con formularios
    const handleDateChange = (event) => {
      const inputValue = event.target.value;

      // Crear un evento sintético que sea compatible con handleInputChange
      const syntheticEvent = {
        target: {
          name: name, // Usar el prop name
          value: inputValue, // Devolver el string directamente
        },
      };

      // Llamar al onChange con el evento sintético
      if (onChange) {
        onChange(syntheticEvent);
      }
    };

    // Formatear fechas mínima y máxima
    const getFormattedDate = (date) => {
      if (!date) return undefined;

      if (typeof date === "string") {
        return date;
      }

      return formatDateForInput(date);
    };

    const formatMinDate = getFormattedDate(minDate);
    const formatMaxDate = getFormattedDate(maxDate);

    return (
      <MDBox>
        <TextField
          ref={ref}
          type="date"
          label={label}
          name={name}
          value={formatDateForInput(value)}
          onChange={handleDateChange}
          error={error}
          helperText={helperText}
          disabled={disabled}
          required={required}
          fullWidth={fullWidth}
          variant={variant || "outlined"}
          size={size || "medium"}
          inputProps={{
            min: formatMinDate,
            max: formatMaxDate,
          }}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: error ? "#f44335" : "rgba(0, 0, 0, 0.23)",
              },
              "&:hover fieldset": {
                borderColor: error ? "#f44335" : "#1976d2",
              },
              "&.Mui-focused fieldset": {
                borderColor: error ? "#f44335" : "#1976d2",
              },
            },
            "& .MuiInputLabel-root": {
              color: error ? "#f44335" : "rgba(0, 0, 0, 0.6)",
              "&.Mui-focused": {
                color: error ? "#f44335" : "#1976d2",
              },
            },
          }}
          {...other}
        />
      </MDBox>
    );
  }
);

// Display name para debugging
MDDatePicker.displayName = "MDDatePicker";

// Configuración de PropTypes
MDDatePicker.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
    PropTypes.oneOf([null]),
  ]),
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string, // Agregado
  error: PropTypes.bool,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  minDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  maxDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  required: PropTypes.bool,
  fullWidth: PropTypes.bool,
  variant: PropTypes.oneOf(["outlined", "filled", "standard"]),
  size: PropTypes.oneOf(["small", "medium"]),
};

// Valores por defecto
MDDatePicker.defaultProps = {
  label: "",
  value: null,
  error: false,
  helperText: "",
  disabled: false,
  minDate: null,
  maxDate: null,
  required: false,
  fullWidth: true,
  variant: "outlined",
  size: "medium",
  name: "", // Agregado
};

export default MDDatePicker;
