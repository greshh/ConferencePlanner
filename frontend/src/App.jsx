import { createBrowserRouter, Router, RouterProvider } from "react-router-dom";
import React from "react";
import { TaskList } from "./screens/TaskList";

// If true, enable development settings. This must also be updated on the backend.
const DEVELOPMENT = true;

const routes = [
  {
    path: "/",
    element: <button onClick={() => { window.location.href = "/tasks"; }}>Go to Task List</button>
  }, 
  {
    path: "/tasks",
    element: <TaskList memberId={8} development={DEVELOPMENT} />
  }
]

const router = createBrowserRouter(routes);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;