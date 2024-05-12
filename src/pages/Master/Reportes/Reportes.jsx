import React, { useState, useEffect } from "react";
import Navbar from "../../../Components/Navbar/Navbar";
import "./Reportes.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import "react-datepicker/dist/react-datepicker.css";
import { MdCheckCircle } from "react-icons/md";
import { MdCancel } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import ExcelDownloader from '../../../Components/ExcelDownloader/ExcelDownloader';


const Reportes = () => {
    const navigate = useNavigate();

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
    
  
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
        { name: 'Doe', age: 40 }
      ];

    return (
      <div className='fondoReportes'>
        <Navbar/>
          <div className='reportes'>
            <div className='table-container'>
              <div>
                {/* <h1>Descargar Excel</h1> */}
                <ExcelDownloader data={data} fileName="usuarios" />
              </div>
            </div>
          </div>
      </div>
    );
  };

export default Reportes