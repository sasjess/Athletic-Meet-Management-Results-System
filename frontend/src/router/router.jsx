import React from "react";
import { createBrowserRouter } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import About from "../pages/About";
import LoginForm from "../components/loginform";
import CreateResult from "../pages/CreateResult";
import Athletes from "../pages/Athletes";
import Schools from "../pages/Schools";
import Events from "../pages/Events";
import Meets from "../pages/Meets";

import ProtectedRoute from "../components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
  },

  {
    path: "/about",
    element: <About />,
  },

  {
    path: "/login",
    element: <LoginForm />,
  },

  // 🔴 PROTECTED ROUTES (ADMIN ONLY)

  {
    path: "/results",
    element: (
      <ProtectedRoute>
        <CreateResult />
      </ProtectedRoute>
    ),
  },

  {
    path: "/athletes",
    element: (
      <ProtectedRoute>
        <Athletes />
      </ProtectedRoute>
    ),
  },

  {
    path: "/events",
    element: (
      <ProtectedRoute>
        <Events />
      </ProtectedRoute>
    ),
  },

  {
    path: "/meets",
    element: (
      <ProtectedRoute>
        <Meets />
      </ProtectedRoute>
    ),
  },

  {
    path: "/schools",
    element: (
      <ProtectedRoute>
        <Schools />
      </ProtectedRoute>
    ),
  },
]);