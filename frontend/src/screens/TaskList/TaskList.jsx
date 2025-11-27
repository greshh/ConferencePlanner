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
  const [selectedTask, selectTask] = useState(null);
  const [assignment, setAssignment] = useState([]);

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

  const loadTask = async (id) => {
    try {
      const res = await fetch("http://localhost:3000/assigned/" + id);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAssignment(Array.isArray(data) ? data : []);
      selectTask(tasks.at(id-1));
    } catch (err) {
      console.error("Failed to load task:", err);
    }
  };

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
          <Sidebar style={{ order: `1` }} />
          <div style={{ order: `2`, margin: `20vh 0 10vh 0`, width: `20vw` }}>
            {loading ? (
              <div className="loading">Loading tasks…</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : (
              tasks.map((t) => {
                const task_id = t.task_id;
                const task_name = t.task_name;
                return (
                  <div
                    key={task_id}
                    onClick={() => loadTask(task_id)}
                    style={{
                      display: `flex`,
                      marginBottom: `5%`,
                      justifyContent: `center`,
                      cursor: 'pointer'
                    }}
                  >
                    <TaskBubble task={task_name} />
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="right-panel">
          {selectedTask ? (
            <div className="task-details">
              <h2>{selectedTask.task_name}</h2>
              {selectedTask.description && <p>{selectedTask.description}</p>}
              {selectedTask.due_date && (
                <p>Due: {new Date(selectedTask.due_date).toLocaleString()}</p>
              )}
              {assignment && assignment.map((a) => (
                <p key={a.assignment_id}>
                  Assigned: {a.member.first_name} {a.member.last_name}
                </p>
              ))}
              <button onClick={() => selectTask(null)}>Close</button>
            </div>
          ) : (
            <div className="placeholder">Select a task to view details</div>
          )}
        </div>
      </div>

      <div className="add-a-task-panel">
        <AddATask className="add-a-task-instance" />
      </div>
    </div>
  );
};
