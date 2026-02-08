import React, { useState, useEffect } from "react";
import { loadAssigned } from "../../../hooks/loadAssigned";
import "./style.css";

export const EditTask = ({ task, setPanel, setTasks, development, memberId, userLogin}) => {
  const [assignment, setAssignment] = useState({ members: [], committees: [] });

  const api_base = development ? "http://localhost:4000" : "";

  useEffect(() => {
    const fetchAssigned = async () => {
      if (task == null || task.task_id == null) return;
      const data = await loadAssigned(task.task_id, development);
      setAssignment(data);
    }
    fetchAssigned();
  }, [task]);

  const updateTask = async () => {
    const task_name = document.getElementById("task-name").value;
    const due_date = document.getElementById("due-date").value;
    const description = document.getElementById("description").value;

    try {
      const res = await fetch(`${api_base}/api/tasks/patch/${Number(task.task_id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_name: task_name, due_date: new Date(due_date), description: description }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      console.error("Failed to update task details:", err);
    }
  };

  return (
    task != null && task.task_name != null && task.completed != null && task.due_date != null && task.description != null ? (
      <div>
        <div className="task-selected">
          <div className="current-task">
            <form>
              <div className="task-flex-grid">
                  <div>
                    <input 
                      type="text" 
                      className="task-name" 
                      id="task-name" 
                      maxLength="45" 
                      defaultValue={task.task_name != null ? task.task_name : ""} 
                      style={{ minWidth: '100%' }}
                      required
                    ></input>
                  </div>
                  <div style={{ textAlign: 'right', marginRight: '1vw' }}>
                    {task.completed == 1 ? (
                      <p><span style={{ backgroundColor: '#CAFFBF', color: '#355d3c', padding: '5px 10px', borderRadius: '5px' }}>Completed</span></p>
                    ) : (
                      <p><span style={{ backgroundColor: '#FFADAD', color: '#7a2e2e', padding: '5px 10px', borderRadius: '5px' }}>Incomplete</span></p>
                    )}
                  </div>
                  <div style={{ marginBottom: '2rem' }}>
                    <p className="due-date"> Due Date: <input type="date" id="due-date" defaultValue={task.due_date != null ? new Date(task.due_date).toISOString().split("T")[0] : ""}></input></p>
                    <textarea
                      id="description"
                      defaultValue={task.description != null ? task.description : ""}
                      maxLength="1000"
                      style={{ minWidth: "100%", height: "5rem", marginTop: '1rem', whiteSpace: "pre-wrap" }}
                    ></textarea>
                  </div>
                  <div/>
                  <div style={{display: 'flex', gap: '1rem'}}>
                    <button type="submit" onClick={async (e) => 
                      { 
                        e.preventDefault(); 
                        const errors = [];
                        if (!document.getElementById("task-name").value) {
                          errors.push("• Task name is required");
                        }
                        if (new Date(document.getElementById("due-date").value) == "Invalid Date") {
                          errors.push("• Due date is invalid");
                        }
                        if (errors.length > 0) {
                          alert("Please see the following errors:\n" + errors.join("\n"));
                          return;
                        }
                        await updateTask();
                        const refreshedTasks = userLogin ? 
                          await fetch(`${api_base}/api/tasks/${Number(memberId)}`).then(res => res.json()) : 
                          await fetch(`${api_base}/api/tasks`).then(res => res.json());
                        setTasks(refreshedTasks);
                        setPanel(1); 
                      }}>Save</button>
                    <button type="button" onClick={() => { setPanel(1) }}>Discard</button>
                  </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    ) : ( <div/> )
  ); 
}