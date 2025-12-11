import React, { useState, useEffect } from "react";
import { loadAssigned } from "../../../hooks/loadAssigned";
import "./style.css";

export const EditTask = ({ task, setPanel, setTask, setTasks }) => {
  const [assignment, setAssignment] = useState({ members: [], committees: [] });
  const [memberListOpen, setMemberListOpen] = useState(false);
  const [committeeMembers, setCommitteeMembers] = useState([]); // Array by committee then by members
  const [committeeHeads, setCommitteeHeads] = useState([]); // Array by committee then by committee heads
  const [saving, setSaving] = useState(false);

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

  // Toggles the "Assigned" member list dropdown
  const toggleMemberList = (memberListOpen) => {
    const newValue = !memberListOpen;
    setMemberListOpen(newValue);
  }

  // Checks if a member is currently assigned to the task
  const checkMemberChecked = (memberId) => {
    return assignment.members.some((m) => m.member_id === memberId);
  }

  // This was copied from TaskBubble.jsx!!!
  const toggleMemberChecked = async (member) => {
    if (saving) return;
    const checked = checkMemberChecked(member.member_id);
    const newValue = !checked; // To be used for checkbox UI update

    // return newValue;
    // setChecked(newValue);
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:3000/update-assignment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: task.task_id, member_id: member.member_id }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      console.error("Failed to update task:", err);
      // setChecked(!newValue);
    } finally {
      setAssignment(await loadAssigned(task.task_id));
      setSaving(false);
      //return newValue;
    }
  };

  return (
    <div>
      <div className="task-selected">
        <div className="current-task">
          <form>
            <div className="task-flex">
                <div>
                  <input type="text" className="task-name" id="task-name" defaultValue={task.task_name} style={{ minWidth: '100%' }}></input>
                </div>
                <div style={{ textAlign: 'center' }}>
                  {task.completed == 1 ? (
                    <p><span style={{ backgroundColor: '#CAFFBF', color: '#355d3c', padding: '5px 10px', borderRadius: '5px' }}>Completed</span></p>
                  ) : (
                    <p><span style={{ backgroundColor: '#FFADAD', color: '#7a2e2e', padding: '5px 10px', borderRadius: '5px' }}>Incomplete</span></p>
                  )}
                </div>
                <div>
                  <p className="due-date"> Due Date: <input type="date" id="due-date" defaultValue={new Date(task.due_date).toISOString().split("T")[0]}></input></p>
                  <textarea
                    id="description"
                    defaultValue={task.description}
                    style={{ minWidth: "100%", marginTop: '1rem', whiteSpace: "pre-wrap" }}
                  ></textarea>
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
                    <div className="member-dropdown" onClick={async () => {
                        toggleMemberList(memberListOpen); 
                        await fetchCommitteeMembers(assignment); 
                        // await fetchCommitteeHeads(assignment); // UNCOMMENT IF COMMITTEE HEADS ARE TO BE DISPLAYED - see 10/12/2025
                      }} style={{position: "relative"}}>
                      <img src={'/icons/edit-task/AddAssigned.svg'} className="add-assigned"></img>
                      
                      {/* FOR MEMBERDROPDOWN COMPONENT */}
                      <div className="member-content" style={{display: memberListOpen ? "block" : "none"}}>
                        {/* Add all committee members for the selected committees */}
                        {committeeMembers.map((committee) => 
                          committee.map((m) => 
                            <div className="member-selection" key={m.member.member_id}>
                              {/* <div className="checkbox">
                                <div
                                  className={checked ? "check-checked" : "check-unchecked"}
                                  onClick={toggle}
                                  role="checkbox"
                                  aria-checked={checked}
                                  tabIndex={0}
                                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}
                                  style={{ cursor: saving ? 'wait' : 'pointer' }}
                                />
                              </div> */}
                              <p onClick={()=>toggleMemberChecked(m.member)}>{m.member.first_name} {m.member.last_name}</p>
                            </div>
                        ))}
                        {committeeHeads.map((committee) => 
                          committee.map((ch) => 
                            <div className="member-selection">
                              <p key={ch.committee_head_id}>{ch.first_name} {ch.last_name}</p>
                            </div>
                        ))}
                      </div>

                    </div>
                  </div>

                  <p style={{ lineHeight: '0.5rem' }}>Committees:</p>
                  {assignment.committees && assignment.committees.map((c) => (
                    <p key={c.task_committee_id} style={{ fontStyle: 'italic', lineHeight: '0.5rem' }}>
                      {c.committee.committee_name}
                    </p> 
                  ))}
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
            </div>
          </form>
        </div>
      </div>
    </div>
  ); 
}