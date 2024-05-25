import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";
import { useNavigate } from "react-router-dom";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";


/**
 * Componente funcional que representa la barra de navegación de la aplicación.
 * Proporciona enlaces y opciones de navegación para diferentes roles de usuario.
 */

const Navbar = () => {
  const navigate = useNavigate();
  const [master, setMaster] = useState(false);
  const [user, setUser] = useState(false);
  const [teacher, setTeacher] = useState(false);
  const [monitor, setMonitor] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const removeTokens = async () => {
    try {
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");
    } catch (error) {
      console.error("Error al eliminar los tokens:", error);
    }
  };

  const logout = () => {
    try {
      Swal.fire({
        icon: "question",
        title: "¿Desea cerrar sesión?",
        showCancelButton: true,
        confirmButtonText: "Sí",
        cancelButtonText: "No",
      }).then((result) => {
        if (result.isConfirmed) {
          removeTokens();
          navigate("/");
        }
      });
    } catch (error) {
      console.error("Error al realizar el logout:", error);
    }
  };

  return (
    <nav>
      <div className="top-bar">
        <img src="/img/unimentorIcon.png" alt="" />
        <Link className="title" to="/dashboard">UniMentor</Link>
      </div>
      <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
        <div className={menuOpen ? 'menu-icon-line open' : 'menu-icon-line'}></div>
        <div className={menuOpen ? 'menu-icon-line open' : 'menu-icon-line'}></div>
        <div className={menuOpen ? 'menu-icon-line open' : 'menu-icon-line'}></div>
      </div>
      <ul className={menuOpen ? 'nav-links openn' : 'nav-links'}>
        {master && (
          <>
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
          </>
        )}

        {monitor && (
          <>
            <li>
              <NavLink to="/Documentacion">Documentación</NavLink>
            </li>
            <li>
              <NavLink to="/Horas">Registro Horas</NavLink>
            </li>
            <li>
              <button onClick={logout} className="button">Cerrar sesión</button>
            </li>
          </>
        )}

        {user && (
          <>
            <li>
              <NavLink to="/Documentacion">Documentación</NavLink>
            </li>
            <li>
              <button onClick={logout} className="button">Cerrar sesión</button>
            </li>
          </>
        )}

        {teacher && (
          <>
            <li>
              <NavLink to="/RegistroHorasMonitores">Registro Horas Monitores</NavLink>
            </li>
            <li>
              <button onClick={logout} className="button">Cerrar sesión</button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
