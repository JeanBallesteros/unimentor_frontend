import Navbar from "../../../Components/Navbar/Navbar";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Swal from "sweetalert2";
import "./Avales.css";

const Avales = () => {
  const navigate = useNavigate();
  const [userss, setUserss] = useState([]);

  useEffect(() => {
    const checkAuthentication = async () => {
      const accessToken = await AsyncStorage.getItem("accessToken");
      const role = jwtDecode(accessToken).user.role;
      if (!accessToken || role != "master") {
        navigate("/");
      }
    };

    checkAuthentication();
  }, []);

  const handleRefreshToken = async (refreshToken) => {
    try {
      const response = await axios.post(
        "https://unimentor-fqz8.onrender.com/api/v1/auth/refresh-token",
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


  useEffect(() => {
    const handleShowUsers = async () => {
      const response = await axios.get(
        "http://192.168.0.25:3000/api/v1/avales"
      );
  
      setUserss(response.data);

      console.log(response.data);
    };

    handleShowUsers();
  }, []);


  return (
    <div className="monitor">
      <Navbar />
      <div>
        <h1 className="titulo">Avales</h1>
        <table className="tabla">
          <thead>
            <tr>
              <th>Número de documento</th>
              <th>Nombre completo</th>
              <th>Promedio</th>
              <th>RUT</th>
              <th>Certificado</th>
              <th>Asignatura</th>
              <th>Grupo</th>
              <th>Opciones</th>
            </tr>
          </thead>
          <tbody>
            {userss.map((usuario, index) => (
              <tr key={index}>
                <td>{usuario.documentNumber}</td>
                <td>{usuario.fullname}</td>
                <td>
                  {usuario.avalsData.map((aval, idx) => (
                    <div key={idx}>
                      <p>{aval.promedio}</p>
                    </div>
                  ))}
                </td>
                <td>
                  {usuario.avalsData.map((aval, idx) => (
                    <div key={idx}>
                      <p>{aval.rut}</p>
                    </div>
                  ))}
                </td>
                <td>
                  {usuario.avalsData.map((aval, idx) => (
                    <div key={idx}>
                      <p>{aval.certificado}</p>
                    </div>
                  ))}
                </td>
                <td>LISTA DESPLEGABLE</td>
                <td>{usuario.fecha}</td>
                <td>{usuario.fecha}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Avales;
