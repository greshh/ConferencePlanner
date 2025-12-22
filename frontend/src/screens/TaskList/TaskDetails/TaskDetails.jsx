import React, { useState, useEffect } from "react";
import { loadAssigned } from "../../../hooks/loadAssigned";
import { Loading } from "../../../components/Loading";
import { MemberDropdown } from "../../../components/MemberDropdown/MemberDropdown";
import "./style.css";
import { PopUp } from "../../../components/PopUp/PopUp";
import { CommitteeDropdown } from "../../../components/CommitteeDropdown/CommitteeDropdown";

export const TaskDetails = ({ task, selectTaskId, setPanel, fetchTasks, memberId, USER_LOGIN }) => {
  const [notes, setNotes] = useState([]);
  const [assignment, setAssignment] = useState({ members: [], committees: [] });
  const [showPopup, setShowPopup] = useState(false);

  const updateNotes = async () => {
    const newNote = document.getElementById("notes").value;

    try {
      const res = await fetch(`http://localhost:3000/update-notes/${notes.assignment_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personal_notes: newNote }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      console.error("Failed to update notes:", err);
    }
  };

  useEffect(() => {
    const fetchAssigned = async () => {
      const data = await loadAssigned(task.task_id);
      setAssignment(data);
    }
    const fetchNotes = async () => {
      const res = await fetch(`http://localhost:3000/notes/${task.task_id}/${memberId.memberId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const notes = Array.isArray(data) ? data[0] : [];
      setNotes(notes);
    }
    USER_LOGIN && fetchNotes();
    fetchAssigned();
  }, [task]);

  if (assignment.error) return <p>Error: {assignment.error}</p>;

  return (
    task != null && task.task_name != null && task.completed != null && task.due_date != null && task.description != null && assignment.members != null && assignment.committees != null && (!USER_LOGIN || notes != null) ? (
      <div>
        <div className="task-selected">
          <div className="current-task">
            <div className="task-flex-grid">
              <div>
                <h2>{task.task_name?.toUpperCase()}</h2>
              </div>
              {task.completed != null ? (
                <div style={{ textAlign: 'right', marginRight: '1vw' }}>
                  {task.completed == 1 ? (
                    <p><span style={{ backgroundColor: '#CAFFBF', color: '#355d3c', padding: '5px 10px', borderRadius: '5px' }}>Completed</span></p>
                  ) : (
                    <p><span style={{ backgroundColor: '#FFADAD', color: '#7a2e2e', padding: '5px 10px', borderRadius: '5px' }}>Incomplete</span></p>
                  )}
                </div>
              ) : ( <div/> )}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  {task.due_date && (
                    <p className="due-date">Due Date: {(() => {
                      const date = new Date(task.due_date);
                      const formatted =
                        String(date.getDate()).padStart(2, "0") + "/" +
                        String(date.getMonth() + 1).padStart(2, "0") + "/" +
                        date.getFullYear();
                      return formatted;
                    })()}
                    </p>
                  )}
                  {task.description && <p>{task.description}</p>}
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
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
                <div style={{ marginBottom: '1.5rem'}}>
                  <h3 style={{ marginBottom: '0' }}>NOTES</h3>
                  <p style={{ fontStyle: 'italic', marginTop: '0', marginBottom: '0.5rem' }}>(For personal reference only)</p>
                  {USER_LOGIN ? (
                      <textarea
                        id="notes"
                        defaultValue={notes != null && notes.personal_notes != null ? notes.personal_notes : ""}
                        maxLength="1000"
                        style={{ minWidth: "100%", height: "3rem", whiteSpace: "pre-wrap" }}
                        onChange={async () => await updateNotes()}
                      ></textarea>
                    ) :
                      <textarea
                        id="notes"
                        disabled
                        style={{ minWidth: "100%", height: "3rem" }}
                      ></textarea>
                  }
                </div>
                <div style={{ marginBottom: '1.5rem'}}>
                  <h3 style={{ marginBottom: '0' }}>COMMENTS</h3>
                  <p style={{ fontStyle: 'italic', fontSize: 'smaller', marginTop: '0' }}>Coming soon...</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ marginBottom: '1px', marginTop: 0 }}>Assigned:</p>
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
              <div style={{display: 'flex', gap: '0.5rem'}}>
                <button onClick={() => setPanel(2)}>Edit</button>
                <button onClick={() => setShowPopup(true)}>Delete</button>
                <button onClick={() => {selectTaskId(null); setPanel(0);}}>Close</button>
              </div>
            </div>
          </div>
        </div>
        {showPopup && (
          <div className="popup-backdrop">
            <PopUp 
              message="Are you sure you want to delete this task?" 
              options={[
                {
                  label: "Yes, I'm sure",
                  onClick: async () => {
                    const res = await fetch(`http://localhost:3000/delete-task/${task.task_id}`, {
                      method: "DELETE",
                    });
                    if (!res.ok) {
                      console.error(`Failed to delete task: HTTP ${res.status}`);
                      setShowPopup(false);
                      return;
                    }
                    fetchTasks();
                    setPanel(0);
                  }
                },
                {
                  label: "Cancel",
                  onClick: () => { setShowPopup(false); }
                }
              ]}
            />
          </div>
        )}
      </div>
    ) : (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '90vh' }}>
        <Loading />
      </div>
    )
  ); 
}