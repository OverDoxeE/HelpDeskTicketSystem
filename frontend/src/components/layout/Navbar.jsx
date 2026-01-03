import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Link,
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setAnchorEl(null);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleUserPanel = () => {
    navigate("/user");
    setAnchorEl(null);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link
            component={RouterLink}
            to="/tickets"
            color="inherit"
            underline="none"
          >
            HelpDesk
          </Link>
        </Typography>
        {isAuthenticated && (
          <>
            <Button
              component={RouterLink}
              to="/tickets"
              color="inherit"
              variant={({ isActive }) => (isActive ? "contained" : "text")}
            >
              Tickets
            </Button>
            <Button
              component={RouterLink}
              to="/tickets/add"
              color="inherit"
              variant={({ isActive }) => (isActive ? "contained" : "text")}
            >
              New ticket
            </Button>
          </>
        )}
        {isAuthenticated ? (
          <div>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar>
                <AccountCircle />
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleUserPanel}>User panel</MenuItem>
              <MenuItem onClick={handleLogout}>
                Logout ({user?.email || user?.username || "user"})
              </MenuItem>
            </Menu>
          </div>
        ) : (
          <Button
            component={RouterLink}
            to="/login"
            color="inherit"
            variant={({ isActive }) => (isActive ? "contained" : "text")}
          >
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
