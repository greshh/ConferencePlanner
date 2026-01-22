import React, { useEffect } from "react";
import "./style.css";

export const PopUp = ({ message, options, inputText, inputFile, cancelOnClick }) => {
  
  useEffect(()=>{
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        cancelOnClick();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
  });

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        {message && message != "Link" && 
          <p style={{ marginBottom: '0.5rem' }}>{message}</p>
        }
        <form>
          {message == "Link" && 
            <div className="attachment-input">
              <p>Link</p>
              <input type="text" id="link" />
              <p>Name</p>
              <input type="text" id="attachment-name" />
            </div>
          }
          {inputText ? (
            <input type="text" id="link" style={{ marginBottom: '1rem' }} />
          ) : ( <div/> )}
          {inputFile ? (
            <div className="attachment-input">
              <p>File</p> 
              <input type="file" id="file" data-testid="file-input" />
              <p>Name</p> 
              <input type="text" id="attachment-name" />
            </div>
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