import Navbar from "../../../Components/Navbar/Navbar";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Swal from "sweetalert2";
import "./Monitores.css";

const Monitores = () => {
  const navigate = useNavigate();
  const [userss, setUserss] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupsMonitorEmpty, setGroupsMonitorEmpty] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState({});
  const [selectedGroups, setSelectedGroups] = useState({});
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
      const response = await axios.get(
        "http://192.168.118.231:3000/api/v1/avales/monitor"
      );

      setUserss(response.data);
    };

    handleShowUsers();
  }, []);

  useEffect(() => {
    const handleShowGroups = async () => {
      const response = await axios.get(
        "http://192.168.118.231:3000/api/v1/grupos/monitor"
      );

      setGroupsMonitorEmpty(response.data);
    };

    handleShowGroups();
  }, []);

  useEffect(() => {
    const handleShowGroups = async () => {
      const response = await axios.get(
        "http://192.168.118.231:3000/api/v1/grupos"
      );

      setGroups(response.data);
    };

    handleShowGroups();
  }, []);

  const handleButtonDenegar = async (index) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Estás intentando eliminar al monitor de su rol. Tendrá que volver a subir documentos",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar monitor",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      const sendEmail = async () => {
        const emailData = {
          to: userss[index].email,
          subject: "¡Has sido eliminado de la lista de monitores!",
          text: `Hola, ${userss[index].fullname}.\n\nHas sido eliminado de la lista de monitores. Si tienes alguna duda, por favor contacta a la coordinadora de UTC.\n\nSaludos,\nEquipo de UniMentor`,
        };

        try {
          const response = await axios.post(
            "http://192.168.118.231:3000/send-email-denied",
            emailData
          );
          console.log(response.data);
          console.log("Correo enviado correctamente");
        } catch (error) {
          console.error("Error al enviar el correo:", error);
        }
      };
      if (result.isConfirmed) {
        const avalId = userss[index].avalsData[0]._id;
        const userId = userss[index]._id;
        let groupId = "";
        let contadorGruposMonitor = 0;

        for (let i = 0; i < groups.length; i++) {
          if(groups[i].monitor ==  userId){
            groupId = groups[i]._id
            contadorGruposMonitor++;
          }
        }


        // const groupId = groups[index]._id;
        // console.log(groupId,'---------');



        //ESTOS ENDPOINTS SE DEBEN CORRER CUANDO EL MONITOR HAGA PARTE DE SOLO UN GRUPO

        if(contadorGruposMonitor === 1){
          const response = await axios.delete(
            "https://unimentor-fqz8.onrender.com/api/v1/avales/delete/" + avalId
          );

          const response2 = await axios.patch(
            'https://unimentor-fqz8.onrender.com/api/v1/users/update/' + userId,
            { role: "user" }
          );

          const response3 = await axios.patch(
            'https://unimentor-fqz8.onrender.com/api/v1/grupos/update/' + groupId,
            { monitor: "" }
          );

          if (response.status === 200 && response2.status === 200 && response3.status === 200) {
            sendEmail();
            Swal.fire({
              title: "Monitor Eliminado",
              text: "El monitor ha sido eliminado de la lista",
              icon: "success",
              confirmButtonText: "Aceptar",
            })
            .then(() => {
              window.location.reload();
            });
          }
        }else if(contadorGruposMonitor > 1){
          // EN CASO DE QUE EL MONITOR ESTÉ EN MUCHOS GRUPOS

          
        }

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: "Cancelado",
          text: "El monitor no ha sido eliminado de la lista.",
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
      <h1 className="tituloAval">Monitores</h1>
      <div className="filtro">
        <div className="inputFileAval">
          <h2 className="subtitulo">Búsqueda Filtrada</h2>
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
                          <a href={`http://192.168.118.231:3000/api/v1/uploads/${aval.promedio}`} target="_blank">
                            <p>{aval.promedio}</p>
                          </a>
                        </div>
                      ))}
                  </td>
                  <td>
                    {usuario.avalsData.map((aval, idx) => (
                      <div key={idx}>
                        <a href={`http://192.168.118.231:3000/api/v1/uploads/${aval.rut}`} target="_blank">
                          <p>{aval.rut}</p>
                        </a>
                      </div>
                    ))}
                  </td>
                  <td>
                    {usuario.avalsData.map((aval, idx) => (
                      <div key={idx}>
                        <a href={`http://192.168.118.231:3000/api/v1/uploads/${aval.certificado}`} target="_blank">
                          <p>{aval.certificado}</p>
                        </a>
                      </div>
                    ))}
                  </td>
                  <td>
                    <button
                      className="btn-denegar"
                      onClick={() => handleButtonDenegar(index)}
                    >
                      ELIMINAR
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

export default Monitores;

