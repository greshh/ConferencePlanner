import React, { useState } from "react";
import { loadAssigned } from "../../hooks/loadAssigned";
import "./style.css";

export const MemberDropdown = ({ task, assignment, setAssignment } ) => {
  const [memberListOpen, setMemberListOpen] = useState(false);
  const [committeeMembers, setCommitteeMembers] = useState([]); // Array by committee then by members
  const [committeeHeads, setCommitteeHeads] = useState([]); // Array by committee then by committee heads
  const [saving, setSaving] = useState(false);

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
    const newValue = !checked; // To be used for checkbox UI update

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
      newValue = checked; // Revert optimistic UI update
    } finally {
      setAssignment(await loadAssigned(task.task_id));
      setSaving(false);
      return newValue;
    }
  };

  return (
    <div className="member-dropdown" style={{position: "relative"}}>  
      <img onClick={async () => {
        toggleMemberList(memberListOpen); 
        await fetchCommitteeMembers(assignment); 
        // await fetchCommitteeHeads(assignment); // UNCOMMENT IF COMMITTEE HEADS ARE TO BE DISPLAYED - see 10/12/2025
      }} src={'/icons/edit-task/AddAssigned.svg'} className="add-assigned"></img>
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
        {committeeHeads.map((committee) => 
          committee.map((ch) => 
            <div className="member-selection">
              <p key={ch.committee_head_id}>{ch.first_name} {ch.last_name}</p>
            </div>
        ))}
      </div>
    </div>
  )
};