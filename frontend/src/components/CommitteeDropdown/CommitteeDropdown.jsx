import React, { useState } from "react";
import { loadAssigned } from "../../hooks/loadAssigned";
import "./style.css";

export const CommitteeDropdown = ({ task, assignment, setAssignment } ) => {
  const [committees, setCommittees] = useState([]);
  const [committeeListOpen, setCommitteeListOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchCommittees = async () => {
    try {
      const res = await fetch(`/api/committees`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Failed to load committees:", err);
      return [];
    }
  };

  // Toggles the "Committees" list dropdown
  const toggleMemberList = (committeeListOpen) => {
    const newValue = !committeeListOpen;
    setCommitteeListOpen(newValue);
  }

  // Checks if a committee is currently assigned to the task
  const checkCommitteeChecked = (committeeId) => {
    return assignment.committees.some((m) => m.committee.committee_id == committeeId);
  }

  const toggleCommitteeChecked = async (committee) => {
    if (saving) return;
    const checked = checkCommitteeChecked(committee.committee_id);
    let newValue = !checked; // To be used for checkbox UI update

    setSaving(true);
    try {
      const res = await fetch(`/api/task_committees/patch`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: task.task_id, committee_id: committee.committee_id }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      console.error("Failed to update task:", err);
      newValue = checked; // Revert optimistic UI update
    } finally {
      setAssignment(await loadAssigned(task.task_id));
      setSaving(false);
      return newValue;
    }
  };

  return (
    <div className="committee-dropdown" style={{position: "relative"}}>  
      <img onClick={async () => {
        toggleMemberList(committeeListOpen); 
        setCommittees(await fetchCommittees()); 
      }} src={'./icons/edit-task/SmallAddButton.svg'} className="small-add-button" style={{ zIndex: 1 }}></img>
      <div className="committee-content" style={{ display: committeeListOpen ? "block" : "none", zIndex: 501 }}>
        {/* Add all committees */}
        {committees.map((committee) => 
          <div className="committee-selection" key={committee.committee_id}>
            <div className="checkbox">
              <div
                className={checkCommitteeChecked(committee.committee_id) ? "check-checked" : "check-unchecked"}
                onClick={()=>toggleCommitteeChecked(committee)}
                role="checkbox"
                aria-checked={()=>checkCommitteeChecked(committee.committee_id)}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}
                style={{ cursor: saving ? 'wait' : 'pointer' }}
              />
            </div>
            <p onClick={()=>toggleCommitteeChecked(committee)}>{committee.committee_name}</p>
          </div>
        )}
      </div>
    </div>
  )
};