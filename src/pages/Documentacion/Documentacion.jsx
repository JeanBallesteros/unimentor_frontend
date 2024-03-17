import React, { useState, useEffect } from 'react'
import Navbar from "../../Components/Navbar/Navbar";
import "./Documentacion.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";

const Documentacion = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si el usuario está autenticado al cargar el componente
    const checkAuthentication = async () => {
      const accessToken = await AsyncStorage.getItem("accessToken");
      if (!accessToken) {
        // Si no hay un token de acceso, redirigir al usuario al componente al login
        navigate("/");
      }
    };

    checkAuthentication();
  }, []);

  const handleRefreshToken = async (refreshToken) => {
    try {
      const response = await axios.post(
        "https://unimentor-dev-rfzz.1.us-1.fl0.io/api/v1/auth/refresh-token",
        { refreshToken }
      );

      // Almacena el nuevo accessToken en el estado de la aplicación
      const newAccessToken = response.data.accessToken;
      await AsyncStorage.setItem("accessToken", newAccessToken);
    } catch (error) {
      // Manejar el error de renovación de tokens
      console.error("Error al renovar el accessToken:", error);
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
            title: "¡Tu sesión está a punto de caducar!",
            text: "¿Quieres extender la sesión?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "OK",
          }).then((result) => {
            if (result.isConfirmed) {
              // El usuario hizo clic en "OK"
              console.log("El usuario hizo clic en OK");
              handleRefreshToken(refreshToken);
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              // El usuario hizo clic en "Cancelar" o cerró la alerta
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

    // Configurar un temporizador para verificar periódicamente si el AccessToken ha expirado
    const intervalId = setInterval(expireToken, 20000); // Verificar cada 20 segundos

    // Limpiar el temporizador cuando el componente se desmonte
    return () => clearInterval(intervalId);
  });


  // const [selectedFile, setSelectedFile] = useState(null);
  const [files, setFiles] = useState([null, null, null]); // Arreglo para almacenar los archivos seleccionados

  const handleFileChange = (event, index) => {
    const newFiles = [...files]; // Copiar el arreglo de archivos seleccionados
    newFiles[index] = event.target.files[0]; // Actualizar el archivo en la posición index
    setFiles(newFiles); // Actualizar el estado
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      const formData = new FormData(); // Crear un objeto FormData
      
      // Cambiar nombres de archivos y agregarlos al FormData
      files.forEach((file, index) => {
        if (file) {
          if(index+1 === 1){
            const newFileName = `promedio${index + 1}.${file.name.split('.').pop()}`; // Generar nuevo nombre
            formData.append(`files`, new File([file], newFileName, { type: file.type })); // Agregar archivo con nuevo nombre al FormData
          }else if(index+1 === 2){
            const newFileName = `rut${index + 1}.${file.name.split('.').pop()}`; // Generar nuevo nombre
            formData.append(`files`, new File([file], newFileName, { type: file.type })); // Agregar archivo con nuevo nombre al FormData
          }else{
            const newFileName = `certificado${index + 1}.${file.name.split('.').pop()}`; // Generar nuevo nombre
            formData.append(`files`, new File([file], newFileName, { type: file.type })); // Agregar archivo con nuevo nombre al FormData
          }
        }
      });

      const accessTokenTemp = await AsyncStorage.getItem("accessToken");

      const id = jwtDecode(accessTokenTemp).user._id;
      // console.log(id);
      console.log(files);
      console.log(formData);

      const response = await axios.post(`http://192.168.0.25:3000/api/v1/avales/${id}`, formData);
      console.log(response.data);
    } catch (error) {
      console.error('Error al cargar los archivos:', error);
    }
  };

  return (
    <div className='monitor'>
      <Navbar />
      <div>
        <h1 className="titulo">Documentación</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="fileInput1">PROMEDIO:</label>
            <input
              type="file"
              id="fileInput1"
              accept="image/*"
              required
              onChange={(event) => handleFileChange(event, 0)}
            />
          </div>
          <div>
            <label htmlFor="fileInput2">RUT:</label>
            <input
              type="file"
              id="fileInput2"
              accept=".pdf"
              required
              onChange={(event) => handleFileChange(event, 1)}
            />
          </div>
          <div>
            <label htmlFor="fileInput3">CERTIFICADO:</label>
            <input
              type="file"
              id="fileInput3"
              accept=".pdf"
              required
              onChange={(event) => handleFileChange(event, 2)}
            />
          </div>
          <button type="submit">Enviar</button>
        </form>
      </div>
    </div>
  );
};

export default Documentacion;