import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <div>
        <NavLink to="/tickets" style={{ marginRight: '1rem' }}>Tickets</NavLink>
        <NavLink to="/tickets/add" style={{ marginRight: '1rem' }}>Add Ticket</NavLink>
        <NavLink to="/user">User Panel</NavLink>
      </div>
      <div>
        {user ? (
          <>
            <span style={{ marginRight: '1rem' }}>{user.email}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <NavLink to="/login">Login</NavLink>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
