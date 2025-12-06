import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import TicketListPage from "./pages/TicketListPage";
import TicketDetailsPage from "./pages/TicketDetailsPage";
import AddTicketPage from "./pages/AddTicketPage";
import UserPanelPage from "./pages/UserPanelPage";

import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";

function LoginPage() {
  return (
    <div>
      <h2>Login</h2>
      <LoginForm onSubmit={() => {}} />
    </div>
  );
}

export default LoginPage;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/tickets" replace />} />
              <Route path="/tickets" element={<TicketListPage />} />
              <Route path="/tickets/:id" element={<TicketDetailsPage />} />
              <Route path="/tickets/add" element={<AddTicketPage />} />
              <Route path="/user" element={<UserPanelPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);