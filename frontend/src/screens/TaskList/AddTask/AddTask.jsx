import React, { useState, useEffect } from "react";
import "./style.css";

export const AddTask = ({ setPanel, selectTaskId, setTasks, development, memberId, USER_LOGIN }) => {
  const api_base = development ? "http://localhost:4000" : "";

  const createTask = async () => {
    const task_name = document.getElementById("task-name").value;
    const due_date = document.getElementById("due-date").value;
    const description = document.getElementById("description").value;

    try {
      const res = await fetch(`${api_base}/api/tasks/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_name, due_date, description }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return res.json();
    } catch (err) {
      console.error("Failed to update task completed:", err);
    }
  };

  const assignMember = async (taskId, memberId) => {
    try {
      const res = await fetch(`${api_base}/api/assignments/patch`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: taskId, member_id: memberId }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return res.json();
    } catch (err) {
      console.error("Failed to assign current member to task:", err);
    }
  }

  return (
    <div>
      <div className="new-task">
        <div className="current-task">
          <form>
            <div className="task-flex">
                <div>
                  <input 
                    type="text" 
                    className="task-name" 
                    id="task-name" 
                    maxLength="45" 
                    placeholder="NEW TASK" 
                    style={{ minWidth: '100%' }}
                    required
                  ></input>
                </div>
                <div>
                  <p className="due-date"> Due Date: <input type="date" id="due-date" defaultValue={new Date().toISOString().split("T")[0]}></input></p>
                  <textarea
                    id="description"
                    placeholder="Enter task description..."
                    maxLength="1000"
                    style={{ minWidth: "99%", height: "5rem", marginTop: '1rem', whiteSpace: "pre-wrap" }}
                  ></textarea>
                </div>
                <div style={{ display: 'flex', marginTop: '1rem', gap: '1rem' }}>
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
                      const newTask = await createTask();
                      if (memberId) await assignMember(newTask.insertId, memberId);
                      const refreshedTask = await fetch(`${api_base}/api/tasks/get/${newTask.insertId}`).then(res => res.json());
                      selectTaskId(refreshedTask.task_id);
                      const refreshedTasks = USER_LOGIN ? 
                        await fetch(`${api_base}/api/tasks/${memberId}`).then(res => res.json()) : 
                        await fetch(`${api_base}/api/tasks`).then(res => res.json());
                      setTasks(refreshedTasks);
                      setPanel(1); 
                    }}>Save</button>
                  <button type="button" onClick={() => { setPanel(0) }}>Discard</button>
                </div>
                <p style={{ fontStyle: 'italic'}}>Don't worry, you can assign members and committees later!</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  ); 
}