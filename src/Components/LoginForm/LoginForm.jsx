import React, { useState } from "react";
import { MdEmail } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import "./LoginForm.css";
import { useNavigate } from "react-router-dom";

// import axios from "axios";
// import qs from "qs";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function login() {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    const urlencoded = new URLSearchParams();
    urlencoded.append("email", email);
    urlencoded.append("current_password", password);

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow",
    };

    fetch("http://192.168.1.7:5000/api/v1/auth/login", requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.error(error));
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
