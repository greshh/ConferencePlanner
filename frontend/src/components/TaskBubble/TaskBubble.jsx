import React, { useState } from "react";
import "./style.css";

export const TaskBubble = ({ task = "Task" }) => {
  const [checked, setChecked] = useState(false);
  
  return (
    <div className={`task-bubble`}>
      <div className={`checkbox`}>
        {checked ? (
          <img className="check-checked" src="/icons/task-bubble/Unchecked.svg" onClick={() => setChecked(!checked)} />
        ) : (
          <div className="check-unchecked" onClick={() => setChecked(!checked)} />
        )}
      </div>

      <div
        className="text-wrapper"
        style={{ textDecoration: checked ? "line-through" : "none" }}
      >
        {task}
      </div>
    </div>
  );
};
