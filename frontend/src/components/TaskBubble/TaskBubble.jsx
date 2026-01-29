import React from "react";
import "./style.css";

export const TaskBubble = ({ task, onToggleComplete, isGuest }) => {
  return (
    task != null && task.task_name != null && task.completed != null ? (
      <div className={`task-bubble`} data-testid={"task-bubble"}>
        <div className="checkbox">
          <div
            className={task.completed ? "check-checked" : "check-unchecked"}
            data-testid={"checkbox"}
            onClick={async () => {if (!isGuest)  await onToggleComplete(task.task_id);}}
            role="checkbox"
            aria-checked={task.completed}
            tabIndex={0}
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
