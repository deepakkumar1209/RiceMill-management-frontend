import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Chip,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";

import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import {
  getUsers,
  updateUser,
  deleteUser,
} from "../services/userService";

const initialFormData = {
  username: "",
  password: "",
  role: "",
  status: "Active",
  email: "",
  mobileNumber: "",
  fax: "",
  plotNo: "",
  street: "",
  location: "",
  city: "",
  taluk: "",
  district: "",
  state: "",
  country: "",
  pinCode: "",
};

export default function UserListPage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let active = true;
    getUsers()
      .then((data) => {
        if (active) setUsers(data);
      })
      .catch((error) => console.log(error));
    return () => {
      active = false;
    };
  }, []);

  const handleEdit = (user) => {
    setEditId(user._id);
    setFormData({
      username: user.username || "",
      password: "",
      role: user.role || "",
      status: user.status || "Active",
      email: user.email || "",
      mobileNumber: user.mobileNumber || "",
      fax: user.fax || "",
      plotNo: user.plotNo || "",
      street: user.street || "",
      location: user.location || "",
      city: user.city || "",
      taluk: user.taluk || "",
      district: user.district || "",
      state: user.state || "",
      country: user.country || "",
      pinCode: user.pinCode || "",
    });
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setEditId(null);
    setFormData(initialFormData);
  };

  const handleEditChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateUser = async () => {
    try {
      await updateUser(editId, formData);
      setSnackbar({
        open: true,
        message: "User Updated Successfully",
        severity: "success",
      });
      handleCloseEdit();
      loadUsers();
    } catch (error) {
      console.log(error);
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message || "Failed to update user",
        severity: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this user?");

    if (!confirmDelete) return;

    try {
      await deleteUser(id);
      setSnackbar({
        open: true,
        message: "User Deleted Successfully",
        severity: "success",
      });
      loadUsers();
    } catch (error) {
      console.log(error);
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message || "Failed to delete user",
        severity: "error",
      });
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      user.email
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, minHeight: "100vh" }}>
      <Sidebar />

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          width: "100%",
          p: { xs: 2, sm: 3, md: 4 },
          bgcolor: "#F8FAFC",
          minHeight: "100vh",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight={700}
              color="#111827"
            >
              Users
            </Typography>

            <Typography
              sx={{
                color: "#6B7280",
                mt: 1,
              }}
            >
              Manage users and their access permissions
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() =>
              navigate("/create-user")
            }
            sx={{
              bgcolor: "#111827",
              borderRadius: "12px",
              px: 3,
              height: 45,
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                bgcolor: "#1F2937",
              },
            }}
          >
            Create User
          </Button>
        </Box>

        {/* Search */}
        <Paper
          sx={{
            p: 2,
            borderRadius: 3,
            mb: 3,
            boxShadow:
              "0px 5px 20px rgba(0,0,0,0.05)",
          }}
        >
          <TextField
            fullWidth
            placeholder="Search by username or email..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Paper>

        {/* Table */}
        <Paper
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            boxShadow:
              "0px 5px 20px rgba(0,0,0,0.05)",
          }}
        >
          <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
            <Table sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor: "#F9FAFB",
                  }}
                >
                  <TableCell
                    sx={{ fontWeight: 700 }}
                  >
                    Username
                  </TableCell>

                  <TableCell
                    sx={{ fontWeight: 700 }}
                  >
                    Role
                  </TableCell>

                  <TableCell
                    sx={{ fontWeight: 700 }}
                  >
                    Status
                  </TableCell>

                  <TableCell
                    sx={{ fontWeight: 700 }}
                  >
                    Mobile Number
                  </TableCell>

                  <TableCell
                    sx={{ fontWeight: 700 }}
                  >
                    Email
                  </TableCell>

                  <TableCell
                    sx={{ fontWeight: 700 }}
                    align="center"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow
                      key={user._id}
                      hover
                    >
                      <TableCell
                        sx={{
                          fontWeight: 600,
                        }}
                      >
                        {user.username}
                      </TableCell>

                      <TableCell>
                        {user.role}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={user.status}
                          color={
                            user.status ===
                            "Active"
                              ? "success"
                              : "error"
                          }
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        {
                          user.mobileNumber
                        }
                      </TableCell>

                      <TableCell>
                        {user.email}
                      </TableCell>

                      <TableCell
                        align="center"
                      >
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(user)}
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          color="error"
                          onClick={() => handleDelete(user._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      align="center"
                      sx={{
                        py: 4,
                        color: "#6B7280",
                      }}
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Edit User Dialog */}
        <Dialog
          open={openEdit}
          onClose={handleCloseEdit}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            Edit User
          </DialogTitle>
          <DialogContent dividers>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              mb={2}
            >
              Account Information
            </Typography>
            <Grid container spacing={2} mb={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  name="password"
                  placeholder="Leave blank to keep current password"
                  value={formData.password}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Role"
                  name="role"
                  value={formData.role}
                  onChange={handleEditChange}
                >
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="User">User</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleEditChange}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography
              variant="subtitle1"
              fontWeight={600}
              mb={2}
            >
              Contact Information
            </Typography>
            <Grid container spacing={2} mb={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  value={formData.email}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Mobile Number"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Fax"
                  name="fax"
                  value={formData.fax}
                  onChange={handleEditChange}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography
              variant="subtitle1"
              fontWeight={600}
              mb={2}
            >
              Address Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Plot No"
                  name="plotNo"
                  value={formData.plotNo}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Street"
                  name="street"
                  value={formData.street}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Taluk"
                  name="taluk"
                  value={formData.taluk}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="District"
                  name="district"
                  value={formData.district}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Pin Code"
                  name="pinCode"
                  value={formData.pinCode}
                  onChange={handleEditChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              variant="outlined"
              onClick={handleCloseEdit}
              sx={{ textTransform: "none", borderRadius: "10px" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleUpdateUser}
              sx={{
                bgcolor: "#111827",
                textTransform: "none",
                borderRadius: "10px",
                fontWeight: 600,
                "&:hover": { bgcolor: "#1F2937" },
              }}
            >
              Update User
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={5000}
          onClose={() =>
            setSnackbar({ ...snackbar, open: false })
          }
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <Alert
            severity={snackbar.severity}
            variant="filled"
            onClose={() =>
              setSnackbar({ ...snackbar, open: false })
            }
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}