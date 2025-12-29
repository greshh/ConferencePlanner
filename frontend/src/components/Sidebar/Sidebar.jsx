import React, { useEffect } from "react";
import "./style.css";

export const Sidebar = (user, USER_LOGIN) => {
  return (
    <div className='sidebar'>
      <div className='link'>
        <p>Task List</p>
      </div>
      {user.USER_LOGIN && user.user != null ? (
        <div className="user">
          <img
            src={`https://storage.googleapis.com/conference_planner_pfp/member/${user.user.member_id}.jpg`}
            className="user-avatar"
            alt={user.user.first_name}
            title={`${user.user.first_name} ${user.user.last_name}`}
            onError={(e) => { e.currentTarget.src = "https://storage.googleapis.com/conference_planner_pfp/unknown.jpg"; }}
          />
          <p>{user.user.first_name} {user.user.last_name}</p>
        </div>
      ) : (
        <div/>
      )}
    </div>
  );
};
