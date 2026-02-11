import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { LoadingSmall } from "../../components/LoadingSmall";
import "./style.css";

export const Login = ({ setUser, setCookie, development, setIsGuest }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const api_base = development ? "http://localhost:4000" : "";

  const navigate = useNavigate();

  async function logIn(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await signInWithEmailAndPassword(getAuth(), email, password).then(async (userCredential) => {
        setMessage("Success! Logging in.");
        const user = userCredential.user;
        setIsGuest(false);
        try {
          const res = await fetch(`${api_base}/api/members/login`, {
            method: 'POST',
            body: JSON.stringify({ uid: user.uid }),
            headers: { 'Content-Type': 'application/json' }
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          // Set cookie for the current user to stay logged in for 24 hours.
          setCookie("memberId", data.memberId, {path: "/", maxAge: 86400});
          setUser(data.memberId);
          navigate("/tasks");
        } catch (err) {
          console.log('Error during backend login:', err);
        }
      });
    } catch (err) {
      setMessage("Login failed. Please check your email and password.");
    }
    setSaving(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" , justifyContent: "center", height: "100vh"}}>
      <title>Conference Planner | Log In</title>
      <form onSubmit={(e)=>logIn(e)}>
        <div className="login-container">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <img src="./icons/login/YFC-9FCBE3.png" alt="YFC logo" style={{ height: "80px" }} />
            { message && <p style={{ fontStyle: "italic", fontSize: "13px", color: "grey" }}>{message}</p> }
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              { email && <label>{("Email address").toUpperCase()}</label> }
              <input 
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              { password && <label>{("Password").toUpperCase()}</label> }
              <input 
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button type="submit">Log In</button>
            {saving && <LoadingSmall />}
          </div>
          <Link 
            onClick={()=>setIsGuest(true)} 
            to={"/tasks"}
            className="guest-link"
            style={{ color: "#3b3b3b" }}
          >Continue as guest...</Link>
        </div>    
      </form>  
    </div>
  );
};