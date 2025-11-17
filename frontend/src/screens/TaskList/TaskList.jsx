import React, { useState, useEffect } from "react";
import { AddATask } from "../../components/AddATask";
import { Header } from "../../components/Header";
import { Sidebar } from "../../components/Sidebar";
import { TaskBubble } from "../../components/TaskBubble";
import "./style.css";

export const TaskList = () => {
  const spacing = 20;

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:3000/tasks");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : data?.tasks ?? []);
      } catch (err) {
        console.error("Failed to load tasks:", err);
        setError(err.message || "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="desktop" data-model-id="1:2">
      <div className="group">
        {loading ? (
          <div className="loading">Loading tasks…</div>
        ) : error ? (
          <div className="error">Error: {error}</div>
        ) : (
          tasks.map((t, index) => {
            const task_id = t.task_i;
            const task_name = t.task_name;
            return (
              <div
                key={task_id}
                style={{
                  marginBottom: `${spacing}px`,
                }}
              >
                <TaskBubble task={task_name} />
              </div>
            );
          })
        )}
        <div className="group-2">
          <div className="rectangle" />
          <div className="text-wrapper-3">MY TASKS</div>
        </div>
      </div>

      <Sidebar className="sidebar-instance" />
      <div className="rectangle-2" />

      <div className="group-3" />

      <AddATask className="add-a-task-instance" />
      <Header className="header-instance" />
    </div>
  );
};
