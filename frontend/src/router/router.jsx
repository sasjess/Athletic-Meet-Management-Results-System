import React from "react";
import { createBrowserRouter } from "react-router";
import Dashboard from "../pages/Dashboard";
import About from "../pages/About";
import LoginForm from "../components/loginform";
import CreateResult from "../pages/CreateResult";
import Athletes from "../pages/Athletes";
import Schools from "../pages/Schools";
import Events from "../pages/Events";
import Meets from "../pages/Meets";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
  },
  {
    path:"/about",
    element:<About/>
  },
  {
    path:"/login",
    element:<LoginForm/>
  },
  {
    path:"/results",
   element:<CreateResult />
  },
  {
    path:"/athletes",
   element:<Athletes /> ,
  },
  {
    path:"/events",
   element:<Events /> ,
  },
  {
    path:"/meets",
   element:<Meets /> ,
  },
  {
    path:"/schools",
   element:<Schools /> ,
  }
]);
