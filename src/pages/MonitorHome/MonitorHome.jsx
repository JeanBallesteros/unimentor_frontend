import './MonitorHome.css'
import React, { useState, useEffect } from "react";
import { MdEmail } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";
import Swal from 'sweetalert2';

const MonitorHome = () => {
  const navigate = useNavigate();


  useEffect(() => {
    // Verificar si el usuario está autenticado al cargar el componente
    const checkAuthentication = async () => {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        // Si no hay un token de acceso, redirigir al usuario al componente al login
        navigate('/');
      }
    };

    checkAuthentication();
  }, []);

  const handleRefreshToken = async (refreshToken) => {
    try {
      const response = await axios.post(
        'http://192.168.0.25:3000/api/v1/auth/refresh-token',
        { refreshToken }
      );
  
      // Almacena el nuevo accessToken en el estado de la aplicación
      const newAccessToken = response.data.accessToken;
      await AsyncStorage.setItem("accessToken", newAccessToken);

    } catch (error) {
      // Manejar el error de renovación de tokens
      console.error('Error al renovar el accessToken:', error);
    }
  };

  //Mirar si ya expiró el AccessToken
  useEffect(() => {
    const expireToken = async () => {
      try {

        const accessToken = await AsyncStorage.getItem("accessToken");
        const refreshToken = await AsyncStorage.getItem("refreshToken");

        // Decodificar el AccessToken para verificar la fecha de expiración
        const decodedToken = jwtDecode(accessToken);
        // console.log(decodedToken)
        const expiracion = decodedToken.exp * 1000; // Convertir a milisegundos
    
        // Obtener la fecha actual
        const ahora = Date.now();
    
        // Verificar si el AccessToken ha expirado
        if (ahora >= expiracion) {
          console.log("El AccessToken ha expirado");
          Swal.fire({
            title: '¡Tu sesión está a punto de caducar!',
            text: '¿Quieres extender la sesión?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'OK'
          }).then((result) => {
            if (result.isConfirmed) {
              // El usuario hizo clic en "OK"
              console.log('El usuario hizo clic en OK');
              handleRefreshToken(refreshToken);
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              // El usuario hizo clic en "Cancelar" o cerró la alerta
              console.log('El usuario hizo clic en Cancelar o cerró la alerta');
              
              logout();
            }
          });
        } else {
          console.log("El AccessToken es válido");
        }
      } catch (error) {
        console.error('Error al obtener o decodificar el token:', error);
      }
    };

    // Configurar un temporizador para verificar periódicamente si el AccessToken ha expirado
    const intervalId = setInterval(expireToken, 20000); // Verificar cada 20 segundos

    // Limpiar el temporizador cuando el componente se desmonte
    return () => clearInterval(intervalId);
  });




  const logout = async () => {
    try {
      // Eliminar el AccessToken y el RefreshToken de AsyncStorage
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");
  
      // Redirigir al usuario a la página de inicio de sesión o a cualquier otra página deseada
      navigate('/');
    } catch (error) {
      console.error("Error al realizar el logout:", error);
    }
  };





  return (
    <div className='wrapper-button'>
      <h1 className='titulo'>Monitor Home</h1>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  )
}

export default MonitorHome