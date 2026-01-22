import React, { useState, useEffect, useRef } from "react";
import { loadAssigned } from "../../hooks/loadAssigned";
import "./style.css";

export const CommitteeDropdown = ({ task, assignment, setAssignment, development } ) => {
  const [committees, setCommittees] = useState([]);
  const [committeeListOpen, setCommitteeListOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef(null);

  const api_base = development ? "http://localhost:4000" : "";

  const fetchCommittees = async () => {
    try {
      const res = await fetch(`${api_base}/api/committees`);
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
    return assignment.committees.some((m) => m.committee_id == committeeId);
  }

  const toggleCommitteeChecked = async (committee) => {
    if (saving) return;
    const checked = checkCommitteeChecked(committee.committee_id);
    let newValue = !checked; // To be used for checkbox UI update
    setSaving(true);

    try {
      const assigned = await fetch(`${api_base}/api/members/assigned`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: task.task_id, committee_id: committee.committee_id }),
      });
      if (!assigned.ok) {
        throw new Error(`HTTP ${assigned.status}`);
      }
      const assignedData = await assigned.json();
      // If unchecking and there are assigned members, prevent uncheck
      if (assignedData.length > 0 && !newValue) {
        alert("Cannot unassign committee while members are assigned to this task.");
        newValue = checked;
        return;
      }
      const res = await fetch(`${api_base}/api/task_committees/patch`, {
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
      setAssignment(await loadAssigned(task.task_id, development));
      setSaving(false);
      return newValue;
    }
  };

  useEffect(()=>{
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setCommitteeListOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
  })

  return (
    <div className="committee-dropdown" ref={ref} style={{position: "relative"}}>  
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
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCommitteeChecked(committee); } }}
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