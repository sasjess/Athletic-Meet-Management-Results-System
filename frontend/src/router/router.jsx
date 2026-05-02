import React from "react";
import { createBrowserRouter } from "react-router";
import Dashboard from "../pages/Dashboard";
import About from "../pages/About";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
  },
  {
    path:"/about",
    element:<About/>
  }
]);