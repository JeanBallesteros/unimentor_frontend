import React, { useState, useEffect } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import "./RegistroHorasMonitores.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import "react-datepicker/dist/react-datepicker.css";
import { MdCheckCircle } from "react-icons/md";
import { MdCancel } from "react-icons/md";
import { MdDelete } from "react-icons/md";

const RegistroHorasMonitores = () => {
  const navigate = useNavigate();
  const [asignatura, setAsignatura] = useState("");
  const [fecha, setFecha] = useState(new Date());
  const [horas, setHoras] = useState("");
  const [selectedGroups, setSelectedGroups] = useState({});
  const [groupsMonitor, setGroupsMonitor] = useState([]);
  const [hoursLogMonitor, setHoursLogMonitor] = useState([]);
  const [hoursLogProfessor, setHoursLogProfessor] = useState([]);
  const [userss, setUserss] = useState([]);
  const [loading, setLoading] = useState(true);
  let urlPath = "192.168.0.15:3000";

  useEffect(() => {
    const checkAuthentication = async () => {
      const accessToken = await AsyncStorage.getItem("accessToken");
      const role = jwtDecode(accessToken).user.role;
      if (!accessToken || role != "teacher") {
        navigate("/");
      }
    };

    checkAuthentication();
  }, []);

  const handleRefreshToken = async (refreshToken) => {
    try {
      const response = await axios.post(
        "https://unimentor-fqz8.onrender.com/api/v1/auth/refresh-token",
        { refreshToken }
      );

      const newAccessToken = response.data.accessToken;
      await AsyncStorage.setItem("accessToken", newAccessToken);
    } catch (error) {
      console.error("Error al renovar el accessToken:", error);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");
    navigate("/");
  };

  useEffect(() => {
    const expireToken = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("accessToken");
        const refreshToken = await AsyncStorage.getItem("refreshToken");

        const decodedToken = jwtDecode(accessToken);
        const expiracion = decodedToken.exp * 1000;

        const ahora = Date.now();

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
              console.log("El usuario hizo clic en OK");
              handleRefreshToken(refreshToken);
            } else if (result.dismiss === Swal.DismissReason.cancel) {
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

    const intervalId = setInterval(expireToken, 20000);

    return () => clearInterval(intervalId);
  });

  useEffect(() => {
    const handleShowHoursLog = async () => {
      const accessToken = await AsyncStorage.getItem("accessToken");

      const decodedToken = jwtDecode(accessToken);
      const userId = decodedToken.user._id;

      const response = await axios.get(
        `https://unimentor-fqz8.onrender.com/api/v1/hourlog/teacher/${userId}`
      );
      setHoursLogProfessor(response.data);
    };

    handleShowHoursLog();
  }, []);

  const handleButtonAceptar = async (index) => {
    const accessToken = await AsyncStorage.getItem("accessToken");

    const decodedToken = jwtDecode(accessToken);
    const userId = decodedToken.user._id;
    console.log(userId);

    const hlog = hoursLogProfessor[index]._id;

    const response = await axios.patch(
      `https://unimentor-fqz8.onrender.com/api/v1/hourlog/update/` + hlog,
      { active: true }
    );

    if (response.status === 200) {
      Swal.fire({
        title: "¡Registro Aceptado!",
        text: `El registro de horas de ${
          hoursLogProfessor[index].monitor[0].fullname
        } en ${hoursLogProfessor[index].date.slice(0, 10)} ha sido aceptado.`,
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        window.location.reload();
      });
    }
  };

  const handleButtonDenegar = async (index) => {
    const accessToken = await AsyncStorage.getItem("accessToken");
    const decodedToken = jwtDecode(accessToken);
    const userId = decodedToken.user._id;
    console.log(userId);

    const hlog = hoursLogProfessor[index]._id;
    const response = await axios.patch(
      `https://unimentor-fqz8.onrender.com/api/v1/hourlog/update/` + hlog,
      { active: false }
    );

    if (response.status === 200) {
      Swal.fire({
        title: "¡Registro Neutralizado!",
        text: `El registro de horas de ${
          hoursLogProfessor[index].monitor[0].fullname
        } en ${hoursLogProfessor[index].date.slice(
          0,
          10
        )} ha sido neutralizado.`,
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        window.location.reload();
      });
    }
  };

  return (
    <div className="fondoTeacher">
      <Navbar />
      <div className="teacher">
        <h1 className="tituloRegistro">Verificar Registros de Horas</h1>
        <div className="table-container-teacher">
          <table className="tablaHoras">
            <thead>
              <tr>
                <th>Programa</th>
                <th>Asignatura</th>
                <th>Grupo</th>
                <th>Monitor</th>
                <th>Fecha</th>
                <th>Cantidad de Horas</th>
                <th>¿Aceptado?</th>
                <th>Opciones</th>
              </tr>
            </thead>
            <tbody>
              {hoursLogProfessor.map((hourlog, index) => (
                <tr key={index}>
                  <td>{hourlog.program[0].name}</td>
                  <td>{hourlog.subject[0].name}</td>
                  <td>{hourlog.group[0].name}</td>
                  <td>{hourlog.monitor[0].fullname}</td>
                  <td>{hourlog.date.slice(0, 10)}</td>
                  <td>{hourlog.hours}</td>
                  <td>{hourlog.active ? "Sí" : "No"}</td>
                  {hourlog.active ? (
                    <td>
                      <div className="btn-registroT">
                        <button
                          className="btn-denegar-t"
                          onClick={() => handleButtonDenegar(index)}
                        >
                          <MdCancel className="icon" />
                        </button>
                      </div>
                    </td>
                  ) : (
                    <td>
                      <div className="btn-registroT">
                        <button
                          className="btn-aceptar-t"
                          onClick={() => handleButtonAceptar(index)}
                        >
                          <MdCheckCircle className="icon" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RegistroHorasMonitores;
