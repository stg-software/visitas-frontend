// src/components/PhotoCapture/index.js
import React, { useRef, useCallback, useState } from "react";
import Webcam from "react-webcam";
import PropTypes from "prop-types";

// MUI & MD Components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import Avatar from "@mui/material/Avatar";
import Paper from "@mui/material/Paper";

const videoConstraints = {
  width: 640,
  height: 480,
  facingMode: "user",
};

const PhotoCapture = ({ onPhotoCapture, currentPhoto, onClearPhoto }) => {
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      fetch(imageSrc)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
          onPhotoCapture(file);
        });
    }
  }, [onPhotoCapture]);

  const handleFileChange = (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) onPhotoCapture(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files && event.dataTransfer.files[0];
    if (file) onPhotoCapture(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  return (
    <MDBox>
      <MDTypography variant="h6" gutterBottom>
        Fotografía del Visitante
      </MDTypography>

      {currentPhoto ? (
        <MDBox textAlign="center">
          <Avatar
            src={URL.createObjectURL(currentPhoto)}
            sx={{ width: 150, height: 150, margin: "auto" }}
          />
          <MDBox display="flex" gap={1} justifyContent="center" mt={2}>
            <MDButton variant="outlined" color="secondary" onClick={onClearPhoto}>
              Eliminar Foto
            </MDButton>
            <MDButton variant="gradient" color="primary" onClick={capture}>
              Tomar Nueva Foto
            </MDButton>
          </MDBox>
        </MDBox>
      ) : (
        <MDBox textAlign="center" display="flex" flexDirection="column" alignItems="center">
          {/* Webcam */}
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            style={{
              borderRadius: "8px",
              border: "2px solid #e0e0e0",
              width: "50%",
              marginBottom: "10px",
            }}
          />
          <MDButton variant="gradient" color="success" onClick={capture}>
            Capturar Foto
          </MDButton>

          {/* Zona Drag & Drop / File input */}
          <Paper
            variant="outlined"
            sx={{
              mt: 2,
              p: 2,
              width: "60%",
              textAlign: "center",
              border: dragActive ? "2px dashed #1976d2" : "2px dashed #ccc",
              backgroundColor: dragActive ? "rgba(25, 118, 210, 0.05)" : "transparent",
              cursor: "pointer",
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <MDTypography variant="body2" color="text">
              Arrastra una imagen aquí o haz clic para seleccionar
            </MDTypography>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </Paper>
        </MDBox>
      )}
    </MDBox>
  );
};

PhotoCapture.propTypes = {
  onPhotoCapture: PropTypes.func.isRequired,
  currentPhoto: PropTypes.object,
  onClearPhoto: PropTypes.func.isRequired,
};

export default PhotoCapture;
