import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import { login } from "../services/authService";
import Backdrop from "@mui/material/Backdrop";
import {
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const navigate = useNavigate();
const [loading, setLoading] = useState(false);

const [success, setSuccess] = useState(false);

const [error, setError] = useState(false);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

const handleLogin = async () => {
  try {
    setLoading(true);

    const data = await login(formData);

    localStorage.setItem("token", data.token);
localStorage.setItem("role", data.role);
setSuccess(true);

setTimeout(() => {
  setLoading(false);
  if (data.role === "SUPER_ADMIN") {
  navigate("/dashboard");
} else {
  navigate("/user-home");
}
}, 2000);
  } catch (err) {
    setLoading(false);

    setError(true);
  }
};

  return (
  <Box
  sx={{
    width: "100vw",
    minHeight: "100vh",
    background: "#ffffff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }}

>
      <Paper
        elevation={0}
        sx={{
          width: 430,
          p: 5,
          borderRadius: 4,
          backgroundColor: "#FFFFFF",
          border: "1px solid #E5E7EB",
          boxShadow:
            "0px 20px 60px rgba(0,0,0,0.08)",
        }}
      >
        {/* Logo */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "2px",
              color: "#111827",
            }}
          >
            USER MANAGEMENT SYSTEM
          </Typography>

          <Typography
            sx={{
              fontSize: "13px",
              color: "#6B7280",
              mt: 0.5,
            }}
          >
            Administration Portal
          </Typography>
        </Box>

        {/* Heading */}
        <Typography
          sx={{
            fontSize: "34px",
            fontWeight: 700,
            color: "#111827",
            textAlign: "center",
            mb: 1,
          }}
        >
          Sign In
        </Typography>

        <Typography
          sx={{
            textAlign: "center",
            color: "#6B7280",
            fontSize: "14px",
            mb: 4,
          }}
        >
          Access your workspace securely
        </Typography>

        {/* Username */}
        <Typography
          sx={{
            mb: 1,
            fontSize: "13px",
            fontWeight: 600,
            color: "#374151",
          }}
        >
          Username
        </Typography>

        <TextField
          fullWidth
          size="small"
          name="username"
          placeholder="Enter username"
          value={formData.username}
          onChange={handleChange}
          sx={{
            mb: 3,
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              backgroundColor: "#fff",
            },
          }}
        />

        {/* Password */}
        <Typography
          sx={{
            mb: 1,
            fontSize: "13px",
            fontWeight: 600,
            color: "#374151",
          }}
        >
          Password
        </Typography>

        <TextField
          fullWidth
          size="small"
          type="password"
          name="password"
          placeholder="Enter password"
          value={formData.password}
          onChange={handleChange}
          sx={{
            mb: 4,
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              backgroundColor: "#fff",
            },
          }}
        />

        {/* Login Button */}
   <Button
  fullWidth
  variant="contained"
  onClick={handleLogin}
  disabled={loading}
  sx={{
    height: 50,
    borderRadius: "12px",
    bgcolor: "#111827",
    textTransform: "none",
    fontWeight: 600,
  }}
>
  {loading ? (
    <CircularProgress
      size={24}
      sx={{ color: "#fff" }}
    />
  ) : (
    "Sign In"
  )}
</Button>
<Snackbar
  open={success}
  autoHideDuration={2000}
>
  <Alert
    severity="success"
    variant="filled"
  >
    Login Successful
  </Alert>
</Snackbar>

<Snackbar
  open={error}
  autoHideDuration={2000}
>
  <Alert
    severity="error"
    variant="filled"
  >
    Invalid Username or Password
  </Alert>
</Snackbar>

        {/* Footer */}
        <Typography
          sx={{
            textAlign: "center",
            mt: 4,
            fontSize: "12px",
            color: "#9CA3AF",
          }}
        >
          © 2026 User Management System
        </Typography>
      </Paper>
    <Backdrop
  sx={{
    color: "#fff",
    zIndex: 9999,
    flexDirection: "column",
    gap: 2,
  }}
  open={loading}
>
  <CircularProgress color="inherit" />

  <Typography>
    Signing in...
  </Typography>
</Backdrop>
    </Box>
    
  );
}