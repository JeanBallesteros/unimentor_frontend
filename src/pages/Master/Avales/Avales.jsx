import Navbar from "../../../Components/Navbar/Navbar";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Swal from "sweetalert2";
import "./Avales.css";
import { MdCheckCircle } from "react-icons/md";
import { MdCancel } from "react-icons/md";

const Avales = () => {
  const navigate = useNavigate();
  const [userss, setUserss] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [groupsMonitorEmpty, setGroupsMonitorEmpty] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState({});
  const [selectedGroups, setSelectedGroups] = useState({});
  const [search, setSearch] = useState("");
  let urlPath = "192.168.0.15:3000";

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
      const response = await axios.get(`http://${urlPath}/api/v1/avales`);

      setUserss(response.data);
    };

    handleShowUsers();
  }, []);

  useEffect(() => {
    const handleShowSubjects = async () => {
      const response = await axios.get(
        "https://unimentor-fqz8.onrender.com/api/v1/asignaturas"
      );

      setSubjects(response.data);
    };

    handleShowSubjects();
  }, []);

  useEffect(() => {
    const handleShowGroups = async () => {
      const response = await axios.get(
        `http://${urlPath}/api/v1/grupos/monitorempty/c0d1g0`
      );

      
      setGroupsMonitorEmpty(response.data);
    };

    handleShowGroups();
  }, []);

  const handleButtonAceptar = async (index) => {


    if (!selectedGroups[index]) {
      Swal.fire({
        title: "Error",
        text: "Debes seleccionar una asignatura para aceptar el aval.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
      return;
    }


    const groupIdWithObject = selectedGroups[index];
    const groupId = groupIdWithObject.split("-")[0];
    const userId = userss[index]._id;

    console.log(groupId)

    // const userIdObjectId = new mongoose.Types.ObjectId(userId);

    const responsee = await axios.patch(
      `http://${urlPath}/api/v1/grupos/update/` + groupId,
      { monitor: userId }
    );

    console.log(responsee.data);

    const sendEmail = async () => {
      const emailData = {
        to: userss[index].email,
        subject: "¡Su aval ha sido aceptado!",
        text: `Hola ${userss[index].fullname},\n\nTu aval ha sido aceptado. ¡Bienvenido a UniMentor!\n\nSaludos,\nEquipo de Unimentor`,
      };

      try {
        const response = await axios.post(
          `http://${urlPath}/send-email-approved`,
          emailData
        );
        console.log(response.data);
        console.log("Correo enviado correctamente");
      } catch (error) {
        console.error("Error al enviar el correo:", error);
      }
    };

    const response = await axios.patch(
      'https://unimentor-fqz8.onrender.com/api/v1/users/update/' + userId,
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
            `https://${urlPath}/send-email-denied`,
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
          "https://unimentor-fqz8.onrender.com/api/v1/avales/delete/" + aval
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

  const handleGroupChange = (index, value) => {
    setSelectedGroups((prevState) => ({
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
        <h2 className="subtitulo">Búsqueda Filtrada de Avales</h2>
        <div className="inputFileAvales">
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
                          <a href={`http://${urlPath}/api/v1/uploads/${aval.promedio}`} target="_blank">
                            <p>{aval.promedio}</p>
                          </a>
                        </div>
                      ))}
                  </td>
                  <td>
                    {usuario.avalsData.map((aval, idx) => (
                      <div key={idx}>
                        <a href={`http://${urlPath}/api/v1/uploads/${aval.rut}`} target="_blank">
                          <p>{aval.rut}</p>
                        </a>
                      </div>
                    ))}
                  </td>
                  <td>
                    {usuario.avalsData.map((aval, idx) => (
                      <div key={idx}>
                        <a href={`http://${urlPath}/api/v1/uploads/${aval.certificado}`} target="_blank">
                          <p>{aval.certificado}</p>
                        </a>
                      </div>
                    ))}
                  </td>
                  <td>
                    <select
                      value={selectedGroups[index] || ""}
                      onChange={(e) =>
                        handleGroupChange(index, e.target.value)
                      }
                      required
                    >
                      <option value="">Selecciona una asignatura</option>
                      {groupsMonitorEmpty.map((group) => (
                        group.subject.map((subject) => (
                          <option key={`${group._id}-${subject}`} value={`${group._id}-${subject}`}>
                            {`${subject.name} - ${group.name}`}
                          </option>
                        ))
                      ))}
                    </select>
                  </td>
                  <td>
                    <div className="btn-avales">
                      <button
                        className="btn-aceptar-m"
                        onClick={() => handleButtonAceptar(index)}
                      >
                        <MdCheckCircle className="icon" />
                      </button>
                      <button
                        className="btn-denegar-m"
                        onClick={() => handleButtonDenegar(index)}
                      >
                        <MdCancel className="icon" />
                      </button>
                    </div>
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