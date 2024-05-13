import React from "react";
import "./Card.css";

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
