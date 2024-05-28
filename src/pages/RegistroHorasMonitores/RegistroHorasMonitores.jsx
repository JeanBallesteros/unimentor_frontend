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
import Loader from '../../Components/Loader/Loader';


// Componente principal para registrar y verificar horas de monitores

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
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [activeCheckbox, setActiveCheckbox] = useState(false);
  const [active, setActive] = useState(false);
  const [igual, setIgual] = useState(false);
  const [numTemp, setNumTemp] = useState();
  // const [arrayIndices, setArrayIndices] = useState([]);
  
  const URL = import.meta.env.VITE_BACKEND_URL;
  

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

    const intervalId = setInterval(expireToken, 320000);

    return () => clearInterval(intervalId);
  });

  useEffect(() => {
    const handleShowHoursLog = async () => {
      const accessToken = await AsyncStorage.getItem("accessToken");

      const decodedToken = jwtDecode(accessToken);
      const userId = decodedToken.user._id;

      const response = await axios.get(
        `${URL}/api/v1/hourlog/teacher/${userId}`
      );
      setHoursLogProfessor(response.data);
      setLoading(false);
    };

    handleShowHoursLog();
  }, []);

  const handleButtonAceptar = async (index) => {
    const accessToken = await AsyncStorage.getItem("accessToken");

    const decodedToken = jwtDecode(accessToken);
    const userId = decodedToken.user._id;

    const hlog = hoursLogProfessor[index]._id;

    const response = await axios.patch(
      `${URL}/api/v1/hourlog/update/` + hlog,
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

  const handleButtonAceptarM = async (index) => {
    const accessToken = await AsyncStorage.getItem("accessToken");

    const decodedToken = jwtDecode(accessToken);
    const userId = decodedToken.user._id;

    const hlog = hoursLogProfessor[index]._id;

    const response = await axios.patch(
      `${URL}/api/v1/hourlog/update/` + hlog,
      { active: false }
    );
  };

  const handleButtonDenegar = async (index) => {
    const accessToken = await AsyncStorage.getItem("accessToken");
    const decodedToken = jwtDecode(accessToken);
    const userId = decodedToken.user._id;

    const hlog = hoursLogProfessor[index]._id;
    const response = await axios.patch(
      `${URL}/api/v1/hourlog/update/` + hlog,
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
        )} ha sido denegado.`,
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        window.location.reload();
      });
    }
  };

  const handleButtonDenegarM = async (index) => {
    const accessToken = await AsyncStorage.getItem("accessToken");
    const decodedToken = jwtDecode(accessToken);
    const userId = decodedToken.user._id;

    const hlog = hoursLogProfessor[index]._id;

    const response = await axios.patch(
      `${URL}/api/v1/hourlog/update/` + hlog,
      { active: true }
    );
  };


  const showNoResultsAlert = () => {
    Swal.fire({
      title: "No se encontraron resultados",
      text: "Por favor, intenta con otros criterios de búsqueda.",
      icon: "info",
      confirmButtonText: "Aceptar",
    }).then(() => {
      setSearch("");
      document.querySelector('input[name="monitorDate"]').value = "";
      document.querySelector('input[name="monitorName"]').value = "";
    });
  };

  const filteredUsers = hoursLogProfessor.filter((hourlog) => {
    const date = (hourlog.date.slice(0, 10) || "").toString();
    if (search === "") {
      return true;
    } else if (
      date.toLowerCase().includes(search.toLowerCase()) ||
      hourlog.monitor[0].fullname.toLowerCase().includes(search.toLowerCase())
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


  const handleCheckboxChange = (index, num) => {
    let arrayIndices = new Array();
    arrayIndices.push(index)

    for (let i = 0; i < 1; i++) {
      if(selectedIndices[i] === arrayIndices[i]){
        setActiveCheckbox(false);
        if(num === 2){
          setActive(false);
        }
        setNumTemp(0);
      }else if(arrayIndices.length > 0){
        setActiveCheckbox(true);
        if(num === 2){
          setActive(true);
        }
        setNumTemp(num);
      }
    }

    if(selectedIndices.length !== arrayIndices.length){
      setActiveCheckbox(true);
      if(num === 2){
        setActive(true);
      }
      setNumTemp(num);
    }


    setSelectedIndices((prevSelected) => {
      if (prevSelected.includes(index)) {
        return prevSelected.filter((i) => i !== index);
      } else {
        return [...prevSelected, index];
      }
    });
  };


  const handleProcessSelectedA = async () => {
    Swal.fire({
      title: "¿Quieres Aceptar estos Registros?",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Sí, aceptar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Itera sobre los índices seleccionados
        for (const index of selectedIndices) {
          await handleButtonAceptarM(index);
        }


        window.location.reload();

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: "¡Cancelado!",
          text: "Los registros seleccionados no han sido aceptados",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      }
    })
  };

  const handleProcessSelectedN = async () => {
    Swal.fire({
      title: "¿Quieres Denegar estos Registros?",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Sí, denegar",
      cancelButtonText: "Cancelar",
    }).then( async (result) => {
      if (result.isConfirmed) {
        // Itera sobre los índices seleccionados
        for (const index of selectedIndices) {
          await handleButtonDenegarM(index);
        }


        window.location.reload();

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: "¡Cancelado!",
          text: "Los registros seleccionados no han sido aceptados",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      }
    })
  }

    



  return (
    <div className="fondoTeacher">
      <Navbar />
      {loading ? (
        // Mostrar la pantalla de carga mientras loading sea true
        <div className='horasLoader'>
          <div className='containerHorasLoader'>
            <Loader />
          </div>
        </div>
      ) : (
        <div className="teacher">
          <div className="containerTeacher">
            <h1 className="tituloTeacher">Verificar Registro de Horas</h1>
            <div className="filtroTeacher">
              <h2 className="subtituloTeacher">Búsqueda Filtrada de Registro de Horas</h2>
              <div className="inputFileTeacher">
                <div className="inputsTeacher">
                  <div className="labelsTeacher">
                    <p>Fecha</p>
                  </div>
                  <input
                    type="text"
                    name="monitorDate"
                    id=""
                    placeholder="Buscar por fecha"
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="inputsTeacher">
                  <div className="labelsTeacher">
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
                  <th>Seleccionar</th> 
                </tr>
              </thead>
              <tbody>
                {hoursLogProfessor.filter((hourlog) => {
                      const date = (
                        hourlog.date.slice(0, 10) || ""
                      ).toString();
                      if (search === "") {
                        return true;
                      } else if (
                        date.toLowerCase().includes(search.toLowerCase()) ||
                        hourlog.monitor[0].fullname.toLowerCase().includes(search.toLowerCase())
                      ) {
                        return true;
                      } else {
                        return false;
                      }
                    }).map((hourlog, index) => (
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
                    {activeCheckbox ? (
                      active ? (
                        hourlog.active ? (
                          <td>
                            <input
                              disabled
                              type="checkbox"
                              checked={selectedIndices.includes(index)}
                              onChange={() => handleCheckboxChange(index, 1)}
                            />
                          </td>
                        ) : (
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedIndices.includes(index)}
                              onChange={() => handleCheckboxChange(index, 2)}
                            />
                          </td>
                        )
                      ) : (
                        hourlog.active ? (
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedIndices.includes(index)}
                              onChange={() => handleCheckboxChange(index, 1)}
                            />
                          </td>
                        ) : (
                          <td>
                            <input
                              disabled
                              type="checkbox"
                              checked={selectedIndices.includes(index)}
                              onChange={() => handleCheckboxChange(index, 2)}
                            />
                          </td>
                        )
                      )
                    ):(
                      hourlog.active ? (
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedIndices.includes(index)}
                            onChange={() => handleCheckboxChange(index, 1)}
                          />
                        </td>
                      ) : (
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedIndices.includes(index)}
                            onChange={() => handleCheckboxChange(index, 2)}
                          />
                        </td>
                      )
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="botonesRegistro">
            <>
              {numTemp === 1 ? (
                <div className="button-container-A" color="red">
                  <button onClick={handleProcessSelectedA}>Denegar Seleccionados</button>
                </div>
              ) : numTemp === 2 ? (
                <div className="button-container-N" color="blue">
                  <button onClick={handleProcessSelectedN}>Aceptar Seleccionados</button>
                </div>
              ): null}
            </>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistroHorasMonitores;
