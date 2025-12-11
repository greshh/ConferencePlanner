import React from "react";
import "./style.css";

export const PopUp = ({ message, options }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <p>{message}</p>
        <div className="popup-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          {options.map((option, index) => (
            <button key={index} onClick={option.onClick}>
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}