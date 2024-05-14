import React, { useState, useEffect } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import "./Documentacion.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import Loader from '../../Components/Loader/Loader';

const Documentacion = () => {
  const navigate = useNavigate();
  const [checkDoc, setCheckDoc] = useState(false);
  const [hasCheckedDoc, setHasCheckedDoc] = useState(false);
  const [userss, setUserss] = useState([]);
  const [userId, setUserId] = useState();
  const [loading, setLoading] = useState(true);
  const URL = import.meta.env.VITE_BACKEND_URL;

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

        // await new Promise(resolve => setTimeout(resolve, 50));

        const response = await axios.get(
          `${URL}/api/v1/avales/user/${userId}`, 
        );

        console.log(response.data.message)

        if(response.data.message === "userId presente"){
          setCheckDoc(true)
        }else{
          setCheckDoc(false)
        }

        // setTimeout(() => {
          setLoading(false);
        // }, 50);
    
      } catch (error) {
        console.error("Error", error);
      }
    };

    checkDocumentation();
  }) 


  const handleRefreshToken = async (refreshToken) => {
    try {
      const response = await axios.post(
        "${URL}/api/v1/auth/refresh-token",
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

        const accessToken = await AsyncStorage.getItem("accessToken");

        const decodedToken = jwtDecode(accessToken);
        const userId = decodedToken.user._id;
        const document = decodedToken.user.documentNumber;

        let base64Promedio;
        let base64Rut;
        let base64Certificado;

        for (let index = 0; index < files.length; index++) {
            const file = files[index];

            if (file) {
                const reader = new FileReader();
                const readPromise = new Promise((resolve, reject) => {
                    reader.onload = () => {
                        resolve(reader.result);
                    };
                    reader.onerror = reject;
                });

                reader.readAsBinaryString(file);
                const base64Data = await readPromise;

                if (index === 0) {
                  base64Promedio = btoa(base64Data)
                } else if (index === 1) {
                  base64Rut = btoa(base64Data)
                } else {
                  base64Certificado = btoa(base64Data)
                }
            }

        }

        // console.log(response.data);

        const response = await axios.post(`${URL}/api/v1/avales/new-aval`, {
          idUsuario: userId, 
          promedio: base64Promedio,
          rut: base64Rut,
          certificado: base64Certificado 
        });

        console.log(response.data);

        if (response.data.message === "Aval creado") {
            Swal.fire({
                title: "¡Documentos subidos con éxito!",
                text: "Espera la autorización de tu aval",
                icon: "success",
            }).then(() => {
              navigate("/");
            });
        }
    } catch (error) {
        console.error("Error al subir los documentos:", error);
        Swal.fire({
            title: "¡Error al subir los documentos!",
            text: "Espera la autorización de tu aval",
            icon: "error",
        });
    }
};

  useEffect(() => {
    const handleShowUsers = async () => {
      const response = await axios.get(`${URL}/api/v1/avales`);

      setUserss(response.data);
      console.log(response.data)

      const accessTokenTemp = await AsyncStorage.getItem("accessToken");
      setUserId(jwtDecode(accessTokenTemp).user._id);

      console.log(userId)
    };

    handleShowUsers();
  }, []);

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
    <div className='fondoDocumentacion'>
      <Navbar />
      {loading ? (
        // Mostrar la pantalla de carga mientras loading sea true
        <div className='horasLoader'>
          <div className='containerHorasLoader'>
            <Loader />
          </div>
        </div>
      ) : (
        <div className="documentacion">
          {checkDoc && (
              <div className="containerDocumentacionOk">
                <h1 className="tituloDocumentacion">Mis documentos</h1>
                <hr />
                  {userss.map((usuario, index) => (
                    <div key={index}>
                      {usuario.avalsData.map((aval, idx) => (
                        <div>
                          {usuario._id === userId && (
                            <ul key={idx} className="listaAval">
                              <li>
                                <div className="labelsUploads">
                                  <p>RUT:</p>
                                </div>
                                <div className="uploads">
                                  <div className="docdivDoc">
                                    <div className="doc">
                                      <a className="docLink" 
                                        style={{ cursor: 'pointer'}}
                                        onClick={(e) => {
                                          e.preventDefault(); // Evitar que el enlace redireccione
                                          mostrarPdf(aval.rut);
                                        }}
                                      >
                                        <p>Ver Documento</p>
                                      </a>
                                    </div>
                                  </div>
                                  
                                </div>
                              </li>
                              <li>
                                <div className="labelsUploads">
                                  <p>Certificado Bancario:</p>
                                </div>
                                <div className="uploads">
                                  <div className="docdivDoc">
                                    <div className="doc">
                                      <a className="docLink" 
                                        style={{ cursor: 'pointer' }}
                                        onClick={(e) => {
                                          e.preventDefault(); // Evitar que el enlace redireccione
                                          mostrarPdf(aval.certificado);
                                        }}
                                      >
                                        <p>Ver Documento</p>
                                      </a>
                                    </div>
                                  </div>
                                
                                </div>
                              </li>
                              <li>
                                <div className="labelsUploads">
                                  <p>Promedio:</p>
                                </div>
                                <div className="uploads">
                                  <div className="docdivDoc">
                                    <div className="doc">
                                      <a  className="docLink" 
                                        style={{ cursor: 'pointer'}}
                                        onClick={(e) => {
                                          e.preventDefault(); // Evitar que el enlace redireccione
                                          mostrarImagen(aval.promedio);
                                        }}
                                      >
                                        <p>Ver Documento</p>
                                      </a>
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
          )}


          {!checkDoc && (
            <div>
              <div className="containerDocumentacion">
                <h1 className="tituloDocumentacion">Subir documentos</h1>
                <hr />
                <form onSubmit={handleSubmit}>
                  <div className="style1">
                    <label htmlFor="fileInput2" className="labelsUploads">
                      RUT:
                    </label>
                    <div className="uploads">
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
                  </div>

                  <div className="style1">
                    <label htmlFor="fileInput1" className="labelsUploads">
                      Promedio:
                    </label>
                    <div className="uploads">
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
                  </div>

                  <div className="style1">
                    <label htmlFor="fileInput3" className="labelsUploads">
                      Certificado Bancario:
                    </label>
                    <div className="uploads">
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
                  </div>

                  <div className="btn-uploads">
                    <button type="submit" className="btnSubmitDocs">
                      Subir Documentos
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    
  );
};

export default Documentacion;
