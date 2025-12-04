import React, { useState, useEffect } from "react";
import { loadAssigned } from "../../../hooks/loadAssigned";
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

  if (loading) return <p>Loading...</p>;
  if (assignment.error) return <p>Error: {assignment.error}</p>;

  return (
    <div className="task-selected">
      <div className="current-task">
        <div style={{margin: '4% 4%'}}>
          <h2>{selectedTask.task_name.toUpperCase()}</h2>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
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
            <p style={{ lineHeight: '1px' }}>Assigned:</p>
            {assignment.members && assignment.members.length > 0 ? (
              <div className="avatar-group">
                {assignment.members.map((m) => (
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
            {assignment.committees && assignment.committees.map((c) => (
              <p key={c.task_committee_id}>
                Committees: {c.committee.committee_name}
              </p> 
            ))}
            </div>
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