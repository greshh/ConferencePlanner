import React, { useState, useEffect } from "react";
import { AddATask } from "../../components/AddATask";
import { Header } from "../../components/Header";
import { Sidebar } from "../../components/Sidebar";
import { TaskBubble } from "../../components/TaskBubble";
import { TaskDetails } from "./TaskDetails/TaskDetails";
import { EditTask } from "./EditTask/EditTask";
import "./style.css";

export const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, selectTask] = useState(null);
  const [rightPanel, setPanel] = useState(0);

  const fetchTasks = async () => {
    try {
      const res = await fetch("http://localhost:3000/tasks");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
      console.log(data);
    } catch (err) {
      console.error("Failed to load tasks:", err);
      setError(err.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
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
                    onClick={() => {
                      setPanel(0); // temporarily close panel
                      selectTask({ ...t });
                      setTimeout(() => setPanel(1), 0); // reopen panel
                    }}
                    style={{
                      display: `flex`,
                      marginBottom: `5%`,
                      justifyContent: `center`,
                      cursor: 'pointer'
                    }}
                  >
                    <TaskBubble id={task_id} task={task_name} completed={t.completed} />
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
              1: <TaskDetails task={selectedTask} selectTask={selectTask} setPanel={setPanel} fetchTasks={fetchTasks} />,
              2: <EditTask task={selectedTask} setPanel={setPanel} setTask={selectTask} setTasks={setTasks} />
            }[rightPanel]
          }
        </div>
      </div>

      <div className="add-a-task-panel">
        <AddATask style={
          {left: `217px !important`,
            position: `fixed !important`,
            top: `589px !important`,
            zIndex: `5 !important`
          }
        } />
      </div>
    </div>
  );
};
