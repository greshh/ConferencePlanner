import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'   
import { CookiesProvider } from 'react-cookie';
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDa3KmLYVsWByDc2ON9X5Wtj5twZhhMGAg",
  authDomain: "conference-planner-66620.firebaseapp.com",
  projectId: "conference-planner-66620",
  storageBucket: "conference-planner-66620.firebasestorage.app",
  messagingSenderId: "398062879672",
  appId: "1:398062879672:web:02e4c28edc21827065454d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CookiesProvider defaultSetOptions={{ path: '/' }}>
      <App />
    </CookiesProvider>
  </React.StrictMode>,
)
