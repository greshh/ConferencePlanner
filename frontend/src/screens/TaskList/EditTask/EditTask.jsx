import React, { useState, useEffect } from "react";
import { loadAssigned } from "../../../hooks/loadAssigned";
import "./style.css";

export const EditTask = ({ task, setPanel, setTask, setTasks }) => {
  const [assignment, setAssignment] = useState({ members: [], committees: [] });
  const [memberClicked, setMemberClicked] = useState(false);
  const [committeeMembers, setCommitteeMembers] = useState([]); // Array by committee then by members
  const [committeeHeads, setCommitteeHeads] = useState([]); // Array by committee then by committee heads

  useEffect(() => {
    const fetchAssignment = async () => {
      const data = await loadAssigned(task.task_id);
      setAssignment(data);
    };
    fetchAssignment();
  }, [task.task_id]);

  const fetchCommitteeMembers = async (assignment) => {
    const members = [];
    for (const c of assignment.committees) {
      try {
        const res = await fetch(`http://localhost:3000/committee-members/${c.committee.committee_id}`);
        const data = await res.json();
        members.push(data);
      } catch (err) {
        console.error("Failed to load committee members:", err);
      }
    }
    setCommitteeMembers(members);
  };

  const fetchCommitteeHeads = async (assignment) => {
    const committeeHeads = [];
    for (const c of assignment.committees) {
      try {
        const res = await fetch(`http://localhost:3000/committee-heads/${c.committee.committee_id}`);
        const data = await res.json();
        committeeHeads.push(data);
      } catch (err) {
        console.error("Failed to load committee heads:", err);
      }
    }
    setCommitteeHeads(committeeHeads);
  };

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

  const toggleMember = (memberClicked) => {
    const newValue = !memberClicked;
    setMemberClicked(newValue);
  }

  return (
    <div>
      <div className="task-selected">
        <div className="current-task">
          <div style={{margin: '4% 4%'}}>
            <form>
              <input type="text" className="task-name" id="task-name" defaultValue={task.task_name} style={{ minWidth: '100%' }}></input>
              <div style={{ display: 'flex', flexDirection: 'row', gap: '5rem' }}>
                <div style={{ flex: "1 1 auto"}}>
                  <p className="due-date"> Due Date: <input type="date" id="due-date" defaultValue={new Date(task.due_date).toISOString().split("T")[0]}></input>
                  </p>
                  <textarea
                    id="description"
                    defaultValue={task.description}
                    style={{ minWidth: "100%", whiteSpace: "pre-wrap" }}
                  ></textarea>
                </div>
                <div style={{ flex: '0 0 auto', textAlign: 'right' }}>
                  <p style={{ lineHeight: '1px' }}>Assigned:</p>
                  {assignment.members && assignment.members.length > 0 ? (
                    <div className="avatar-group">
                      {assignment.members.map((m) => (
                        <img
                          key={m.assignment_id}
                          src={`https://storage.googleapis.com/conference_planner_pfp/member/${m.member.member_id}.jpg`}
                          className="avatar"
                          alt={m.member.first_name}
                          title={`${m.member.first_name} ${m.member.last_name}`}
                          onError={(e) => { e.currentTarget.src = "https://storage.googleapis.com/conference_planner_pfp/unknown.jpg"; }}
                        />
                      ))}
                      <div className="member-dropdown" onClick={async () => {
                          toggleMember(memberClicked); 
                          await fetchCommitteeMembers(assignment); 
                          // await fetchCommitteeHeads(assignment); // UNCOMMENT IF COMMITTEE HEADS ARE TO BE DISPLAYED
                        }} style={{position: "relative"}}>
                        <img src={'/icons/edit-task/AddAssigned.svg'} className="add-assigned"></img>
                        <div className="member-content" style={{display: memberClicked ? "block" : "none"}}>
                          {/* Add all committee members for the selected committees */}
                          {committeeMembers.map((committee) => 
                            committee.map((m) => 
                              <p key={m.member.member_id}>{m.member.first_name} {m.member.last_name}</p>
                          ))}
                          {committeeHeads.map((committee) => 
                            committee.map((ch) => 
                              <p key={ch.committee_head_id}>{ch.first_name} {ch.last_name}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img src={'/icons/edit-task/AddAssigned.svg'} className="add-assigned"></img>
                  )}
                  {assignment.committees && assignment.committees.map((c) => (
                    <p key={c.task_committee_id}>
                      Committees: {c.committee.committee_name}
                    </p> 
                  ))}
                </div>
              </div>
              <div style={{display: 'flex', gap: '1rem'}}>
                <button type="submit" onClick={async (e) => 
                  { 
                    e.preventDefault(); 
                    await updateTask();
                    const refreshedTask = await fetch(`http://localhost:3000/task/${task.task_id}`).then(res => res.json());
                    setTask(refreshedTask);
                    const refreshedTasks = await fetch("http://localhost:3000/tasks").then(res => res.json());
                    setTasks(refreshedTasks);
                    setPanel(1); 
                  }}>Save</button>
                <button type="button" onClick={() => { setPanel(1) }}>Discard</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  ); 
}