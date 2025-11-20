// src/pages/AppLayout.jsx
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import AppNavbar from "../components/Navbar";
import "../App.css";


export default function AppLayout() {
  const location = useLocation();
  
  // Hide navbar on specific routes
  const hideNavbar = location.pathname === '/products' || location.pathname === '/dashboard' || location.pathname === '/customers' || location.pathname === '/stock-adjustments' || location.pathname === '/receipts' || location.pathname === '/vendors' || location.pathname === '/ai-chat';
  
  return (
    <div className="App">
      {/* Conditionally render navbar */}
      {!hideNavbar && <AppNavbar />}

      {/* Main content area */}
      <main style={{ 
        minHeight: "calc(100vh - 56px)",
        paddingTop: hideNavbar ? '0' : '56px' // Adjust padding based on navbar
      }}>
        <Outlet />
      </main>
    </div>
  );
}