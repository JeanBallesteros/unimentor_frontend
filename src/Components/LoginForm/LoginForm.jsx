import React from "react";
import { MdEmail } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import "./LoginForm.css";

const LoginForm = () => {
  return (
    <div className="wrapper">
      <form action="">
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
          <input type="text" placeholder="Correo Institucional" />
          <MdEmail className="icon" />
        </div>

        <div className="input-box">
          <input type="password" placeholder="Contraseña" />
          <FaLock className="icon" />
        </div>

        <div className="remember">
          <label>
            <input type="checkbox" /> Recuerdame
          </label>
        </div>

        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
};

export default LoginForm;
