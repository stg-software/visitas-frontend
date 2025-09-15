import React, { useRef, useCallback } from "react";
import Webcam from "react-webcam";
import PropTypes from "prop-types";

// MUI & MD Components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import Avatar from "@mui/material/Avatar";

const videoConstraints = {
  width: 640,
  height: 480,
  facingMode: "user", // frontal, usa "environment" para trasera en móviles
};

const PhotoCapture = ({ onPhotoCapture, currentPhoto, onClearPhoto }) => {
  const webcamRef = useRef(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      // Convertir Base64 → Blob → File
      fetch(imageSrc)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "visitor_photo.jpg", { type: "image/jpeg" });
          onPhotoCapture(file);
        });
    }
  }, [onPhotoCapture]);

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
            <MDButton
              variant="gradient"
              color="primary"
              onClick={() => webcamRef.current && capture()}
            >
              Tomar Nueva Foto
            </MDButton>
          </MDBox>
        </MDBox>
      ) : (
        <MDBox textAlign="center" display="flex" flexDirection="column" alignItems="center">
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
