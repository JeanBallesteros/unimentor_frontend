import React from 'react';
import './Loader.css'; // Archivo CSS para estilos del spinner (puedes personalizarlo según tus necesidades)


/**
 * Componente funcional que representa un spinner de carga.
 * Se utiliza para indicar que se está cargando contenido.
 */

const Loader = () => {
    return (
        <div className="loader-container">
            <div className="loader"></div>
        </div>
    );
};

export default Loader;
