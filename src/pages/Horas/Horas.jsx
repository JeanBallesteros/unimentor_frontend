import React, { useState, useEffect } from 'react'
import Navbar from "../../Components/Navbar/Navbar";
import "./Horas.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { MdCheckCircle } from "react-icons/md";
import { MdCancel } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import moment from 'moment';
import Loader from '../../Components/Loader/Loader';

const Horas = () => {
  const navigate = useNavigate();
  const [asignatura, setAsignatura] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [horas, setHoras] = useState('');
  const [selectedGroups, setSelectedGroups] = useState({});
  const [groupsMonitor, setGroupsMonitor] = useState([]);
  const [hoursLogMonitor, setHoursLogMonitor] = useState([]);
  const [userss, setUserss] = useState([]);
  const [loading, setLoading] = useState(true);
  let urlPath = "192.168.0.15:3000";

  const primerDiaMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1);

  useEffect(() => {
    const checkAuthentication = async () => {
      const accessToken = await AsyncStorage.getItem("accessToken");
      if (!accessToken) {
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


  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await axios.get(
      `https://unimentor-fqz8.onrender.com/api/v1/grupos/${selectedGroups.name.split("-")[0]}`
    );

    console.log(response.data)


    const response2 = await axios.get(
      `https://unimentor-fqz8.onrender.com/api/v1/programas/asignatura/${response.data[0].subject[0]._id}`
    );

    console.log(response2.data.program._id)




    const response4 = await axios.get(
      `https://unimentor-fqz8.onrender.com/api/v1/hourlog/group/${response.data[0]._id}`
    );

    // console.log(response4.data.dates);
    const formattedDates = response4.data.dates.map(date => date.slice(0, 10));

    const formattedDate = fecha.toISOString().slice(0, 10);

    console.log(formattedDates);
    console.log(formattedDate.toString());

    if(formattedDates.includes(formattedDate.toString())){
      Swal.fire({
        title: "¡No se creó el registro!",
        text: "La fecha del registro ya está registrada.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }else{
      const response3 = await axios.post(
        `https://unimentor-fqz8.onrender.com/api/v1/hourlog/new-hourslog`, 
        { 
          program: response2.data.program._id, 
          subject: response.data[0].subject[0]._id, 
          group: response.data[0]._id, 
          teacher: response.data[0].teacher[0]._id, 
          monitor: response.data[0].monitor[0]._id, 
          date: fecha, 
          hours: horas 
        }

      );

      // console.log(response3);

      Swal.fire({
        title: "¡Registro creado con éxito!",
        text: "Ten en cuenta que una vez el profesor encargado haya confirmado tu registro, no podrás eliminarlo.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        window.location.reload();
      });

    }
    
    // Aquí capturas todos los valores del formulario
    const formData = {
      grupo: selectedGroups.name.split("-")[0],
      fecha: fecha,
      horas: horas
    };

    // Aquí puedes hacer lo que necesites con los datos del formulario
    console.log(formData);
  };

  useEffect(() => {
    const handleShowGroups = async () => {

      await new Promise(resolve => setTimeout(resolve, 2000));


      const accessToken = await AsyncStorage.getItem("accessToken");

      const decodedToken = jwtDecode(accessToken);
      const userId = decodedToken.user._id;
      console.log(userId);


      const response = await axios.get(
        `https://unimentor-fqz8.onrender.com/api/v1/grupos/monitor/${userId}`
      );

      setGroupsMonitor(response.data);
      setTimeout(() => {
        setLoading(false);
      }, 3000);
    };

    handleShowGroups();
  }, []);

  useEffect(() => {
    const handleShowHoursLog = async () => {

      await new Promise(resolve => setTimeout(resolve, 2000));


      const accessToken = await AsyncStorage.getItem("accessToken");

      const decodedToken = jwtDecode(accessToken);
      const userId = decodedToken.user._id;
      // console.log(userId);


      const response = await axios.get(
        `https://unimentor-fqz8.onrender.com/api/v1/hourlog/monitor/${userId}`
      );

      setHoursLogMonitor(response.data);

      setTimeout(() => {
        setLoading(false);
      }, 3000);
      // console.log(response.data[0].program[0].name);
      
    };

    handleShowHoursLog();
  }, []);

  const handleGroupChange = (index, value) => {
    setSelectedGroups(() => {
      const newState = {};
      newState["name"] = index; // Asignar el nuevo valor en la posición index

      // console.log(newState[index])

      // Obtener la parte antes del guion de value
      return newState; // Devolver el nuevo estado
    });
  };


  const handleButtonDenegar = async (index) => {
    Swal.fire({
      title: "¿Estás seguro/a?",
      text: "Estás intentando eliminar un registro de horas de tu propiedad. Tendrás que volver a registrarlo",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar registro",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        
        const hourLogId = hoursLogMonitor[index]._id

        // console.log(hourLogId);

        const response = await axios.delete(
          `https://unimentor-fqz8.onrender.com/api/v1/hourlog/delete/`+ hourLogId
        );

        if (response.status) {
          Swal.fire({
            title: "¡Registro Eliminado!",
            text: "El registro ha sido eliminado de la lista",
            icon: "success",
            confirmButtonText: "Aceptar",
          })
          .then(() => {
            window.location.reload();
          });
        }

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: "¡Cancelado!",
          text: "El registro no ha sido eliminado del grupo.",
          icon: "info",
          confirmButtonText: "Aceptar",
        });
      }
    });
  };

  return (
    <div className='fondo'>
      <Navbar/>
      {loading ? (
        // Mostrar la pantalla de carga mientras loading sea true
        <div className='horasLoader'>
          <div className='containerHorasLoader'>
            <Loader />
          </div>
        </div>
      ) : (
        // Mostrar los datos una vez que loading sea false
        <div className='horas'>
          {/* <img className='img1' src="src\assets\monitores1.png" alt="" /> */}
          {/* <div className='containerEmpty'></div> */}
          <div className='containerHoras'>
            <h1 className="titulo">Registro Horas</h1>
            <form onSubmit={handleSubmit}>
              <div className='inputsHoras'>
                <div className='labelsHoras'>
                  <label>Asignatura/Grupo:</label>
                </div>
                {/* <input
                  type="text"
                  value={asignatura}
                  onChange={(e) => setAsignatura(e.target.value)}
                /> */}

                {/* {userss.map((usuario, index) => ( */}
                <select
                  value={selectedGroups[0]}
                  onChange={(e) => handleGroupChange(e.target.value)}
                  required
                >
                  <option value="">Selecciona una asignatura</option>
                  {groupsMonitor.map((group) => (
                    group.subject.map((subject) => (
                      <option key={`${group._id}-${subject}`} value={`${group._id}-${subject}`}>
                        {`${subject.name} - ${group.name}`}
                      </option>
                    ))
                    
                  ))}
                </select>
                {/* ))} */}

              </div>
              <div className='inputsHoras'>
                <div className='labelsHoras'>
                  <label>Fecha:</label>
                </div>
                <DatePicker 
                  selected={fecha}
                  onChange={date => setFecha(date)}
                  dateFormat="dd/MM/yyyy"
                  minDate={primerDiaMes}
                  maxDate={new Date()}
                  
                />
              </div>
              <div className='inputsHoras'>
                <div className='labelsHoras'>
                  <label>Horas:</label>
                </div>
                <input
                  type="number"
                  required
                  value={horas}
                  onChange={(e) => setHoras(e.target.value)}
                  min={0}
                />
              </div>
              <div className="btn-submit">
                <button type="submit" className="btn">
                  Guardar
                </button>
              </div>

            </form>
          </div>
          <div className='table-container'>
            <table className="tablaHoras">
              <thead>
                <tr>
                  <th>Programa</th>
                  <th>Asignatura</th>
                  <th>Grupo</th>
                  <th>Docente a Cargo</th>
                  <th>Fecha</th>
                  <th>Cantidad de Horas</th>
                  <th>¿Aceptado?</th>
                  <th>Opciones</th>
                </tr>
              </thead>
              <tbody>
                {hoursLogMonitor
                  .map((hourlog, index) => (
                    <tr key={index}>
                      <td>{hourlog.program[0].name}</td>
                      <td>{hourlog.subject[0].name}</td>
                      <td>{hourlog.group[0].name}</td>
                      <td>{hourlog.teacher[0].fullname}</td>
                      <td>{hourlog.date.slice(0, 10)}</td>
                      <td>{hourlog.hours}</td>
                      <td>{hourlog.active ? "Sí" : "No"}</td>
                      <td>
                        <div className="btn-avales">
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
}

export default Horas