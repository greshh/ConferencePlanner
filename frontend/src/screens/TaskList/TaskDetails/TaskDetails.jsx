import React, { useState, useEffect } from "react";
import { loadAssigned } from "../../../hooks/loadAssigned";
import "./style.css";

export const TaskDetails = ({ task, selectTask }) => {
  const [assignment, setAssignment] = useState({ members: [], committees: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignment = async () => {
      const data = await loadAssigned(task.task_id);
      setAssignment(data);
      setLoading(false);
    };
    fetchAssignment();
  }, [task.task_id]);

  if (loading) return <p>Loading...</p>;
  if (assignment.error) return <p>Error: {assignment.error}</p>;

  return (
    <div>
      <h2>{task.task_name.toUpperCase()}</h2>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
      <div>
        {task.due_date && (
          <p className="due-date">Due Date: {new Date(task.due_date).toISOString().split('T')[0]}</p>
        )}
        {task.description && <p>{task.description}</p>}
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
      <button onClick={() => selectTask(null)}>Close</button>
    </div>
  ); 
}