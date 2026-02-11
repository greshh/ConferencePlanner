import React, { useState, useEffect } from "react";
import { parse } from "tldts";
import { loadAssigned } from "../../../hooks/loadAssigned";
import { Loading } from "../../../components/Loading";
import { MemberDropdown } from "../../../components/MemberDropdown/MemberDropdown";
import "./style.css";
import { PopUp } from "../../../components/PopUp/PopUp";
import { CommitteeDropdown } from "../../../components/CommitteeDropdown/CommitteeDropdown";
import { AttachmentDropdown } from "../../../components/AttachmentDropdown";

export const TaskDetails = ({ task, selectTaskId, setPanel, fetchTasks, memberId, userLogin, development }) => {
  const [currentTask, setCurrentTask] = useState(null);
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [assignment, setAssignment] = useState({ members: [], committees: [] });
  const [showPopup, setShowPopup] = useState(0); // 0 = No popup, 1 = Delete Task, 2 = Link, 3 = File, 4 = Delete Attachment
  const [currentAttachment, setCurrentAttachment] = useState(-1);
  const [saving, setSaving] = useState(false);

  const api_base = development ? "http://localhost:4000" : "";

  const updateNotes = async () => {
    const newNote = document.getElementById("notes").value;

    try {
      const res = await fetch(`${api_base}/api/assignments/notes/patch/${Number(notes.assignment_id)}`, {
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
      const data = await loadAssigned(task.task_id, development);
      setAssignment(data);  
    }
    const getUser = async () => {
      try {
        const res = await fetch(`${api_base}/api/members/${Number(memberId)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Failed to load member:", err);
        setError(err.message || "Failed to load member");
      }
    }
    const fetchNotes = async () => {
      const res = await fetch(`${api_base}/api/assignments/notes/get/${Number(task.task_id)}&${Number(memberId)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const notes = Array.isArray(data) ? data[0] : [];
      setNotes(notes);
    }
    userLogin && getUser();
    userLogin && fetchNotes();
    fetchAssigned();
  }, [task]);

  if (assignment.error) return <p>Error: {assignment.error}</p>;

  return (
    task != null && task.task_name != null && task.completed != null && task.due_date != null && task.description != null && assignment.members != null && assignment.committees != null && (!userLogin || (user != null && notes != null)) ? (
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
                    <p className="due-date">Due Date: <span style={{color: new Date(task.due_date) < new Date() ? "red" : "black", fontWeight: new Date(task.due_date) < new Date() ? "bold" : "normal"}}>{(() => {
                        const date = new Date(task.due_date);
                        const formatted =
                          String(date.getDate()).padStart(2, "0") + "/" +
                          String(date.getMonth() + 1).padStart(2, "0") + "/" +
                          date.getFullYear();
                        return formatted;
                      })()}
                      </span>
                    </p>
                  )}
                  {task.description && <p>{task.description}</p>}
                </div>
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
                    <h3>COMMITTEES</h3>
                    {(userLogin && user.is_committee_head == 1) && 
                      <CommitteeDropdown
                        task={task}
                        assignment={assignment}
                        setAssignment={setAssignment}
                        development={development}
                      />
                    }
                  </div>
                  {assignment.committees && assignment.committees.map((c) => (
                    <span className="committee" key={c.task_committee_id} style={{ backgroundColor: "#" + c.committee.colour }}>
                      {c.committee.committee_name}
                    </span> 
                  ))}
                </div>
                <div style={{ marginBottom: '2rem'}}>
                  <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>ATTACHMENTS</h3>
                    {(userLogin && user.is_committee_head == 1) && 
                      <AttachmentDropdown setShowPopup={setShowPopup} />
                    } 
                  </div>
                  <div className="attachments-section" >
                    {task.attachments != null && task.attachments.length > 0 ? (
                      task.attachments.map((a, index) => (
                        <p key={index}>
                          {a.type == "link" ? (
                            <img 
                              src="./icons/attachments/Link.svg"
                              style={{ cursor: "pointer" }}
                              title="Delete link?"
                              onClick={()=>{
                                setCurrentAttachment(index);
                                setShowPopup(4);
                              }}
                            />
                          ) : (
                            <img 
                              src="./icons/attachments/File.svg"
                              style={{ cursor: "pointer" }}
                              title="Delete file?"
                              onClick={()=>{
                                setCurrentAttachment(index);
                                setShowPopup(4);
                              }}
                            />
                          )}
                          <a href={a.link} target="_blank" rel="noopener noreferrer">{a.name ? a.name : parse(a.link).domain}</a>
                        </p>
                      ))
                    ) : (
                      <p style={{ color: 'black', fontStyle: 'italic', fontSize: 'smaller' }}>Nothing has been attached!</p>
                    )}
                  </div>
                </div>
                <div style={{ marginBottom: '1.5rem'}}>
                  <h3 style={{ marginBottom: '0' }}>NOTES</h3>
                  <p style={{ fontStyle: 'italic', marginTop: '0', marginBottom: '0.5rem' }}>(For personal reference only)</p>
                  {userLogin ? (
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
                        src={`https://storage.googleapis.com/conference-planner/profile-pic/member/${m.member.member_id}.jpg`}
                        className="avatar"
                        alt={m.member.first_name}
                        title={`${m.member.first_name} ${m.member.last_name}`}
                        onError={(e) => { e.currentTarget.src = "https://storage.googleapis.com/conference_planner_pfp/unknown.jpg"; }}
                      />
                    )
                  )) : (
                    <div/>
                  )}
                  {(userLogin && user.is_committee_head == 1) && 
                    <MemberDropdown 
                      task={task} 
                      assignment={assignment} 
                      setAssignment={setAssignment}
                      development={development} 
                    />
                  }
                </div>
              </div>
              {(userLogin && user.is_committee_head == 1) ? (
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <button onClick={() => setPanel(2)}>Edit</button>
                  <button onClick={() => setShowPopup(1)}>Delete</button>
                  <button onClick={() => {selectTaskId(null); setPanel(0);}}>Close</button>
                </div>
              ) : (
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <button onClick={() => {selectTaskId(null); setPanel(0);}}>Close</button>
                </div>
              )}
            </div>
          </div>
        </div>
        {showPopup == 1 && (
          <div className="popup-backdrop">
            <PopUp 
              message="Are you sure you want to delete this task?" 
              options={[
                {
                  label: "Yes, I'm sure",
                  onClick: async () => {
                    setSaving(true);
                    const res = await fetch(`${api_base}/api/tasks/delete/${Number(task.task_id)}`, {
                      method: "DELETE",
                    });
                    if (!res.ok) {
                      console.error(`Failed to delete task: HTTP ${res.status}`);
                      setShowPopup(0);
                      return;
                    }
                    fetchTasks();
                    setSaving(false);
                    setPanel(0);
                  }
                },
                {
                  label: "Cancel",
                  onClick: () => { setShowPopup(0); }
                }
              ]}
              saving={saving}
              cancelOnClick={()=>setShowPopup(0)}
            />
          </div>
        )}
        {showPopup == 2 && (
          <div className="popup-backdrop">
            <PopUp 
              message="Link" 
              options={[
                {
                  label: "Add",
                  onClick: async () => 
                    {
                      setSaving(true);
                      const inputLink = document.getElementById("link").value;
                      const linkName = document.getElementById("attachment-name").value;

                      if (!inputLink) {
                        alert("Please enter a URL");
                        return;
                      }
                      
                      try {
                        const link = await fetch(`${api_base}/api/url`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ url: inputLink })
                        });
                        const data = await link.json();

                        if (data.error) {
                          alert("Invalid URL - Please try another URL");
                          return;
                        }
  
                        const newLink = {
                          type: "link",
                          link: data.resolvedUrl,
                          name: linkName
                        };

                        if (!task.attachments) {
                          task.attachments = [];
                        }

                        task.attachments.push(newLink);
  
                        await fetch(`${api_base}/api/tasks/patch/${Number(task.task_id)}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ attachments: task.attachments })
                        });
                      } catch (err) {
                        return err.message;
                      }
                      setSaving(false);
                      setShowPopup(0); 
                    }
                }, 
                {
                  label: "Cancel",
                  onClick: () => { setShowPopup(0); }
                }
              ]}
              saving={saving}
              cancelOnClick={()=>{setShowPopup(0)}}
            />
          </div>
        )}
        {showPopup == 3 && (
          <div className="popup-backdrop">
            <PopUp  
              inputFile="True"
              options={[
                {
                  label: "Add",
                  onClick: async () => {
                      const input = document.getElementById("file");
                      const fileName = document.getElementById("attachment-name").value;

                      const inputFile = input.files[0];
                      if (!inputFile) {
                        alert("Please attach a file");
                        return;
                      }

                      const data = new FormData();
                      data.append("task_id", task.task_id);
                      data.append("file_name", fileName);
                      data.append("file", inputFile);

                      setSaving(true);
                      try {
                        const res = await fetch(`${api_base}/api/upload-file`, {
                          method: "PATCH",
                          body: data
                        });

                        const body = await res.json();

                        const newFile = {
                          type: "file",
                          link: body.file_url,
                          name: body.file_name
                        };

                        if (!task.attachments) {
                          task.attachments = [];
                        }

                        task.attachments.push(newFile);

                        await fetch(`${api_base}/api/tasks/patch/${Number(task.task_id)}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ attachments: task.attachments })
                        });
                      } catch (err) {
                        return err.message;
                      }
                    setSaving(false);
                    setShowPopup(0); 
                  }
                }, 
                {
                  label: "Cancel",
                  onClick: () => { setShowPopup(0); }
                }
              ]}
              saving={saving}
              cancelOnClick={()=>{setShowPopup(0)}}
            />
          </div>
        )}
        {showPopup == 4 && currentAttachment != -1 && (
          <div className="popup-backdrop">
            <PopUp 
              message="Are you sure you want to delete this attachment?" 
              options={[
                {
                  label: "Yes, I'm sure",
                  onClick: async () => {
                    setSaving(true);
                    const res = await fetch(`${api_base}/api/tasks/attachments/delete/${Number(task.task_id)}&${currentAttachment}`, {
                      method: "DELETE",
                    });
                    if (!res.ok) {
                      console.error(`Failed to delete attachment: HTTP ${res.status}`);
                      setCurrentAttachment(-1);
                      setShowPopup(0);
                      return;
                    }
                    setSaving(false);
                    fetchTasks();
                    setShowPopup(0);
                  }
                },
                {
                  label: "Cancel",
                  onClick: () => { 
                    setCurrentAttachment(-1);
                    setShowPopup(0); 
                  }
                }
              ]}
              saving={saving}
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