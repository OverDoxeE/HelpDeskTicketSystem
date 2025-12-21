import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  const linkStyle = ({ isActive }) => ({
    marginRight: '12px',
    textDecoration: isActive ? 'underline' : 'none',
  });

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '10px 20px',
        borderBottom: '1px solid #ddd',
      }}
    >
      <span style={{ fontWeight: 'bold', marginRight: '16px' }}>HelpDesk</span>

      {isAuthenticated && (
        <>
          <NavLink to="/tickets" style={linkStyle}>
            Tickets
          </NavLink>
          <NavLink to="/tickets/new" style={linkStyle}>
            New ticket
          </NavLink>
          <NavLink to="/user-panel" style={linkStyle}>
            User panel
          </NavLink>
          <button
            onClick={logout}
            style={{
              marginLeft: 'auto',
              padding: '6px 12px',
              cursor: 'pointer',
            }}
          >
            Logout {user?.email && `(${user.email})`}
          </button>
        </>
      )}

      {!isAuthenticated && (
        <NavLink to="/login" style={linkStyle}>
          Login
        </NavLink>
      )}
    </nav>
  );
}

export default Navbar;
