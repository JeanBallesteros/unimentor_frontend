import "./MonitorHome.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import Navbar from "../../Components/Navbar/Navbar";
import Card from "../../Components/Card/Card";

const MonitorHome = () => {
  const navigate = useNavigate();
  const URL = import.meta.env.VITE_BACKEND_URL;
  

  useEffect(() => {
    const checkAuthentication = async () => {
      const accessToken = await AsyncStorage.getItem("accessToken");
      if (!accessToken) {
        navigate("/");
      }
    };

    checkAuthentication();
  }, []);

  const handleRefreshToken = async (refreshToken) => {
    try {
      const response = await axios.post(
        "${URL}/api/v1/auth/refresh-token",
        { refreshToken }
      );

      const newAccessToken = response.data.accessToken;
      await AsyncStorage.setItem("accessToken", newAccessToken);
    } catch (error) {
      console.error("Error al renovar el accessToken:", error);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");
    navigate("/");
  };

  useEffect(() => {
    const expireToken = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("accessToken");
        const refreshToken = await AsyncStorage.getItem("refreshToken");

        const decodedToken = jwtDecode(accessToken);
        const expiracion = decodedToken.exp * 1000;
        const ahora = Date.now();

        if (ahora >= expiracion) {
          console.log("El AccessToken ha expirado");
          Swal.fire({
            title: "¡Tu sesión está a punto de caducar!",
            text: "¿Quieres extender la sesión?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "OK",
          }).then((result) => {
            if (result.isConfirmed) {
              console.log("El usuario hizo clic en OK");
              handleRefreshToken(refreshToken);
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              console.log("El usuario hizo clic en Cancelar o cerró la alerta");
              logout();
            }
          });
        } else {
          console.log("El AccessToken es válido");
        }
      } catch (error) {
        console.error("Error al obtener o decodificar el token:", error);
      }
    };

    const intervalId = setInterval(expireToken, 20000);

    return () => clearInterval(intervalId);
  });

  return (
    <div className="fondoHome">
      <Navbar />
      <div className="home-container">
        <div className="titulo-home">
          <h1>Nuestros Técnicos</h1>
        </div>
        <div className="cards">
          <Card
            title="Técnico Profesional en Control Industrial"
            imageUrl="https://www.se.com/co/es/assets/v2/613/media/233545/G9A5739-IC-1920x1080.jpg"
            href="https://www.autonoma.edu.co/utc/tecnico-profesional-en-mantenimiento-mecanico"
            />
          <Card
            title="Técnico Profesional en Mantenimiento Mecánico"
            imageUrl="https://www.unicontrol.com.pe/wp-content/uploads/2021/07/mantenimientos-mecanicos-2.jpg"
            href="https://www.autonoma.edu.co/utc/tecnico-profesional-en-control-industrial"
            />
          <Card
            title="Técnico Profesional en Programación de Computadores"
            imageUrl="https://www.cbtis236.edu.mx/storage/pages/programacion.jpg"
            href="https://www.autonoma.edu.co/utc/tecnico-profesional-en-programacion-de-computadores"
          />
        </div>
      </div>
    </div>
  );
};

export default MonitorHome;
