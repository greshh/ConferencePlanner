import React from "react";
import "./style.css";

export const AddATask = ({ className }) => {
  return (
    <div className={`add-a-task ${className}`}>
      <div className="div">Add a task</div>

      <div className="text-wrapper-2">+</div>
    </div>
  );
};
