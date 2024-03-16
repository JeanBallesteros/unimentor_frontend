import React, { useState, useEffect } from "react";
import { MdEmail } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import "./LoginForm.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";
import Swal from 'sweetalert2';


const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const navigate = useNavigate();


  useEffect(() => {
    // Verificar si el usuario está autenticado al cargar el componente
    const checkAuthentication = async () => {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (accessToken) {
        // Si hay un token de acceso, redirigir al usuario al componente "dashboard"
        navigate('/dashboard');
      }
    };

    checkAuthentication();
  }, []);

  const handleSaveCredentials = () => {
    // Aquí puedes usar la API del navegador para guardar las credenciales
    // Por ejemplo, puedes usar la API Credential Management:
    if ('credentials' in navigator) {
      navigator.credentials.store(new PasswordCredential({
        id: email,
        password: password
      }));
    }
  };

  const login = async () => {
    try {
      const response = await axios.post(
        'https://unimentor-dev-rfzz.1.us-1.fl0.io/api/v1/auth/login',
        new URLSearchParams({
          email: email,
          current_password: password
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          redirect: 'follow'
        }
      );
  
      console.log(response.data);
  
      const { message, accessToken, refreshToken } = response.data;
  
      // Almacena los tokens de acceso y refresco
      await AsyncStorage.setItem("accessToken", accessToken);
      await AsyncStorage.setItem("refreshToken", refreshToken);
  
  
      navigate('/dashboard');
  
      handleSaveCredentials(); // Guardar las credenciales cuando se haya iniciado sesión con éxito
    } catch (error) {
      console.error(error.response.data.message);
      Swal.fire({
        title: '¡Error! ¡Inténtalo de nuevo!',
        text: '¡'+error.response.data.message+'!',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  }

  return (
    <div className="wrapper">
      <div className="header">
        <img src="src\assets\unimentor_icon.png" alt="" />
        <div className="header_titles">
          <h1>UniMentor</h1>
          <p>Llevando la Claridad a Cada Sesión de Estudio</p>
        </div>
      </div>

      <div className="login">
        <h2>INICIAR SESIÓN</h2>
      </div>

      <div className="input-box">
        <input
          type="text"
          placeholder="Correo Institucional"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <MdEmail className="icon" />
      </div>

      <div className="input-box">
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <FaLock className="icon" />
      </div>

      <button onClick={login}>Ingresar</button>
    </div>
  );
};

export default LoginForm;
