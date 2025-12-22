// frontend/src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { UiProvider } from "./context/UiContext";

import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import TicketListPage from "./pages/TicketListPage";
import TicketDetailsPage from "./pages/TicketDetailsPage";
import AddTicketPage from "./pages/AddTicketPage";
import UserPanelPage from "./pages/UserPanelPage";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <UiProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected layout */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/tickets" element={<TicketListPage />} />
              <Route path="/tickets/add" element={<AddTicketPage />} />
              <Route path="/tickets/:id" element={<TicketDetailsPage />} />
              <Route path="/user" element={<UserPanelPage />} />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/tickets" replace />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/tickets" replace />} />
          </Routes>
        </BrowserRouter>
      </UiProvider>
    </AuthProvider>
  </React.StrictMode>
);
