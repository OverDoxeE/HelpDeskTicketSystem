import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar-root">
      <div className="navbar-inner">
        <div className="navbar-links">
          <NavLink to="/tickets" className="navbar-logo">
            HelpDesk
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink
                to="/tickets"
                className={({ isActive }) =>
                  "navbar-link" + (isActive ? " active" : "")
                }
              >
                Tickets
              </NavLink>
              <NavLink
                to="/tickets/add"
                className={({ isActive }) =>
                  "navbar-link" + (isActive ? " active" : "")
                }
              >
                New ticket
              </NavLink>
              <NavLink
                to="/user"
                className={({ isActive }) =>
                  "navbar-link" + (isActive ? " active" : "")
                }
              >
                User panel
              </NavLink>
            </>
          )}
        </div>
        <div>
          {isAuthenticated ? (
            <button className="navbar-logout-btn" onClick={handleLogout}>
              Logout ({user?.email || user?.username || "user"})
            </button>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                "navbar-link" + (isActive ? " active" : "")
              }
            >
              Login
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
