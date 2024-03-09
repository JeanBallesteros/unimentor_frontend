import React, { useState } from "react";
import { MdEmail } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import "./LoginForm.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// import qs from "qs";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function login() {
    try {
      const response = await axios.post(
        'http://192.168.0.25:3000/api/v1/auth/login',
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
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="wrapper">
      <div className="header">
        <img src="src\Components\assets\unimentor_icon.png" alt="" />
        <div className="header_titles">
          <h1>UniMentor</h1>
          <p>Llevando la Claridad a Cada Sesión de Estudio</p>
        </div>
      </div>

      <div className="login">
        <h2>INICIA SESION</h2>
      </div>

      <div className="input-box">
        <input
          type="text"
          placeholder="Correo Institucional"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <MdEmail className="icon" />
      </div>

      <div className="input-box">
        <input
          type="password"
          placeholder="Contraseña"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <FaLock className="icon" />
      </div>

      <div className="remember">
        <label>
          <input type="checkbox" /> Recuerdame
        </label>
      </div>

      <button onClick={login}>Ingresar</button>
    </div>
  );
};

export default LoginForm;
