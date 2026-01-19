import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import "./style.css";

export const Sidebar = ({ user, removeCookie }) => {
  const auth = getAuth();
  const navigate = useNavigate();

  return (
    <div className='sidebar'>
      <div className='link'>
        <Link to="/tasks"><p>Task List</p></Link>
      </div>
      {user != null ? (
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
        <div/>
      )}
    </div>
  );
};
