import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useCookies } from "react-cookie";
import { TaskList } from "./screens/TaskList";
import { Login } from "./screens/Login";

// If true, enable development settings.
const DEVELOPMENT = true;

function App() {
  const [user, setUser] = React.useState(null);
  const [cookies, setCookie, removeCookie] = useCookies(['memberId']);

  const routes = [
    {
      path: "/",
      element: <Login setUser={setUser} setCookie={setCookie} development={DEVELOPMENT} />
    }, 
    {
      path: "/tasks",
      element: <TaskList memberId={user} cookies={cookies} removeCookie={removeCookie} development={DEVELOPMENT} />
    }
  ]
  
  const router = createBrowserRouter(routes);

  return (
    <RouterProvider router={router} />
  );
}

export default App;