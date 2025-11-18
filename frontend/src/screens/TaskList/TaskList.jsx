import React, { useState, useEffect } from "react";
import { AddATask } from "../../components/AddATask";
import { Header } from "../../components/Header";
import { Sidebar } from "../../components/Sidebar";
import { TaskBubble } from "../../components/TaskBubble";
import "./style.css";

export const TaskList = () => {
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
    <div className="desktop">
      <div className="header">
        <Header />
      </div>
      <div className="task-heading">
        <div className="my-tasks">MY TASKS</div>
      </div>
      <div className="content">
        <div className="left-panel">
          <Sidebar style={{order: `1` }} />
          <div style={{order: `2`, margin:`20vh 0 10vh 0`, width: `20vw`}}>
            {loading ? (
              <div className="loading">Loading tasks…</div>
            ) : error ? (
              alert(error)
            ) : (
              tasks.map((t) => {
                const task_id = t.task_i;
                const task_name = t.task_name;
                return (
                  <div
                    key={task_id}
                    style={{
                      display: `flex`,
                      marginBottom: `5%`,
                      justifyContent: `center`
                    }}
                  >
                    <TaskBubble task={task_name} />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      <div className="add-a-task-panel">
        <AddATask className="add-a-task-instance" />
      </div>
    </div>
  );
};
