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
import moment from 'moment';

// import es from './es.json';


const Horas = () => {
  const navigate = useNavigate();
  const [asignatura, setAsignatura] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [horas, setHoras] = useState('');
  const [selectedGroups, setSelectedGroups] = useState({});
  const [groupsMonitor, setGroupsMonitor] = useState([]);
  const [userss, setUserss] = useState([]);
  let urlPath = "192.168.0.15:3000";


  

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


  useEffect(() => {
    const loggedUser = async () => {

      const accessTokenTemp = await AsyncStorage.getItem("accessToken");
      const us = jwtDecode(accessTokenTemp).user;

      // console.log(user)

      setUserss(us);

      // console.log(userss);
    };

    loggedUser();
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();


    const response = await axios.get(
      `http://${urlPath}/api/v1/grupos/${selectedGroups.name.split("-")[0]}`
    );

    console.log(response.data)


    const response2 = await axios.get(
      `http://${urlPath}/api/v1/programas/asignatura/${response.data[0].subject[0]._id}`
    );

    console.log(response2.data.program._id)




    const response4 = await axios.get(
      `http://${urlPath}/api/v1/hourlog/group/${response.data[0]._id}`
    );

    // console.log(response4.data.dates);
    const formattedDates = response4.data.dates.map(date => date.slice(0, 10));

    const formattedDate = fecha.toISOString().slice(0, 10);

    console.log(formattedDates);
    console.log(formattedDate.toString());

    if(formattedDates.includes(formattedDate.toString())){
      // console.error("Error. No se creó el registro. La fecha coincide con una fecha anterior.");
      Swal.fire({
        title: "¡No se creó el registro!",
        text: "La fecha del registro ya está registrada.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }else{
      const response3 = await axios.post(
        `http://${urlPath}/api/v1/hourlog/new-hourslog`, 
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
      console.log(response3);
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
      const accessToken = await AsyncStorage.getItem("accessToken");

      const decodedToken = jwtDecode(accessToken);
      const userId = decodedToken.user._id;
      console.log(userId);


      const response = await axios.get(
        `http://${urlPath}/api/v1/grupos/monitor/${userId}`
      );

      setGroupsMonitor(response.data);
    };

    handleShowGroups();
  }, []);

  // const handleGroupChange = (index, value) => {
  //   setSelectedGroups((prevState) => ({
  //     ...prevState,
  //     [index]: value,
  //   }));
  // };

const handleGroupChange = (index, value) => {
  setSelectedGroups(() => {
    const newState = {};
    newState["name"] = index; // Asignar el nuevo valor en la posición index

    // console.log(newState[index])

    // Obtener la parte antes del guion de value
    return newState; // Devolver el nuevo estado
  });
};

  return (
    <div className='horas'>
      <Navbar />
      <div className='container'>
        <h1 className="titulo">Registro Horas</h1>
        <hr/>
        <form onSubmit={handleSubmit}>
          <div className='inputs'>
            <div className='labelsUploads'>
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
          <div className='inputs'>
            <div className='labelsUploads'>
              <label>Fecha:</label>
            </div>
            <DatePicker 
              selected={fecha}
              onChange={date => setFecha(date)}
              dateFormat="dd/MM/yyyy"
              // locale={es}
              maxDate={new Date()}
              // disabled="2023-04-28"
            />
          </div>
          <div className='inputs'>
            <div className='labelsUploads'>
              <label>Certificado:</label>
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
              Enviar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default Horas