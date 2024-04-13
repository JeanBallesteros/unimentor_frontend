import Navbar from "../../../Components/Navbar/Navbar";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Swal from "sweetalert2";
import "./Avales.css";

const Avales = () => {
  const navigate = useNavigate();
  const [userss, setUserss] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Verificar si el usuario está autenticado y si es master
    const checkAuthentication = async () => {
      const accessToken = await AsyncStorage.getItem("accessToken");
      const role = jwtDecode(accessToken).user.role;
      if (!accessToken || role != "master") {
        navigate("/");
      }
    };

    checkAuthentication();
  }, []);

  const handleRefreshToken = async (refreshToken) => {
    // Renovar el accessToken
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
    // Cerrar sesión
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");
    navigate("/");
  };

  useEffect(() => {
    // Verificar si el accessToken ha expirado
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
    const handleShowUsers = async () => {
      const response = await axios.get("http://192.168.1.1:3000/api/v1/avales");

      setUserss(response.data);
    };

    handleShowUsers();
  }, []);

  useEffect(() => {
    const handleShowSubjects = async () => {
      const response = await axios.get(
        "http://192.168.1.1:3000/api/v1/asignaturas"
      );

      setSubjects(response.data);
    };

    handleShowSubjects();
  }, []);

  const handleButtonAceptar = async (index) => {
    const subjectId = selectedSubjects[index];
    const userId = userss[index]._id;

    if (!subjectId) {
      Swal.fire({
        title: "Error",
        text: "Debes seleccionar una asignatura para aceptar el aval.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    const sendEmail = async () => {
      const emailData = {
        to: userss[index].email,
        subject: "Aval Aceptado",
        text: `Hola ${userss[index].fullname},\n\nTu aval ha sido aceptado. ¡Bienvenido a UniMentor!\n\nSaludos,\nEquipo de Unimentor`,
      };

      try {
        const response = await axios.post(
          "http://192.168.1.1:3000/send-email-approved",
          emailData
        );
        console.log(response.data);
        console.log("Correo enviado correctamente");
      } catch (error) {
        console.error("Error al enviar el correo:", error);
      }
    };

    const response = await axios.patch(
      'http://192.168.1.1:3000/api/v1/users/update/' + userId,
      { role: "monitor" }
    );

    if (response.status === 200) {
      sendEmail();
      Swal.fire({
        title: "Aval aceptado",
        text: "El aval ha sido aceptado correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      })
      .then(() => {
        window.location.reload();
      });
    }
  };

  const handleButtonDenegar = async (index) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Una vez denegado, no se podrá recuperar el aval.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar el aval",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      const sendEmail = async () => {
        const emailData = {
          to: userss[index].email,
          subject: "Aval denegado",
          text: `Hola ${userss[index].fullname},\n\nTu aval ha sido denegado. Si tienes alguna duda, por favor contacta a la coordinadora de UTC.\n\nSaludos,\nEquipo de Unimentor`,
        };

        try {
          const response = await axios.post(
            "http://192.168.1.1:3000/send-email-denied",
            emailData
          );
          console.log(response.data);
          console.log("Correo enviado correctamente");
        } catch (error) {
          console.error("Error al enviar el correo:", error);
        }
      };
      if (result.isConfirmed) {
        const aval = userss[index].avalsData[0]._id;
        const response = await axios.delete(
          "http://192.168.1.1:3000/api/v1/avales/delete/" + aval
        );
        if (response.status === 200) {
          sendEmail();
          Swal.fire({
            title: "Aval eliminado",
            text: "El aval ha sido eliminado correctamente.",
            icon: "success",
            confirmButtonText: "Aceptar",
          })
          .then(() => {
            window.location.reload();
          });
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: "Cancelado",
          text: "El aval no ha sido eliminado.",
          icon: "info",
          confirmButtonText: "Aceptar",
        });
      }
    });
  };

  const handleSubjectChange = (index, value) => {
    setSelectedSubjects((prevState) => ({
      ...prevState,
      [index]: value,
    }));
  };

  const showNoResultsAlert = () => {
    Swal.fire({
      title: "No se encontraron resultados",
      text: "Por favor, intenta con otros criterios de búsqueda.",
      icon: "info",
      confirmButtonText: "Aceptar",
    }).then(() => {
      setSearch("");
      document.querySelector('input[name="monitorId"]').value = "";
      document.querySelector('input[name="monitorName"]').value = "";
    });
  };

  const filteredUsers = userss.filter((usuario) => {
    const documentNumber = (usuario.documentNumber || "").toString();
    if (search === "") {
      return true;
    } else if (
      documentNumber.toLowerCase().includes(search.toLowerCase()) ||
      usuario.fullname.toLowerCase().includes(search.toLowerCase())
    ) {
      return true;
    } else {
      return false;
    }
  });

  // Mostrar la alerta si no hay resultados
  useEffect(() => {
    if (search !== "" && filteredUsers.length === 0) {
      showNoResultsAlert();
    }
  }, [search, filteredUsers]);

  return (
    <div className="monitor">
      <Navbar />
      <h1 className="tituloAval">Avales</h1>
      <div className="filtro">
        <div className="inputFileAval">
          <h2 className="subtitulo">Busqueda Filtrada</h2>
          <input
            type="number"
            name="monitorId"
            id=""
            placeholder="Buscar por documento"
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            type="text"
            name="monitorName"
            id=""
            placeholder="Buscar por nombre"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div>
        <table className="tabla">
          <thead>
            <tr>
              <th>Número de documento</th>
              <th>Nombre completo</th>
              <th>Promedio</th>
              <th>RUT</th>
              <th>Certificado</th>
              <th>Asignatura</th>
              <th>Opciones</th>
            </tr>
          </thead>
          <tbody>
            {userss
              .filter((usuario) => {
                const documentNumber = (
                  usuario.documentNumber || ""
                ).toString();
                if (search === "") {
                  return true;
                } else if (
                  documentNumber.toLowerCase().includes(search.toLowerCase()) ||
                  usuario.fullname.toLowerCase().includes(search.toLowerCase())
                ) {
                  return true;
                } else {
                  return false;
                }
              })
              .map((usuario, index) => (
                <tr key={index}>
                  <td>{usuario.documentNumber}</td>
                  <td>{usuario.fullname}</td>
                  <td>
                    {usuario.avalsData.map((aval, idx) => (
                      <div key={idx}>
                        <p>{aval.promedio}</p>
                      </div>
                    ))}
                  </td>
                  <td>
                    {usuario.avalsData.map((aval, idx) => (
                      <div key={idx}>
                        <p>{aval.rut}</p>
                      </div>
                    ))}
                  </td>
                  <td>
                    {usuario.avalsData.map((aval, idx) => (
                      <div key={idx}>
                        <p>{aval.certificado}</p>
                      </div>
                    ))}
                  </td>
                  <td>
                    <select
                      value={selectedSubjects[index] || ""}
                      onChange={(e) =>
                        handleSubjectChange(index, e.target.value)
                      }
                    >
                      <option value="">Selecciona una asignatura</option>
                      {subjects.map((subject) => (
                        <option key={subject._id} value={subject._id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      className="btn-aceptar"
                      onClick={() => handleButtonAceptar(index)}
                    >
                      ACEPTAR
                    </button>
                    <button
                      className="btn-denegar"
                      onClick={() => handleButtonDenegar(index)}
                    >
                      DENEGAR
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Avales;
