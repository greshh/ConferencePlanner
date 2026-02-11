import React, { useState } from "react";
import { LoadingSmall } from "../LoadingSmall";
import "./style.css";

export const TaskBubble = ({ task, onToggleComplete, isGuest }) => {
  const [saving, setSaving] = useState(false);

  return (
    task != null && task.task_name != null && task.completed != null ? (
      <div className={`task-bubble`} data-testid={"task-bubble"}>
        <div className="checkbox">
          <div
            className={task.completed ? "check-checked" : "check-unchecked"}
            data-testid={"checkbox"}
            onClick={async () => {
              setSaving(true);
              if (!isGuest)  await onToggleComplete(task.task_id);
              setSaving(false);
            }}
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
          <div>
            {task.task_name}
          </div>
          {saving && <LoadingSmall style={{ marginLeft: "2rem" }} />}
        </div>
      </div>
    ) : ( <div/> )
  );
};
