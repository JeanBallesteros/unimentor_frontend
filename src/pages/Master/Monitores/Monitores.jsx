import Navbar from "../../../Components/Navbar/Navbar";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Swal from "sweetalert2";
import "./Monitores.css";
import { MdDelete } from "react-icons/md";
import Loader from '../../../Components/Loader/Loader';

const Monitores = () => {
  const navigate = useNavigate();
  const [userss, setUserss] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupsMonitorEmpty, setGroupsMonitorEmpty] = useState([]);
  const [groupsMonitorNotEmpty, setGroupsMonitorNotEmpty] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState({});
  const [selectedGroups, setSelectedGroups] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    const handleShowUsers = async () => {
      const response = await axios.get(
        `https://unimentor-fqz8.onrender.com/api/v1/avales/monitor`
      );

      setUserss(response.data);
      setLoading(false);
    };

    handleShowUsers();
  }, []);

  useEffect(() => {
    const handleShowGroups = async () => {
      const response = await axios.get(
        `https://unimentor-fqz8.onrender.com/api/v1/grupos/monitorempty/c0d1g0`
      );

      setGroupsMonitorEmpty(response.data);
      setLoading(false);
    };

    handleShowGroups();
  }, []);

  useEffect(() => {
    const handleShowGroups = async () => {
      const response = await axios.get(
        `https://unimentor-fqz8.onrender.com/api/v1/grupos/monitornotempty/c0d1g0`
      );

      setGroupsMonitorNotEmpty(response.data);
      setLoading(false);
    };

    handleShowGroups();
  }, []);

  useEffect(() => {
    const handleShowGroups = async () => {
      const response = await axios.get(
        `https://unimentor-fqz8.onrender.com/api/v1/grupos`
      );

      setGroups(response.data);
      setLoading(false);
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
            `https://unimentor-fqz8.onrender.com/send-email-denied`,
            emailData
          );
          console.log(response.data);
          console.log("Correo enviado correctamente");
        } catch (error) {
          console.error("Error al enviar el correo:", error);
        }
      };
      if (result.isConfirmed) {
        // const avalId = userss[index].avalsData[0]._id;

        const avalId = userss.map((user) => {
          // return user.avalsData[0]._id
          if(user._id == groupsMonitorNotEmpty[index].monitor[0]._id){
            console.log("JAJAJA",user.avalsData[0]._id);
            return user.avalsData[0]._id;
            // return;
          }
        });

        const filteredArray = avalId.filter((element) => {
          return element !== undefined;
        });

        console.log("ffgh", filteredArray[0])

        const userId = groupsMonitorNotEmpty[index].monitor[0]._id;

        console.log("dfgdfg2",userId)


        console.log(groupsMonitorNotEmpty[index]);
        // const userId = userss[index]._id;
        // console.log(userId);
        let groupId = "";
        let contadorGruposMonitor = 0;

        for (let i = 0; i < groups.length; i++) {
          if(groups[i].monitor ==  userId){
            groupId = groups[i]._id
            contadorGruposMonitor++;
          }
        }

        // console.log(userId);


        // const groupId = groups[index]._id;
        // console.log(groupId,'---------');



        //ESTOS ENDPOINTS SE DEBEN CORRER CUANDO EL MONITOR HAGA PARTE DE SOLO UN GRUPO

        if(contadorGruposMonitor === 1){
          const response = await axios.delete(
            `https://unimentor-fqz8.onrender.com/api/v1/avales/delete/`+ filteredArray[0]
          );

          const response2 = await axios.patch(
            `https://unimentor-fqz8.onrender.com/api/v1/users/update/` + userId,
            { role: "user" }
          );

          const response3 = await axios.patch(
            `https://unimentor-fqz8.onrender.com/api/v1/grupos/updatetonull/` + groupId,
            { monitor: null }
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



          const response3 = await axios.patch(
            `https://unimentor-fqz8.onrender.com/api/v1/grupos/updatetonull/` + groupId,
            { monitor: null }
          );


          if (response3.status === 200) {
            sendEmail();
            Swal.fire({
              title: "Monitor Eliminado del Grupo",
              text: "El monitor ha sido eliminado de este grupo",
              icon: "success",
              confirmButtonText: "Aceptar",
            })
            .then(() => {
              window.location.reload();
            });
          }
          
        }

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: "Cancelado",
          text: "El monitor no ha sido eliminado del grupo.",
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
      document.querySelector('input[name="monitorEmail"]').value = "";
      document.querySelector('input[name="subjectName"]').value = "";
      document.querySelector('input[name="teacherName"]').value = "";
    });
  };

  const filteredUsers = groupsMonitorNotEmpty.filter((group) => {
    const documentNumber = (group.monitor[0].documentNumber || "").toString();
    if (search === "") {
      return true;
    } else if (
      documentNumber.toLowerCase().includes(search.toLowerCase()) ||
      group.monitor[0].fullname.toLowerCase().includes(search.toLowerCase()) ||
      group.monitor[0].email.toLowerCase().includes(search.toLowerCase()) ||
      group.subject[0].name.toLowerCase().includes(search.toLowerCase()) ||
      group.teacher[0].fullname.toLowerCase().includes(search.toLowerCase())) {
        return true;
    } else {
      return false;
    }
  });

  useEffect(() => {
    if (search !== "" && filteredUsers.length === 0) {
      showNoResultsAlert();
    }
  }, [search, filteredUsers]);

  return (
    <div className="fondoMonitor">
      <Navbar />
      {loading ? (
        // Mostrar la pantalla de carga mientras loading sea true
        <div className='horasLoader'>
          <div className='containerHorasLoader'>
            <Loader />
          </div>
        </div>
      ) : (
        <div className="monitor">
          <h1 className="tituloMonitor">Monitores</h1>
          <div className="filtroMonitor">
            <h2 className="subtituloMonitor">Búsqueda Filtrada</h2>
            <div className="inputFileMonitor">
              <div className="inputsMonitor">
                <div className="labelsMonitor">
                  <p>Documento</p>
                </div>
                <input
                  type="number"
                  name="monitorId"
                  id=""
                  placeholder="Por Documento"
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="inputsMonitor">
                <div className="labelsMonitor">
                  <p>Nombre</p>
                </div>
                <input
                  type="text"
                  name="monitorName"
                  id=""
                  placeholder="Por Nombre Monitor"
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {/* <div className="inputsMonitor">
                <div className="labelsMonitor">
                  <p>Correo</p>
                </div>
                <input
                  type="text"
                  name="monitorEmail"
                  id=""
                  placeholder="Por Correo"
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div> */}
              <div className="inputsMonitor">
                <div className="labelsMonitor">
                  <p>Asignatura</p>
                </div>
                <input
                  type="text"
                  name="subjectName"
                  id=""
                  placeholder="Por Asignatura"
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="inputsMonitor">
                <div className="labelsMonitor">
                  <p>Docente</p>
                </div>
                <input
                  type="text"
                  name="teacherName"
                  id=""
                  placeholder="Por Docente"
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="table-container-monitor">
            <table className="tablaMonitor">
              <thead>
                <tr>
                  <th>Número de documento</th>
                  <th>Nombre completo</th>
                  <th>Correo Institucional</th>
                  <th>Asignatura</th>
                  <th>Grupo</th>
                  <th>Docente</th>
                  <th>Opciones</th>
                </tr>
              </thead>
              <tbody>
                {groupsMonitorNotEmpty
                  .filter((group) => {

                    const documentNumber = (group.monitor[0].documentNumber || "").toString();

                    if (search === "") {
                      return true;
                    } else if (
                      documentNumber.toLowerCase().includes(search.toLowerCase()) ||
                      group.monitor[0].fullname.toLowerCase().includes(search.toLowerCase()) ||
                      group.monitor[0].email.toLowerCase().includes(search.toLowerCase()) ||
                      group.subject[0].name.toLowerCase().includes(search.toLowerCase()) ||
                      group.teacher[0].fullname.toLowerCase().includes(search.toLowerCase())) {
                        return true;
                    } else {
                      return false;
                    }

                  })
                  .map((groupsMonitor, index) => (
                    <tr key={index}>
                      <td>{groupsMonitor.monitor[0].documentNumber}</td>
                      <td>{groupsMonitor.monitor[0].fullname}</td>
                      <td>{groupsMonitor.monitor[0].email}</td>
                      <td>{groupsMonitor.subject[0].name}</td>
                      <td>{groupsMonitor.name}</td>
                      <td>{groupsMonitor.teacher[0].fullname}</td>
                      <td>
                        <div className="btn-monitores">
                          <button
                            className="btn-denegar-m"
                            onClick={() => handleButtonDenegar(index)}
                          >
                            <MdDelete className="icon" />
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

export default Monitores;

