import { createBrowserRouter, RouterProvider } from "react-router-dom";
import React from "react";
import { TaskList } from "./screens/TaskList";
import { Login } from "./screens/Login";

// If true, enable development settings.
const DEVELOPMENT = true;

function App() {
  const [user, setUser] = React.useState(null);

  const routes = [
    {
      path: "/",
      element: <Login setUser={setUser} development={DEVELOPMENT} />
    }, 
    {
      path: "/tasks",
      element: <TaskList memberId={user} development={DEVELOPMENT} />
    }
  ]
  
  const router = createBrowserRouter(routes);

  return (
    <RouterProvider router={router} />
  );
}

export default App;