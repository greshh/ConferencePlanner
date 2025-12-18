import React from "react";
import "./style.css";

export const AddATask = ({ setPanel }) => {
  return (
    <div className={`add-a-task`} onClick={() => { setPanel(3) }}>
      <div className="plus">+</div>
      <div className="text">Add a task</div>
    </div>
  );
};
