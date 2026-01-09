import { createBrowserRouter, Router, RouterProvider } from "react-router-dom";
import React from "react";
import { TaskList } from "./screens/TaskList";

const routes = [
  {
    path: "/",
    element: <h1>Log-in page goes here</h1>
  }, 
  {
    path: "/tasks",
    element: <TaskList memberId='1' />
  }
]

const router = createBrowserRouter(routes);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;