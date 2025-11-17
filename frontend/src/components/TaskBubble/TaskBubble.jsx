import React from "react";
import "./style.css";

export const TaskBubble = ({ task = "Task" }) => {
  return (
    <div className={`task-bubble`}>
      <div className="ellipse" />

      <div className="text-wrapper">{task}</div>
    </div>
  );
};
