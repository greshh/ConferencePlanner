import React, { useState, useEffect } from "react";
import { loadTask } from "../../hooks/loadTask";
import "./style.css";

export const TaskBubble = ({ task, onToggleComplete }) => {
  useEffect(() => {

  }, [task]);

  return (
    task != null && task.task_name != null && task.completed != null ? (
      <div className={`task-bubble`}>
        <div className="checkbox">
          <div
            className={task.completed ? "check-checked" : "check-unchecked"}
            onClick={async () => await onToggleComplete(task.task_id)}
            role="checkbox"
            aria-checked={task.completed}
            tabIndex={0}
            onKeyDown={async (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); await onToggleComplete(task.task_id); } }}
            style={{ cursor: 'pointer' }}
          />
        </div>

        <div
          className="text-wrapper"
          style={{ textDecoration: task.completed ? "line-through" : "none" }}
        >
          {task.task_name}
        </div>
      </div>
    ) : ( <div/> )
  );
};
