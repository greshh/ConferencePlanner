import React from "react";
import "./style.css";

export const Header = ({ className }) => {
  return (
    <div className={`header ${className}`}>
      <img
        className="image"
        alt="Image"
        src="https://c.animaapp.com/NoNNVYFT/img/image-1-1@2x.png"
      />
    </div>
  );
};
