import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";
import { useNavigate } from "react-router-dom";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

const Navbar = () => {
  const navigate = useNavigate();
  const [master, setMaster] = useState(false);
  const [user, setUser] = useState(false);
  const [teacher, setTeacher] = useState(false);
  const [monitor, setMonitor] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      const accessToken = await AsyncStorage.getItem("accessToken");
      const role = jwtDecode(accessToken).user.role;

      if(role === "master"){
        setMaster(true);
      }else if(role === "user"){
        setUser(true);
      }else if(role === "teacher"){
        setTeacher(true);
      }else if(role === "monitor"){
        setMonitor(true);
      }
    };

    checkRole();
  }, []);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");
      navigate("/");
    } catch (error) {
      console.error("Error al realizar el logout:", error);
    }
  };

  return (
    <nav>
      <Link className="title" to="/dashboard">UniMentor</Link>
      {/* {!master && (
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
      )} */}

      {master && (
        <ul>
          <li>
            <NavLink to="/Avales">Avales</NavLink>
          </li>
          <li>
            <NavLink to="/Monitores">Monitores</NavLink>
          </li>
          <li>
            <NavLink to="/Reportes">Reporte de Horas</NavLink>
          </li>
          <li>
            <button onClick={logout} className="button">Cerrar sesión</button>
          </li>
        </ul>
      )}

      {user && (
        <ul>
          <li>
            <NavLink to="/Avales">Avales</NavLink>
          </li>
          <li>
            <button onClick={logout} className="button">Cerrar sesión</button>
          </li>
        </ul>
      )}

      {monitor && (
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

      {teacher && (
        <ul>
          <li>
            <NavLink to="/RegistroHorasMonitores">Registro Horas Monitores</NavLink>
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
