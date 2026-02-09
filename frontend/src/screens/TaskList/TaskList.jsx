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
import noTaskMessages from "../../../noTaskMessages";
import "./style.css";

export const TaskList = ({ memberId, cookies, removeCookie, development, userLogin }) => {

  const api_base = development ? "http://localhost:4000" : "";

  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTaskId, selectTaskId] = useState(null);
  const [rightPanel, setPanel] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const getRandomNoTaskMessage = () => {
    return noTaskMessages[Math.floor(Math.random() * noTaskMessages.length)].message;
  };

  const [noTaskMessage, setNoTaskMessage] = useState(getRandomNoTaskMessage());

  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      const res = userLogin ? await fetch(`${api_base}/api/tasks/${Number(memberId) || Number(cookies['memberId'])}`) : await fetch(`${api_base}/api/tasks`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      let array = [];
      if (userLogin && Array.isArray(data)) {
        data.map((t)=>{
          array.push(t);
        })
      } else {
        array = data;
      }
      setTasks(array);
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
      const res = await fetch(`${api_base}/api/tasks/patch/${Number(selectedTaskId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "completed": newValue }),
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
        const res = await fetch(`${api_base}/api/members/${Number(memberId) || Number(cookies['memberId'])}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Failed to load member:", err);
        setError(err.message || "Failed to load member");
      }
    }

    if (userLogin && !memberId && !cookies['memberId']) {
      navigate("/");
      return;
    }
    userLogin && getUser();
    fetchTasks();
    window.addEventListener("scroll", () => {
      if (window.pageYOffset > 0) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    });
  }, [tasks]);

  return (
    <div className="desktop">
      <title>Conference Planner | Task List</title>
      <div className="header">
        <Header />
      </div>
      <div className="task-heading" style={{ boxShadow: scrolled ? '0 8px 12px -10px rgba(0, 0, 0, 0.3)' : 'none' }}>
        <div className="my-tasks">MY TASKS</div>
      </div>
      { !userLogin || (userLogin && user != null) ? (
        <Sidebar isGuest={!userLogin} user={user} removeCookie={removeCookie} />
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
              tasks && tasks.length > 0 ? (
                tasks.map((t) => {
                  return (
                    <div
                      key={Number(t.task_id)}
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
                      <TaskBubble task={t} onToggleComplete={onToggleComplete} isGuest={!userLogin} />
                    </div>
                  );
                })
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontStyle: 'italic', fontSize: 'smaller', padding: '0 10%', textAlign: 'center' }}>
                  {noTaskMessage}
                </div>
              )
            )}
          </div>
        </div>

        <div className="right-panel">
          {
            {
              0: <div/>,
              1: tasks && selectedTaskId && tasks.find(t => t.task_id === selectedTaskId) && <TaskDetails task={tasks.find(t => t.task_id === selectedTaskId)} selectTaskId={selectTaskId} setPanel={setPanel} fetchTasks={fetchTasks} memberId={userLogin ? memberId || cookies['memberId'] : null} userLogin={userLogin} development={development} />,
              2: tasks && <EditTask task={tasks.find(t => t.task_id === selectedTaskId)} setPanel={setPanel} setTasks={setTasks} development={development} memberId={userLogin ? memberId || cookies['memberId'] : null} userLogin={userLogin} />,
              3: <AddTask setPanel={setPanel} selectTaskId={selectTaskId} setTasks={setTasks} development={development} memberId={userLogin ? memberId || cookies['memberId'] : null} userLogin={userLogin} />
            } [rightPanel]
          }
        </div>
      </div>

      <div className="add-a-task-panel">
        {(userLogin && user != null && user.is_committee_head == 1) && <AddATask setPanel={setPanel} />}
      </div>
    </div>
  );
};
