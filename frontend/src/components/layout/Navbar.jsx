import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const linkStyle = ({ isActive }) => ({
    marginRight: "12px",
    textDecoration: isActive ? "underline" : "none",
  });

  const handleLogout = () => {
    logout();             
    navigate("/login");    
  };

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 20px",
        borderBottom: "1px solid #ddd",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <NavLink to="/tickets" style={{ fontWeight: "bold", marginRight: "16px" }}>
          HelpDesk
        </NavLink>

        {isAuthenticated && (
          <>
            <NavLink to="/tickets" style={linkStyle}>
              Tickets
            </NavLink>

            {/* tu MUSI być /tickets/add jeśli tak masz w main.jsx */}
            <NavLink to="/tickets/add" style={linkStyle}>
              New ticket
            </NavLink>

            <NavLink to="/user" style={linkStyle}>
              User panel
            </NavLink>
          </>
        )}
      </div>

      <div>
        {isAuthenticated ? (
          <button onClick={handleLogout}>
            Logout ({user?.email || user?.username || "user"})
          </button>
        ) : (
          <NavLink to="/login" style={linkStyle}>
            Login
          </NavLink>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
