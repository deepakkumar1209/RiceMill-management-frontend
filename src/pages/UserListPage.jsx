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
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";

import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import { getUsers } from "../services/userService";

export default function UserListPage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.log(error);
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
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
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
          <TableContainer>
            <Table>
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
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          color="error"
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
      </Box>
    </Box>
  );
}