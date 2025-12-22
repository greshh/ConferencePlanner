import React, { useState, useEffect } from "react";
import { AddATask } from "../../components/AddATask";
import { Header } from "../../components/Header";
import { Sidebar } from "../../components/Sidebar";
import { TaskBubble } from "../../components/TaskBubble";
import { TaskDetails } from "./TaskDetails/TaskDetails";
import { EditTask } from "./EditTask/EditTask";
import { AddTask } from "./AddTask/AddTask";
import "./style.css";

export const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTaskId, selectTaskId] = useState(null);
  const [rightPanel, setPanel] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await fetch("http://localhost:3000/tasks");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load tasks:", err);
      setError(err.message || "Failed to load tasks");
    } finally {
      console.log("tasks:", tasks);
      setLoading(false);
    }
  };

  const onToggleComplete = async (selectedTaskId) => {
    const selectedTask = tasks.find(t => t.task_id === selectedTaskId);
    if (saving) return;
    const newValue = !selectedTask.completed;
    console.log("newValue:", newValue);
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:3000/update-task/${selectedTaskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: newValue }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      console.error("Failed to update task completed:", err);
    } finally {
      setSaving(false);
      selectTaskId(selectedTaskId);
      fetchTasks();
    }
  };

  useEffect(() => {
    fetchTasks();
    window.addEventListener("scroll", () => {
      if (window.pageYOffset > 0) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    });
  }, []);

  return (
    <div className="desktop">
      <div className="header">
        <Header />
      </div>
      <div className="task-heading" style={{ boxShadow: scrolled ? '0 4px 6px -2px #00000040;' : 'none' }}>
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
                return (
                  <div
                    key={t.task_id}
                    onClick={() => {
                      // setPanel(0); // temporarily close panel
                      selectTaskId(t.task_id);
                      setPanel(1);
                      // setTimeout(() => setPanel(1), 0); // reopen panel
                    }}
                    style={{
                      display: `flex`,
                      marginBottom: `5%`,
                      justifyContent: `center`,
                      cursor: 'pointer'
                    }}
                  >
                    <TaskBubble task={t} onToggleComplete={onToggleComplete} />
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="right-panel">
          {
            {
              0: <div/>,
              1: <TaskDetails task={tasks.find(t => t.task_id === selectedTaskId)} setPanel={setPanel} fetchTasks={fetchTasks} loading={loading} setLoading={setLoading} />,
              2: <EditTask task={tasks.find(t => t.task_id === selectedTaskId)} setPanel={setPanel} selectTaskId={selectTaskId} setTasks={setTasks} setLoading={setLoading} />,
              3: <AddTask setPanel={setPanel} selectTaskId={selectTaskId} setTasks={setTasks} />
            } [rightPanel]
          }
        </div>
      </div>

      <div className="add-a-task-panel">
        <AddATask setPanel={setPanel} />
      </div>
    </div>
  );
};
