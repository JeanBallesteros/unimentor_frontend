import React, { useState, useEffect } from "react";
import { MdEmail } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import "./LoginForm.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";
import Swal from 'sweetalert2';



/**
 * Componente funcional que representa un formulario de inicio de sesión.
 * Permite a los usuarios iniciar sesión proporcionando su correo electrónico y contraseña.
 */

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const navigate = useNavigate();
  const URL = import.meta.env.VITE_BACKEND_URL;


  useEffect(() => {
    const checkAuthentication = async () => {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (accessToken) {
        navigate('/dashboard');
      }
    };

    checkAuthentication();
  }, []);

  const handleSaveCredentials = () => {
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
        `${URL}/api/v1/auth/login`,
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
  
      const { message, accessToken, refreshToken } = response.data;
  
      await AsyncStorage.setItem("accessToken", accessToken);
      await AsyncStorage.setItem("refreshToken", refreshToken);
  
  
      navigate('/dashboard');
  
      handleSaveCredentials();
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
        <img src="/img/unimentorIcon.png" alt="" />
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
