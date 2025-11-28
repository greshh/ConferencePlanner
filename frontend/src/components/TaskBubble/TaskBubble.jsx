import React, { useState } from "react";
import "./style.css";

export const TaskBubble = ({ id, task = "Task", completed = false }) => {
  const [checked, setChecked] = useState(Boolean(completed));
  const [saving, setSaving] = useState(false);

  const toggle = async () => {
    if (saving) return;
    const newValue = !checked;

    // optimistic UI update
    setChecked(newValue);
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:3000/update-task/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: newValue }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      console.error("Failed to update task completed:", err);
      setChecked(!newValue);
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className={`task-bubble`}>
      <div className="checkbox">
        <div
          className={checked ? "check-checked" : "check-unchecked"}
          onClick={toggle}
          role="checkbox"
          aria-checked={checked}
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}
          style={{ cursor: saving ? 'wait' : 'pointer' }}
        />
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
