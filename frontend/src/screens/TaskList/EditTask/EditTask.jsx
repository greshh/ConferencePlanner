import React, { useState, useEffect } from "react";
import { loadAssigned } from "../../../hooks/loadAssigned";
import { loadTask } from "../../../hooks/loadTask";
import { MemberDropdown } from "../../../components/MemberDropdown/MemberDropdown";
import { CommitteeDropdown } from "../../../components/CommitteeDropdown/CommitteeDropdown";
import "./style.css";

export const EditTask = ({ task, setPanel, selectTaskId, setTasks }) => {
  const [assignment, setAssignment] = useState({ members: [], committees: [] });

  useEffect(() => {
    const fetchAssigned = async () => {
      const data = await loadAssigned(task.task_id);
      setAssignment(data);
    }
    fetchAssigned();
  }, [task]);

  const updateTask = async () => {
    const task_name = document.getElementById("task-name").value;
    const due_date = document.getElementById("due-date").value;
    const description = document.getElementById("description").value;

    try {
      const res = await fetch(`http://localhost:3000/update-task/${task.task_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_name, due_date: new Date(due_date), description }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      console.error("Failed to update task completed:", err);
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
                    <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
                      <h3>COMMITTEES</h3>
                      <CommitteeDropdown
                        task={task}
                        assignment={assignment}
                        setAssignment={setAssignment}
                      />
                    </div>
                    {assignment.committees && assignment.committees.map((c) => (
                      <span className="committee" key={c.task_committee_id} style={{ backgroundColor: "#" + c.committee.colour }}>
                        {c.committee.committee_name}
                      </span> 
                    ))}
                  </div>
                  <div style={{ flex: '0 0 auto', textAlign: 'right' }}>
                    <p style={{ lineHeight: '1px' }}>Assigned:</p>
                    <div className="avatar-group">
                      {assignment.members && assignment.members.length > 0 ? (
                        assignment.members.map(m => (
                          <img
                            key={m.assignment_id}
                            src={`https://storage.googleapis.com/conference_planner_pfp/member/${m.member.member_id}.jpg`}
                            className="avatar"
                            alt={m.member.first_name}
                            title={`${m.member.first_name} ${m.member.last_name}`}
                            onError={(e) => { e.currentTarget.src = "https://storage.googleapis.com/conference_planner_pfp/unknown.jpg"; }}
                          />
                        )
                      )) : (
                        <div/>
                      )}
                      <MemberDropdown task={task} assignment={assignment} setAssignment={setAssignment} />
                    </div>
                  </div>
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
                        const refreshedTask = await fetch(`http://localhost:3000/task/${task.task_id}`).then(res => res.json());
                        selectTaskId(refreshedTask.task_id);
                        const refreshedTasks = await fetch("http://localhost:3000/tasks").then(res => res.json());
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