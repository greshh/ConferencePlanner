import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import "./style.css";

export const Sidebar = ({ isGuest, user, removeCookie }) => {
  const auth = getAuth();
  const navigate = useNavigate();

  return (
    <div className='sidebar'>
      <div className='link'>
        <Link to="/tasks" data-testid="task-list-link"><p>Task List</p></Link>
      </div>
      <div className='link'>
        <a href="https://docs.google.com/document/d/1v2e3fIhM6KM30S5cfCp1gpxPsXA5bGL4RyVZB91J5YQ/edit?usp=sharing" target="_blank"><p>Help (Manual)</p></a>
      </div>
      <div className='link'>
        <a href="https://forms.gle/MRo12D7DQBanGgD39" target="_blank"><p>Feedback</p></a>
      </div>
      {!isGuest && user != null ? (
        <div className="user">
          <img
            src={`https://storage.googleapis.com/conference-planner/profile-pic/member/${user.member_id}.jpg`}
            className="user-avatar"
            title={"Sign Out"}
            onError={(e) => { e.currentTarget.src = "https://storage.googleapis.com/conference-planner/profile-pic/unknown.jpg"; }}
            onClick={()=>{
              signOut(auth).then(() => {
                removeCookie('memberId');
                navigate("/");
              }).catch((err) => {
                console.log("Unable to log out:", err.message);
              });
            }}
            style={{ cursor: "pointer" }}
          />
          <p>{user.first_name} {user.last_name}</p>
        </div>
      ) : (
          <Link to={"/"} style={{ fontWeight: "bold", fontStyle: "italic", paddingLeft: "1vw", color: "black" }} className="user">
              Log In
          </Link>
      )}
    </div>
  );
};
