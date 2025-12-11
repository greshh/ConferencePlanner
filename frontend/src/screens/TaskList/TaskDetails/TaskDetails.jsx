import React, { useState, useEffect } from "react";
import { loadAssigned } from "../../../hooks/loadAssigned";
import { MemberDropdown } from "../../../components/MemberDropdown/MemberDropdown";
import "./style.css";

export const TaskDetails = ({ task, selectTask, setPanel }) => {
  const [assignment, setAssignment] = useState({ members: [], committees: [] });
  const [loading, setLoading] = useState(true);
  const [selectedTask, setTask] = useState(task);

  useEffect(() => {
    const fetchAssignment = async () => {
      const data = await loadAssigned(selectedTask.task_id);
      setAssignment(data);
      setLoading(false);
    };
    fetchAssignment();
  }, [selectedTask.task_id]);

  if (assignment.error) return <p>Error: {assignment.error}</p>;

  return (
    <div className="task-selected">
      <div className="current-task">
        <div className="task-flex">
          <div>
            <h2>{selectedTask.task_name.toUpperCase()}</h2>
          </div>
          <div style={{ textAlign: 'right', marginRight: '1vw' }}>
            {task.completed == 1 ? (
              <p><span style={{ backgroundColor: '#CAFFBF', color: '#355d3c', padding: '5px 10px', borderRadius: '5px' }}>Completed</span></p>
            ) : (
              <p><span style={{ backgroundColor: '#FFADAD', color: '#7a2e2e', padding: '5px 10px', borderRadius: '5px' }}>Incomplete</span></p>
            )}
          </div>
          <div>
            {selectedTask.due_date && (
              <p className="due-date">Due Date: {(() => {
                const date = new Date(selectedTask.due_date);
                const formatted =
                  String(date.getDate()).padStart(2, "0") + "/" +
                  String(date.getMonth() + 1).padStart(2, "0") + "/" +
                  date.getFullYear();
                return formatted;
              })()}
              </p>
            )}
            {selectedTask.description && <p>{selectedTask.description}</p>}
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
            <p style={{ lineHeight: '0.5rem' }}>Committees:</p>
            {assignment.committees && assignment.committees.map((c) => (
              <p key={c.task_committee_id} style={{ fontStyle: 'italic', lineHeight: '0.5rem' }}>
                {c.committee.committee_name}
              </p> 
            ))}
          </div>
          <div style={{display: 'flex', gap: '1rem'}}>
            <button onClick={() => setPanel(2)}>Edit</button>
            <button onClick={() => {selectTask(null); setPanel(0);}}>Close</button>
          </div>
        </div>
      </div>
    </div>
  ); 
}