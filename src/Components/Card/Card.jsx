import React from "react";
import "./Card.css";

/**
 * Componente funcional que representa una tarjeta con contenido, imagen y un botón para leer más.
 * 
 * Props:
 *  - title: El título de la tarjeta.
 *  - imageUrl: La URL de la imagen que se mostrará en la tarjeta.
 *  - body: El contenido principal de la tarjeta.
 *  - href: La URL a la que se dirigirá el enlace "Leer más" cuando se haga clic en el botón.
 */

const Card = ({ title, imageUrl, body, href }) => {
  return (
    <div className="card-container">
      <div className="image-container">
        <img src={imageUrl} alt="" />
      </div>
      <div className="card-content">
        <div className="card-title">
          <h3>{title}</h3>
        </div>
        <div className="card-body">
          <p>{body}</p>
        </div>
        <div className="card-btn">
          <button>
            <a href={href} className="rm-card" target="_blank">Leer más</a>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Card;
