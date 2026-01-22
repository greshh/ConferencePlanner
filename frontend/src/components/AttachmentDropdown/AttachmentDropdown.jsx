import React, { useState, useRef, useEffect } from "react";
import "./style.css";

export const AttachmentDropdown = ({ setShowPopup }) => {
  const [attachmentListOpen, setAttachmentListOpen] = useState(false);
  const ref = useRef(null);

  useEffect(()=>{
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setAttachmentListOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
  })

  // Toggles the "Attachments" list dropdown
  const toggleAttachmentList = (attachmentListOpen) => {
    const newValue = !attachmentListOpen;
    setAttachmentListOpen(newValue);
  }

  return (
    <div className="attachment-dropdown" ref={ref} style={{position: "relative"}}>  
      <img onClick={() => {
        toggleAttachmentList(attachmentListOpen); 
      }} src={'./icons/edit-task/SmallAddButton.svg'} className="small-add-button" style={{ zIndex: 1 }}></img>
      <div className="attachment-content" style={{ display: attachmentListOpen ? "block" : "none", zIndex: 500 }}>
        <div className="attachment-selection" onClick={()=>setShowPopup(2)}>
          <img src="./icons/attachments/Link.svg" className="icon"></img>
          <p>Link</p>
        </div>
        <div className="attachment-selection" onClick={()=>setShowPopup(3)}>
          <img src="./icons/attachments/File.svg" className="icon"></img>
          <p>File</p>
        </div>
      </div>
    </div>
  )
};