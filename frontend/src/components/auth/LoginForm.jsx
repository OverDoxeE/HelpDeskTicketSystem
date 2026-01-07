import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

function LoginForm({ onSubmit, loading = false, disabled = false }) {
  const [values, setValues] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [remember, setRemember] = useState(false);

  const validate = (vals) => {
    const errs = {};
    if (!vals.email) errs.email = "Username or email is required";
    if (!vals.password) errs.password = "Password is required";
    return errs;
  };

  const handleChange = (e) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
    setTouched((t) => ({ ...t, [e.target.name]: true }));
  };

  const handleBlur = (e) => {
    setTouched((t) => ({ ...t, [e.target.name]: true }));
    setErrors(validate({ ...values, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    setTouched({ email: true, password: true });
    if (Object.keys(errs).length === 0) {
      onSubmit({ email: values.email, password: values.password });
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ width: "100%", mt: 1 }}
      noValidate
      autoComplete="off"
    >
      <TextField
        label="Username or email"
        name="email"
        type="text"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        margin="normal"
        fullWidth
        autoFocus
        required
        error={Boolean(errors.email && touched.email)}
        helperText={touched.email && errors.email}
        disabled={loading || disabled}
      />
      <TextField
        label="Password"
        name="password"
        type={showPassword ? "text" : "password"}
        value={values.password}
        onChange={handleChange}
        onBlur={handleBlur}
        margin="normal"
        fullWidth
        required
        error={Boolean(errors.password && touched.password)}
        helperText={touched.password && errors.password}
        disabled={loading || disabled}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                edge="end"
                tabIndex={-1}
                disabled={loading || disabled}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: 1,
          mb: 2,
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              disabled={loading || disabled}
              size="small"
              color="primary"
            />
          }
          label="Remember me"
          sx={{ ml: -1 }}
        />
        <Link href="#" variant="body2" underline="hover" sx={{ fontSize: 14 }}>
          Forgot password?
        </Link>
      </Box>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        size="large"
        disabled={loading || disabled}
        sx={{ mt: 1, mb: 1.5, borderRadius: 2, fontWeight: 600 }}
        endIcon={
          loading ? <CircularProgress size={22} color="inherit" /> : null
        }
      >
        {loading ? "Logging in..." : "Login"}
      </Button>
    </Box>
  );
}

export default LoginForm;
