import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Homepage";
import Login from "./pages/Login";
import DashboardPage from "./pages/DashboardPage";
import ProductPage from "./pages/ProductPage";
import AppLayout from "./pages/AppLayout";
import PrivateRoute from "./components/PrivateRoute";
import AiChatWidget from './components/AiChatWidget';
import { AuthProvider } from "./contexts/AuthContext";
import CustomerPage from "./pages/CustomerPage";
import StockAdjustmentPage from "./pages/StockAdjustmentPage";
import ReceiptPage from "./pages/ReceiptPage";
import VendorPage from "./pages/VendorPage";
import  DashboardSettings  from './components/DashboardSettings';   // <-- add import

import CookieConsent from './components/CoockieConsent';


export default function App() {
  return (
    <AuthProvider>
      <Router>
        <CookieConsent/>
        
        <Routes>
          {/* Public routes - Will use Homepage.css */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
<Route path="settings" element={<DashboardSettings />} />
          {/* Protected routes - Will use DashboardPage.css */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <AppLayout />
                
              </PrivateRoute>
            }
          >
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="products" element={<ProductPage />} />
            
            <Route path="customers" element={<CustomerPage />} />
            <Route path="stock-adjustments" element={<StockAdjustmentPage />} />
            <Route path="vendors" element={<VendorPage />} />
            <Route path="receipts" element={<ReceiptPage />} />
           {/*  IMPORTANT:  render the widget as a real page  */}
           <Route path="ai-chat" element={<AiChatWidget />} />
           <Route path="settings" element={<DashboardSettings />} /> 
          </Route>

          <Route path="*" element={<HomePage />} />
        </Routes>

        {/*  REMOVED:  <AiChatWidget />   <-- no longer always on screen */}
      </Router>
    </AuthProvider>
  );
}