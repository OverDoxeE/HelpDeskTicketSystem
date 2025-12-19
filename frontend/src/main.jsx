// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import TicketListPage from './pages/TicketListPage';
import TicketDetailsPage from './pages/TicketDetailsPage';
import AddTicketPage from './pages/AddTicketPage';
import UserPanelPage from './pages/UserPanelPage';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected: /tickets */}
          <Route
            path="/tickets"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <TicketListPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected: /tickets/:id */}
          <Route
            path="/tickets/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <TicketDetailsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected: /tickets/add */}
          <Route
            path="/tickets/add"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AddTicketPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected: /user */}
          <Route
            path="/user"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <UserPanelPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Deafult transfer /tickets */}
          <Route path="/" element={<Navigate to="/tickets" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
