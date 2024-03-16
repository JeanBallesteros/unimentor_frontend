import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";
import { useNavigate } from "react-router-dom";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Navbar = () => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      // Eliminar el AccessToken y el RefreshToken de AsyncStorage
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");

      // Redirigir al usuario a la página de inicio de sesión o a cualquier otra página deseada
      navigate("/");
    } catch (error) {
      console.error("Error al realizar el logout:", error);
    }
  };


  return (
    <nav>
      <Link className="title" to="/dashboard">UniMentor</Link>
      <ul>
        <li>
          <NavLink to="/Documentacion">Documentación</NavLink>
        </li>
        <li>
          <NavLink to="/Horas">Registro Horas</NavLink>
        </li>
        <li>
          <button onClick={logout} className="button">Cerrar sesión</button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
