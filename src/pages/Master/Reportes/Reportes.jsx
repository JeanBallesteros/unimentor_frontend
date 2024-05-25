import React, { useState, useEffect } from "react";
import Navbar from "../../../Components/Navbar/Navbar";
import "./Reportes.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import "react-datepicker/dist/react-datepicker.css";
import ExcelDownloader from "../../../Components/ExcelDownloader/ExcelDownloader";
import Loader from '../../../Components/Loader/Loader';


/**
 * Componente funcional para la gestión de reportes.
 * Este componente permite a los administradores descargar todos los registros de horas de cada uno de los monitores.
 */

const Reportes = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState({});
  const [months, setMonths] = useState([]);
  const [userId, setUserId] = useState();
  const [userMonths, setUserMonths] = useState({});
  const [hourLog, setHourLog] = useState({});
  const [price, setPrice] = useState("");
  const [pricePerHour, setPricePerHour] = useState([]);
  const [search, setSearch] = useState("");
  const [editable, setEditable] = useState(true);
  const [loading, setLoading] = useState(true);
  const URL = import.meta.env.VITE_BACKEND_URL;

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

  useEffect(() => {
    const showUsers = async () => {
      const response = await axios.get(
        `${URL}/api/v1/users/monitors`
      );

      setUsers(response.data);
      setLoading(false);
    };

    showUsers();
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

  const data = [
    { name: "John", age: 30 },
    { name: "Jane", age: 25 },
    { name: "Doe", age: 40 },
  ];

  useEffect(() => {
    const fetchUserMonths = async (userId) => {
      try {
        const response = await axios.get(
          `${URL}/api/v1/hourlog/monitormonth/${userId}`
        );

        const response2 = await axios.get(
          `${URL}/api/v1/hourlog/monitor/${userId}`
        );
        setHourLog(response2.data);
        // Actualizar el estado userMonths con los datos obtenidos para el usuario actual
        setUserMonths((prevUserMonths) => ({
          ...prevUserMonths,
          [userId]: response.data,
        }));

        setLoading(false);
      } catch (error) {
        console.error("Error al consultar el endpoint:", error);
      }
    };

    // Iterar sobre la lista de usuarios y realizar la consulta para cada uno
    users.forEach((user) => {
      fetchUserMonths(user._id); // Pasar el _id del usuario como parámetro
    });
  }, [users]);

  const handleMonthChange = (index, value) => {
    setSelectedMonths((prevState) => ({
      ...prevState,
      [index]: value,
    }));
  };

  const handlePriceChange = (e) => {
    setPrice(e.target.value);
  };

  const handlePricePerHourChange = (e) => {
    setPricePerHour(e.target.value);
  };

  const handleDefineClick = () => {
    setEditable(false);
  };

  const handleEditClick = () => {
    setEditable(true);
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

  const filteredUsers = users.filter((usuario) => {
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

  useEffect(() => {
    if (search !== "" && filteredUsers.length === 0) {
      showNoResultsAlert();
    }
  }, [search, filteredUsers]);

  useEffect(() => {
    const showPrice = async () => {
      const response = await axios.get(
        `${URL}/api/v1/reports`
      );
    
      setPricePerHour(response.data[0].pricePerHour);
      setLoading(false);
    };

    showPrice();
  }, []);


  return (
    <div className="fondoReportes">
      <Navbar />
      {loading ? (
        // Mostrar la pantalla de carga mientras loading sea true
        <div className='horasLoader'>
          <div className='containerHorasLoader'>
            <Loader />
          </div>
        </div>
      ) : (
        <div className="reportes">
          <h1 className="tituloAvales">Reporte de Horas</h1>
          <div className="filtroReportes">
            <h2 className="subtituloReportes">Busqueda Filtrada</h2>
            <div className="inputFileReportes">
              <div className="inputsReportes">
                <div className="labelsReportes">
                  <p>Documento</p>
                </div>
                <input
                  type="number"
                  name="monitorId"
                  id=""
                  placeholder="Buscar por documento"
                  onChange={(e) => setSearch(e.target.value)}
                  min={0}
                />
              </div>
              <div className="inputsReportes">
                <div className="labelsReportes">
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
          <div className="precioHoraContainer">
            <p className="subtituloReportes">Precio Hora: </p>
            <div className="precioHora">
              {
                !pricePerHour ? (
                  <input
                    className="inputPrecio"
                    type="number"
                    value={price}
                    onChange={handlePriceChange}
                    disabled={!editable}
                    min={0}
                  />
                ):(
                  <input
                    className="inputPrecio"
                    type="number"
                    value={pricePerHour}
                    onChange={handlePricePerHourChange}
                    disabled={!editable}
                    min={0}
                  />
                )
              }
            </div>
            <div className="botonesContainer">
              {editable ? (
                <button className="botonDefinir" onClick={handleDefineClick}>
                  Definir
                </button>
              ) : (
                <button className="botonEditar" onClick={handleEditClick}>
                  Editar
                </button>
              )}
            </div>
          </div>

          <div className="table-container-reportes">
            <table className="tablaReportes">
              <thead>
                <tr>
                  <th>Número de documento</th>
                  <th>Nombre completo</th>
                  {/* <th>Correo Institucional</th> */}
                  <th>Mes de Corte</th>
                  <th>Opciones</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter((usuario) => {
                    const documentNumber = (
                      usuario.documentNumber || ""
                    ).toString();
                    if (search === "") {
                      return true;
                    } else if (
                      documentNumber
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                      usuario.fullname
                        .toLowerCase()
                        .includes(search.toLowerCase())
                    ) {
                      return true;
                    } else {
                      return false;
                    }
                  })
                  .map((user) => (
                    <tr key={user._id}>
                      <td>{user.documentNumber}</td>
                      <td>{user.fullname}</td>
                      {/* <td>{user.email}</td> */}
                      <td>
                        <select
                          value={selectedMonths[user._id] || ""}
                          onChange={(e) =>
                            handleMonthChange(user._id, e.target.value)
                          }
                          required
                        >
                          <option value="">Selecciona un mes</option>
                          {userMonths[user._id] &&
                            userMonths[user._id].map((month, index) => (
                              <option key={index} value={month}>
                                {month}
                              </option>
                            ))}
                        </select>
                      </td>
                      <td>
                        <div>
                          {
                            !pricePerHour ? (
                              <ExcelDownloader
                                data={data}
                                fileName={
                                  "Reporte Horas " +
                                  user.fullname +
                                  " | " +
                                  selectedMonths[user._id]
                                }
                                usuario={user}
                                registro={hourLog}
                                month={selectedMonths[user._id]}
                                price={price}
                              />
                            ):(
                              <ExcelDownloader
                                data={data}
                                fileName={
                                  "Reporte Horas " +
                                  user.fullname +
                                  " | " +
                                  selectedMonths[user._id]
                                }
                                usuario={user}
                                registro={hourLog}
                                month={selectedMonths[user._id]}
                                price={pricePerHour}
                              />
                            )
                          }
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

export default Reportes;
