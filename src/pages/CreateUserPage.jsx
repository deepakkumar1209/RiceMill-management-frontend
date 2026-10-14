import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";

import Sidebar from "../components/Sidebar";
import { createUser } from "../services/userService";
import { useNavigate } from "react-router-dom";
import { Divider, Stack } from "@mui/material";
export default function CreateUserPage() {
 const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "",
    email: "",
    mobileNumber: "",
    plotNo: "",
    street: "",
    location: "",
    city: "",
    taluk: "",
    district: "",
    state: "",
    country: "",
    pinCode: "",
    fax: "",
    status: "Active",
  });

  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      await createUser(formData);

     setSuccess(true);

setTimeout(() => {
  navigate("/users");
}, 1500);

      setFormData({
        username: "",
        password: "",
        role: "",
        email: "",
        mobileNumber: "",
        plotNo: "",
        street: "",
        location: "",
        city: "",
        taluk: "",
        district: "",
        state: "",
        country: "",
        pinCode: "",
        fax: "",
        status: "Active",
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
  <Box sx={{ display: "flex" }}>
    <Sidebar />

    <Box
      sx={{
        flex: 1,
        p: 4,
        bgcolor: "#F8FAFC",
        minHeight: "100vh",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 1200,
          mx: "auto",
          borderRadius: 4,
          border: "1px solid #E5E7EB",
          p: 4,
          background: "#fff",
          boxShadow: "0px 10px 40px rgba(0,0,0,0.05)",
        }}
      >
        {/* Header */}
        <Box mb={4}>
          <Typography
            variant="h4"
            fontWeight={700}
            color="#111827"
          >
            Create New User
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: "#6B7280",
            }}
          >
            Add a new user to the User Management System
          </Typography>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Account Information */}
        <Typography
          variant="h6"
          fontWeight={600}
          mb={3}
        >
          Account Information
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              select
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <MenuItem value="Admin">
                Admin
              </MenuItem>

              <MenuItem value="User">
                User
              </MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <MenuItem value="Active">
                Active
              </MenuItem>

              <MenuItem value="Inactive">
                Inactive
              </MenuItem>
            </TextField>
          </Grid>
        </Grid>

        <Divider sx={{ my: 5 }} />

        {/* Contact Information */}
        <Typography
          variant="h6"
          fontWeight={600}
          mb={3}
        >
          Contact Information
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Mobile Number"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Fax"
              name="fax"
              value={formData.fax}
              onChange={handleChange}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 5 }} />

        {/* Address Information */}
        <Typography
          variant="h6"
          fontWeight={600}
          mb={3}
        >
          Address Information
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Plot No"
              name="plotNo"
              value={formData.plotNo}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Street"
              name="street"
              value={formData.street}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Taluk"
              name="taluk"
              value={formData.taluk}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="District"
              name="district"
              value={formData.district}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="State"
              name="state"
              value={formData.state}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Pin Code"
              name="pinCode"
              value={formData.pinCode}
              onChange={handleChange}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 5 }} />

        {/* Action Buttons */}
        <Stack
          direction="row"
          spacing={2}
          justifyContent="flex-end"
        >
         



          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            sx={{
              borderRadius: 2,
              px: 4,
              bgcolor: "#111827",
              "&:hover": {
                bgcolor: "#1F2937",
              },
            }}
          >
            Create User
          </Button>
        </Stack>
      </Paper>

      <Snackbar
        open={success}
        autoHideDuration={3000}
      >
        <Alert
          severity="success"
          variant="filled"
        >
          User Created Successfully
        </Alert>
      </Snackbar>
    </Box>
  </Box>
);
}