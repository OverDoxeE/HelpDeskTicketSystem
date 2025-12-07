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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/tickets" />} />
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
