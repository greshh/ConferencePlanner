import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import useUser from "../../hooks/useUser";
import "./style.css";

export const Sidebar = (user) => {
  // const { isLoading, user } = useUser();

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
            alt={user.first_name}
            title={`${user.first_name} ${user.last_name}`}
            onError={(e) => { e.currentTarget.src = "https://storage.googleapis.com/conference-planner/profile-pic/unknown.jpg"; }}
          />
          <p>{user.user.first_name} {user.user.last_name}</p>
        </div>
      ) : (
        <div/>
      )}
    </div>
  );
};
