import React from "react";
import Sidebar from "../sidebar/Sidebar";
import "./../../pages/Dashboard.css";

const Layout = ({ children }) => {
  return (
    <div className="dashboard-layout">
      {/* Reusable Sidebar */}
      <Sidebar />

      {/* Page Content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;