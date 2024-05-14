import React, { useState, useEffect } from "react";
import Navbar from "../../../Components/Navbar/Navbar";
import "./Reportes.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import "react-datepicker/dist/react-datepicker.css";
import { MdCheckCircle } from "react-icons/md";
import { MdCancel } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import ExcelDownloader from '../../../Components/ExcelDownloader/ExcelDownloader';


const Reportes = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState({});
  const [months, setMonths] = useState([]);
  const [userId, setUserId] = useState();
  const [userMonths, setUserMonths] = useState({});
  const [hourLog, setHourLog] = useState({});
  const [price, setPrice] = useState('');

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
        const response = await axios.get(`https://unimentor-fqz8.onrender.com/api/v1/users/monitors`);
  
        setUsers(response.data);
      };
  
      showUsers();
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


    
  
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
        { name: 'Doe', age: 40 }
      ];


      useEffect(() => {
        const fetchUserMonths = async (userId) => {
          try {

            console.log(userId);
            const response = await axios.get(`https://unimentor-fqz8.onrender.com/api/v1/hourlog/monitormonth/${userId}`);
            // console.log(response.data);


            const response2 = await axios.get(`https://unimentor-fqz8.onrender.com/api/v1/hourlog/monitor/${userId}`);
            setHourLog(response2.data)
            // Actualizar el estado userMonths con los datos obtenidos para el usuario actual
            setUserMonths(prevUserMonths => ({
              ...prevUserMonths,
              [userId]: response.data
            }));
          } catch (error) {
            console.error("Error al consultar el endpoint:", error);
          }
        };
    
        // Iterar sobre la lista de usuarios y realizar la consulta para cada uno
        users.forEach(user => {
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



    return (
      <div className='fondoReportes'>
        <Navbar/>
          <div className='reportes'>
            {/* <div className='table-container'>
            </div> */}
            <input
              type="number"
              value={price}
              onChange={handlePriceChange}
              placeholder="Ingrese Precio de la hora"
            />
            <div className="table-container-reportes">
              <table className="tablaReportes">
                <thead>
                  <tr>
                    <th>Número de documento</th>
                    <th>Nombre completo</th>
                    <th>Correo Institucional</th>
                    <th>Mes</th>
                    <th>Opciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td>{user.documentNumber}</td>
                      <td>{user.fullname}</td>
                      <td>{user.email}</td>
                      <td>
                      <select
                        value={selectedMonths[user._id] || ""}
                        onChange={(e) => handleMonthChange(user._id, e.target.value)}
                        required
                      >
                        <option value="">Selecciona un mes</option>
                        {userMonths[user._id] && userMonths[user._id].map((month, index) => (
                          <option key={index} value={month}>
                            {month}
                          </option>
                        ))}
                      </select>
                      </td>
                      <td>
                        <div>
                          <ExcelDownloader data={data} fileName="reporte" usuario={user} registro={hourLog} month={selectedMonths[user._id]} price={price}/>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
      </div>
    );
  };

export default Reportes