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
import Loader from '../../../Components/Loader/Loader';


/**
 * Componente funcional para la gestión de avales.
 * Este componente permite a los administradores del sistema gestionar los avales de monitores.
 */

const Avales = () => {
  const navigate = useNavigate();
  const [userss, setUserss] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [groupsMonitorEmpty, setGroupsMonitorEmpty] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState({});
  const [selectedGroups, setSelectedGroups] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const URL = import.meta.env.VITE_BACKEND_URL;

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
    try {
      const response = await axios.post(
        `${URL}/api/v1/auth/refresh-token`,
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
    const handleShowUsers = async () => {
      const response = await axios.get(`${URL}/api/v1/avales`);

      setUserss(response.data);

      setLoading(false);
    };

    handleShowUsers();

  }, []);

  useEffect(() => {
    const handleShowSubjects = async () => {
      setLoading(true);
      const response = await axios.get(
        `${URL}/api/v1/asignaturas`
      );

      setSubjects(response.data);

      setLoading(false);
    };

    handleShowSubjects();
  }, []);

  useEffect(() => {
    const handleShowGroups = async () => {
      setLoading(true);
      const response = await axios.get(
        `${URL}/api/v1/grupos/monitorempty/c0d1g0`
      );

      
      setGroupsMonitorEmpty(response.data);
      setLoading(false);
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
    
    const responsee = await axios.patch(
      `${URL}/api/v1/grupos/update/` + groupId,
      { monitor: userId }
    );

    const sendEmail = async () => {
      const emailData = {
        to: userss[index].email,
        subject: "¡Su aval ha sido aceptado!",
        text: `Hola ${userss[index].fullname},\n\nTu aval ha sido aceptado. ¡Bienvenido a UniMentor!\n\nSaludos,\nEquipo de Unimentor`,
      };

      try {
        const response = await axios.post(
          `${URL}/send-email-approved`,
          emailData
        );
        console.log("Correo enviado correctamente");
      } catch (error) {
        console.error("Error al enviar el correo:", error);
      }
    };

    const response = await axios.patch(
      `${URL}/api/v1/users/update/` + userId,
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
          console.log("Correo enviado correctamente");
        } catch (error) {
          console.error("Error al enviar el correo:", error);
        }
      };
      if (result.isConfirmed) {
        const aval = userss[index].avalsData[0]._id;
        const response = await axios.delete(
          `${URL}/api/v1/avales/delete/` + aval
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

  const mostrarImagen = (imagenBase64) => {
    Swal.fire({
      title: `<img width="300px" src="data:image;base64,${imagenBase64}" />`,
      showClass: {
        popup: `
          animate__animated
          animate__fadeInUp
          animate__faster
        `
      },
      hideClass: {
        popup: `
          animate__animated
          animate__fadeOutDown
          animate__faster
        `
      }
    });
  };

  const mostrarPdf = (pdfBase64) => {
    Swal.fire({
      title: `<embed src="data:application/pdf;base64,${pdfBase64}" type="application/pdf" width="100%" height="500px"/>`,
      showClass: {
        popup: `
          animate__animated
          animate__fadeInUp
          animate__faster
        `
      },
      hideClass: {
        popup: `
          animate__animated
          animate__fadeOutDown
          animate__faster
        `
      }
    });
  };

  return (
    <div className="fondoAvales">
      <Navbar />
      {loading ? (
        // Mostrar la pantalla de carga mientras loading sea true
        <div className='horasLoader'>
          <div className='containerHorasLoader'>
            <Loader />
          </div>
        </div>
      ) : (
        <div className="avales">
          <div className="containerAvales">
            <h1 className="tituloAvales">Avales</h1>
            <div className="filtroAvales">
              <h2 className="subtituloAvales">Búsqueda Filtrada</h2>
              <div className="inputFileAvales">
                <div className="inputsAvales">
                  <div className="labelsAvales">
                    <p>Documento</p>
                  </div>
                  <input
                    type="number"
                    name="monitorId"
                    id=""
                    placeholder="Buscar por documento"
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="inputsAvales">
                  <div className="labelsAvales">
                    <p>Nombre</p>
                  </div>
                  <input
                    type="text"
                    name="monitorName"
                    id=""
                    placeholder="Buscar por nombre"
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="table-container-avales">
              <table className="tablaAvales">
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
                                <a  
                                  style={{ cursor: 'pointer', color: 'blue' }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    mostrarImagen(aval.promedio);
                                  }}
                                >
                                  <p>Ver </p>
                                </a>
                              </div>
                            ))}
                        </td>
                        <td>
                          {usuario.avalsData.map((aval, idx) => (
                            <div key={idx}>
                              <a  
                                style={{ cursor: 'pointer', color: 'blue' }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  mostrarPdf(aval.rut);
                                }}
                              >
                                <p>Ver </p>
                              </a>
                            </div>
                          ))}
                        </td>
                        <td>
                          {usuario.avalsData.map((aval, idx) => (
                            <div key={idx}>
                              <a  
                                style={{ cursor: 'pointer', color: 'blue' }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  mostrarPdf(aval.certificado);
                                }}
                              >
                                <p>Ver </p>
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
      )}
    </div>
  );
};

export default Avales;