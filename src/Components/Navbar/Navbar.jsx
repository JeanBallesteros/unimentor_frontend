import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";
import { useNavigate } from "react-router-dom";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";


const Navbar = () => {
  const navigate = useNavigate();
  const [master, setMaster] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      const accessToken = await AsyncStorage.getItem("accessToken");
      // const decodedToken = jwtDecode(accessToken);

      const role = jwtDecode(accessToken).user.role;

      if(role === "master"){
        setMaster(true);
      }
    };

    checkRole();
  }, []);

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
      {!master && (
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
      )}

      {master && (
        <ul>
          <li>
            <NavLink to="">Avales</NavLink>
          </li>
          <li>
            <NavLink to="">Monitores</NavLink>
          </li>
          <li>
            <NavLink to="">Reporte de Horas</NavLink>
          </li>
          <li>
            <button onClick={logout} className="button">Cerrar sesión</button>
          </li>
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
