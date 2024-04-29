import React, { useState, useEffect } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import "./Documentacion.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";


const Documentacion = () => {
  const navigate = useNavigate();
  const [checkDoc, setCheckDoc] = useState(false);
  const [hasCheckedDoc, setHasCheckedDoc] = useState(false);
  const [userss, setUserss] = useState([]);
  const [userId, setUserId] = useState();
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


  useEffect(() => {
    const checkDocumentation = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("accessToken");
        const refreshToken = await AsyncStorage.getItem("refreshToken");

        const decodedToken = jwtDecode(accessToken);
        const userId = decodedToken.user._id;
        console.log(userId);

        const response = await axios.get(
          `http://${urlPath}/api/v1/avales/user/${userId}`, 
        );

        console.log(response.data.message)

        if(response.data.aval){
          setCheckDoc(true)
          // console.log(response.data.aval)

          // console.log("dfdgh")
        }else{
          setCheckDoc(false)
        }
    
      } catch (error) {
        console.error("Error", error);
      }
    };

    checkDocumentation();
  }) 


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

  const [files, setFiles] = useState([null, null, null]);

  const handleFileChange = (event, index) => {
    const newFiles = [...files];
    newFiles[index] = event.target.files[0];
    setFiles(newFiles);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const formData = new FormData();

      files.forEach((file, index) => {
        if (file) {
          if (index + 1 === 1) {
            const newFileName = `promedio.${file.name.split(".").pop()}`;
            formData.append(
              `files`,
              new File([file], newFileName, { type: file.type })
            );
          } else if (index + 1 === 2) {
            const newFileName = `rut.${file.name.split(".").pop()}`;
            formData.append(
              `files`,
              new File([file], newFileName, { type: file.type })
            );
          } else {
            const newFileName = `certificado.${file.name.split(".").pop()}`;
            formData.append(
              `files`,
              new File([file], newFileName, { type: file.type })
            );
          }
        }
      });

      const accessTokenTemp = await AsyncStorage.getItem("accessToken");

      const id = jwtDecode(accessTokenTemp).user._id;

      const response = await axios.post(
        `http://${urlPath}/api/v1/avales/${id}`,
        formData
      );

      if (response.data.message === "Files uploaded successfully") {
        Swal.fire({
          title: "¡Documentos subidos con éxito!",
          text: "Espera a que sean revisados por el administrador.",
          icon: "success",
        });

        const inputs = document.querySelectorAll("input[type='file']");
        inputs.forEach((input) => {
          input.disabled = true;
        });

        const button = document.querySelector("button[type='submit']");
        button.disabled = true;

      }

      navigate("/");
    } catch (error) {
      Swal.fire({
        title: "¡Error al subir los documentos!",
        text: "Espera la autorización de tu aval",
        icon: "error",
      });
    }
  };

  useEffect(() => {
    const handleShowUsers = async () => {
      const response = await axios.get(`http://${urlPath}/api/v1/avales`);

      setUserss(response.data);
      console.log(response.data)

      const accessTokenTemp = await AsyncStorage.getItem("accessToken");
      setUserId(jwtDecode(accessTokenTemp).user._id);

      console.log(userId)
    };

    handleShowUsers();
  }, []);

  return (
    <div className="documentacion">
      <Navbar />
      {checkDoc && (
        // <div>
          <div className="container">
            <h1 className="titulo">Tus documentos:</h1>
            <hr />
            {/* <h3 className="subtitulo">Tus documentos:</h3> */}
              {userss.map((usuario, index) => (
                // <tr key={index}>
                //   <td>{usuario.documentNumber}</td>
                <div key={index}>
                  {usuario.avalsData.map((aval, idx) => (
                    <div>
                      {usuario._id === userId && (
                        <ul key={idx} className="listaAval">
                          <li>
                            <div className="uploads">
                              <div className="labelsUploads">
                                <p>RUT:</p>
                              </div>
                              <div className="docdiv">
                                <div className="doc">
                                  <a href={`http://${urlPath}/api/v1/uploads/${aval.rut}`} target="_blank">Ver</a>
                                </div>
                              </div>
                              
                            </div>
                          </li>
                          <li>
                            <div className="uploads">
                              <div className="labelsUploads">
                                <p>CERTIFICADO:</p>
                              </div>
                              <div className="docdiv">
                                <div className="doc">
                                  <a href={`http://${urlPath}/api/v1/uploads/${aval.certificado}`} target="_blank">Ver</a>
                                </div>
                              </div>
                            
                            </div>
                          </li>
                          <li>
                            <div className="uploads">
                              <div className="labelsUploads">
                                <p>PROMEDIO:</p>
                              </div>
                              <div className="docdiv">
                                <div className="doc">
                                  <a href={`http://${urlPath}/api/v1/uploads/${aval.promedio}`} target="_blank">Ver</a>
                                </div>
                              </div>
                        
                            </div>
                          </li>
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ))}
          </div>
        // </div>
      )}


      {!checkDoc && (
        <div>
          <div className="container">
            <h1 className="titulo">Documentación</h1>
            <hr />
            <form onSubmit={handleSubmit}>
              <div className="uploads">
                <label htmlFor="fileInput2" className="labelsUploads">
                  RUT:
                </label>
                <div className="inputFile">
                  <input
                    type="file"
                    id="fileInput2"
                    accept=".pdf"
                    required
                    onChange={(event) => handleFileChange(event, 1)}
                  />
                </div>
              </div>

              <div className="uploads">
                <label htmlFor="fileInput1" className="labelsUploads">
                  Promedio:{" "}
                </label>
                <div className="inputFile">
                  <input
                    type="file"
                    id="fileInput1"
                    accept="image/*"
                    required
                    onChange={(event) => handleFileChange(event, 0)}
                  />
                </div>
              </div>

              <div className="uploads">
                <label htmlFor="fileInput3" className="labelsUploads">
                  Certificado Bancario:
                </label>
                <div className="inputFile">
                  <input
                    type="file"
                    id="fileInput3"
                    accept=".pdf"
                    required
                    onChange={(event) => handleFileChange(event, 2)}
                  />
                </div>
              </div>

              <div className="btn-uploads">
                <button type="submit" className="btn">
                  Subir Documentos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documentacion;
