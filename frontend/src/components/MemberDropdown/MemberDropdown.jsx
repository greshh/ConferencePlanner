import React, { useState, useEffect, useRef } from "react";
import { loadAssigned } from "../../hooks/loadAssigned";
import "./style.css";

export const MemberDropdown = ({ task, assignment, setAssignment, development } ) => {
  const [memberListOpen, setMemberListOpen] = useState(false);
  const [committeeMembers, setCommitteeMembers] = useState([]); // Array by committee then by members
  const [saving, setSaving] = useState(false);
  const ref = useRef(null);

  const api_base = development ? "http://localhost:4000" : "";

  const fetchCommitteeMembers = async (assignment) => {
    const members = [];
    for (const c of assignment.committees) {
      try {
        const res = await fetch(`${api_base}/api/memberships/${Number(c.committee.committee_id)}`);
        const data = await res.json();
        members.push(data);
      } catch (err) {
        console.error("Failed to load committee members:", err);
      }
    }
    setCommitteeMembers(members);
  };

  // Toggles the "Assigned" member list dropdown
  const toggleMemberList = (memberListOpen) => {
    const newValue = !memberListOpen;
    setMemberListOpen(newValue);
  }

  // Checks if a member is currently assigned to the task
  const checkMemberChecked = (memberId) => {
    return assignment.members.some((m) => m.member.member_id == memberId);
  }

  const toggleMemberChecked = async (member) => {
    if (saving) return;
    const checked = checkMemberChecked(member.member_id);
    let newValue = !checked; // To be used for checkbox UI update

    setSaving(true);
    try {
      const res = await fetch(`${api_base}/api/assignments/patch`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: Number(task.task_id), member_id: Number(member.member_id) }),
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
        setMemberListOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
  })

  return (
    <div className="member-dropdown" ref={ref} style={{position: "relative"}}>  
      <img onClick={async () => {
        toggleMemberList(memberListOpen); 
        await fetchCommitteeMembers(assignment); 
      }} src={'./icons/edit-task/AddAssigned.svg'} className="add-assigned"
      data-testid="member-dropdown-button"></img>
      <div className="member-content" style={{ display: memberListOpen ? "block" : "none" }}>
        {/* Add all committee members for the selected committees */}
        {committeeMembers.map((committee) => 
          committee.map((m) => 
            <div className="member-selection" key={m.member.member_id}>
              <div className="checkbox">
                <div
                  className={checkMemberChecked(m.member.member_id) ? "check-checked" : "check-unchecked"}
                  onClick={()=>toggleMemberChecked(m.member)}
                  role="checkbox"
                  aria-checked={()=>checkMemberChecked(m.member.member_id)}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}
                  style={{ cursor: saving ? 'wait' : 'pointer' }}
                />
              </div>
              <p onClick={()=>toggleMemberChecked(m.member)}>{m.member.first_name} {m.member.last_name}</p>
            </div>
        ))}
      </div>
    </div>
  )
};