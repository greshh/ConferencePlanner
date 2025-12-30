import React from "react";
import "./style.css";

export const PopUp = ({ message, options, inputText, inputFile }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <p style={{ marginBottom: '0.5rem' }}>{message}</p>
        <form>
          {inputText ? (
            <input type="text" id="link" style={{ marginBottom: '1rem' }} />
          ) : ( <div/> )}
          {inputFile ? (
            <input type="file" id="file" style={{ margin: '0.5rem 0 1rem 0' }} />
          ) : ( <div/> )}
        </form>
        <div className="popup-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          {options?.map((option, index) => (
            <button key={index} onClick={option.onClick}>
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}