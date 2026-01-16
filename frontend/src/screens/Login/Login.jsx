import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import "./style.css";

export const Login = ({ setUser, development }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const api_base = development ? "http://localhost:4000" : "";

  const navigate = useNavigate();

  async function logIn() {
    try {
      await signInWithEmailAndPassword(getAuth(), email, password).then(async (userCredential) => {
        const user = userCredential.user;
        try {
          const res = await fetch(`${api_base}/api/members/login`, {
            method: 'POST',
            body: JSON.stringify({ uid: user.uid }),
            headers: { 'Content-Type': 'application/json' }
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          setUser(data.memberId);
          navigate("/tasks");
        } catch (err) {
          console.error('Error during backend login:', err);
        }
      });
    } catch (err) {
      setError(e.message);
      alert("Failed to log in: " + err.message);
    }
  }

  return (
    <>
      <h1>Log In</h1>
      {error && <p>{error}</p>}
      <input 
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input 
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={logIn}>Log In</button>
    </>
  );
};