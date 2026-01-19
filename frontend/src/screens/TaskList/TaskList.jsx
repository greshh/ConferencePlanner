import React, { useState, useEffect } from "react";
import { AddATask } from "../../components/AddATask";
import { Header } from "../../components/Header";
import { Sidebar } from "../../components/Sidebar";
import { TaskBubble } from "../../components/TaskBubble";
import { Loading } from "../../components/Loading";
import { TaskDetails } from "./TaskDetails/TaskDetails";
import { EditTask } from "./EditTask/EditTask";
import { AddTask } from "./AddTask/AddTask";
import { useNavigate } from "react-router-dom";
import "./style.css";

export const TaskList = ({ memberId, cookies, removeCookie, development }) => {

  /* USER_LOGIN is set to FALSE for development purposes.
     Upon deployment, the user should only see their own tasks and personal notes is used. 
     Upon development, all the tasks can be seen and personal notes is disabled.*/
  const USER_LOGIN = true;

  const api_base = development ? "http://localhost:4000" : "";

  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTaskId, selectTaskId] = useState(null);
  const [rightPanel, setPanel] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      const res = USER_LOGIN ? await fetch(`${api_base}/api/tasks/${memberId || cookies['memberId']}`) : await fetch(`${api_base}/api/tasks`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load tasks:", err);
      setError(err.message || "Failed to load tasks");
    }
  };

  const onToggleComplete = async (selectedTaskId) => {
    const selectedTask = tasks.find(t => t.task_id === selectedTaskId);
    if (saving) return;
    const newValue = !selectedTask.completed;
    setSaving(true);
    try {
      const res = await fetch(`${api_base}/api/tasks/patch/${selectedTaskId}`, {
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

  const isLoading = tasks === null;

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch(`${api_base}/api/members/${effectiveMemberId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Failed to load member:", err);
        setError(err.message || "Failed to load member");
      }
    }

    if (!memberId && !cookies['memberId']) {
      navigate("/");
      return;
    }
    const effectiveMemberId = memberId || cookies['memberId'];
    USER_LOGIN && getUser();
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
      <div className="task-heading" style={{ boxShadow: scrolled ? '0 8px 12px -10px rgba(0, 0, 0, 0.3)' : 'none' }}>
        <div className="my-tasks">MY TASKS</div>
      </div>
      { !USER_LOGIN || (USER_LOGIN && user != null) ? (
        <Sidebar user={user} removeCookie={removeCookie} />
      ) : (
        <div className="loading-sidebar"/>
      )}
      <div className="content">
        <div className="left-panel">
          <div style={{ margin: `20vh 0 10vh 0`, width: `20vw` }}>
            {isLoading || error ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loading/>
              </div>
            ) : (
              tasks.map((t) => {
                return (
                  <div
                    key={t.task_id}
                    onClick={() => {
                      selectTaskId(t.task_id);
                      setPanel(1);
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
              1: tasks && selectedTaskId && <TaskDetails task={tasks.find(t => t.task_id === selectedTaskId)} selectTaskId={selectTaskId} setPanel={setPanel} fetchTasks={fetchTasks} memberId={memberId || cookies['memberId']} USER_LOGIN={USER_LOGIN} development={development} />,
              2: tasks && <EditTask task={tasks.find(t => t.task_id === selectedTaskId)} setPanel={setPanel} setTasks={setTasks} development={development} memberId={memberId || cookies['memberId']} USER_LOGIN={USER_LOGIN} />,
              3: <AddTask setPanel={setPanel} selectTaskId={selectTaskId} setTasks={setTasks} development={development} memberId={memberId || cookies['memberId']} USER_LOGIN={USER_LOGIN} />
            } [rightPanel]
          }
        </div>
      </div>

      <div className="add-a-task-panel">
        {user != null && user.is_committee_head == 1 && <AddATask setPanel={setPanel} />}
      </div>
    </div>
  );
};
