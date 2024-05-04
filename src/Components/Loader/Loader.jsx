import React from 'react';
import './Loader.css'; // Archivo CSS para estilos del spinner (puedes personalizarlo según tus necesidades)

const Loader = () => {
    return (
        <div className="loader-container">
            <div className="loader"></div>
            {/* <div className="loading-text">Cargando...</div> */}
        </div>
    );
};

export default Loader;
