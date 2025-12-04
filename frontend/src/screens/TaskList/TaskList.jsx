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
  const [committees, setCommittees] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:3000/tasks");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : []);
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
      const res1 = await fetch("http://localhost:3000/assigned/" + id);
      if (!res1.ok) throw new Error(`HTTP ${res1.status}`);
      const assigned_data = await res1.json();
      setAssignment(Array.isArray(assigned_data) ? assigned_data : []);
      const res2 = await fetch("http://localhost:3000/assigned-committees/" + id);
      if (!res2.ok) throw new Error(`HTTP ${res2.status}`);
      const committee_data = await res2.json();
      setCommittees(Array.isArray(committee_data) ? committee_data : []);
      selectTask(tasks.find((x) => x.task_id === id) ?? null);
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
                    <TaskBubble id={task_id} task={task_name} completed={t.completed} />
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="right-panel">
          {selectedTask ? (
            <div className="task-selected">
              <div className="current-task">
                <div className="task-details">
                  <h2>{selectedTask.task_name.toUpperCase()}</h2>
                  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <div>
                      {selectedTask.due_date && (
                        <p className="due-date">Due Date: {new Date(selectedTask.due_date).toISOString().split('T')[0]}</p>
                      )}
                      {selectedTask.description && <p>{selectedTask.description}</p>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ lineHeight: '1px' }}>Assigned:</p>
                      {assignment && assignment.length > 0 ? (
                        <div className="avatar-group">
                          {assignment.map((m) => (
                            <img
                              key={m.assignment_id}
                              src={'https://storage.googleapis.com/conference_planner_pfp/member/'+m.member.member_id+'.jpg'}
                              className="avatar"
                              alt={m.member.first_name}
                              title={m.member.first_name+' '+m.member.last_name}
                            />
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontStyle: 'italic' }}>No one</p>
                      )}
                      {committees && committees.map((c) => (
                        <p key={c.task_committee_id}>
                          Committees: {c.committee.committee_name}
                        </p> 
                      ))}
                    </div>
                  </div>
                  <button onClick={() => selectTask(null)}>Close</button>
                </div>
              </div>
            </div>
          ) : (
            <div/>
          )}
        </div>
      </div>

      <div className="add-a-task-panel">
        <AddATask className="add-a-task-instance" />
      </div>
    </div>
  );
};
