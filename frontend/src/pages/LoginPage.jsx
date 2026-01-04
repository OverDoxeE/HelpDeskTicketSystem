import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";
import {
  Grid,
  Card,
  Typography,
  Alert,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import "./LoginPage.css";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleSubmit = async ({ email, password }) => {
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      setError("");
      navigate("/tickets");
    } catch (e) {
      setError("Login failed");
      console.error("Login error", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`login-root${isMobile ? " login-root-mobile" : ""}`}>
      <Grid container className="login-grid">
        {/* Left gradient section */}
        <Grid
          item
          xs={12}
          md={7}
          className={`login-left${isMobile ? " login-left-mobile" : ""}`}
        >
          <div className="login-left-decor">
            <div className="decor-shape decor-shape-1" />
            <div className="decor-shape decor-shape-2" />
            <div className="decor-shape decor-shape-3" />
          </div>
          <div className="login-left-content">
            <Typography variant="h3" fontWeight={700} gutterBottom>
              Welcome to HelpDesk
            </Typography>
            <Typography
              variant="h6"
              fontWeight={400}
              className="login-left-desc"
            >
              Streamline your IT support.
              <br />
              Fast, reliable ticket management for your enterprise.
            </Typography>
          </div>
        </Grid>
        {/* Right card section */}
        <Grid
          item
          xs={12}
          md={5}
          className={`login-right${isMobile ? " login-right-mobile" : ""}`}
        >
          <Card elevation={4} className="login-card">
            <Typography variant="h5" fontWeight={600} mb={2}>
              User Login
            </Typography>
            {error && (
              <Alert severity="error" className="login-alert">
                {error}
              </Alert>
            )}
            <LoginForm
              onSubmit={handleSubmit}
              loading={loading}
              disabled={loading}
            />
            <Box className="login-card-spacer" />
            <Typography
              variant="caption"
              color="text.secondary"
              className="login-footer"
            >
              HelpDesk Ticket System
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}

export default LoginPage;
