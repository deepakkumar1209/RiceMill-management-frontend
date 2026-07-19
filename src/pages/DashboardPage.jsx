import {
  Box,
  Card,
  CardContent,
  Typography,
} from "@mui/material";

import Sidebar from "../components/Sidebar";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function DashboardPage() {
 const navigate = useNavigate();

useEffect(() => {
  const role =
    localStorage.getItem("role");

  if (role !== "SUPER_ADMIN") {
    navigate("/user-home");
  }
}, []);
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />

      <Box
        sx={{
          flex: 1,
          p: 4,
          bgcolor: "#F9FAFB",
          minHeight: "100vh",
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          mb={4}
        >
          Dashboard
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(250px,1fr))",
            gap: 3,
          }}
        >
          <Card>
            <CardContent>
              <Typography>Total Users</Typography>

              <Typography
                variant="h4"
                fontWeight="bold"
              >
                0
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography>Active Users</Typography>

              <Typography
                variant="h4"
                fontWeight="bold"
              >
                0
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography>Inactive Users</Typography>

              <Typography
                variant="h4"
                fontWeight="bold"
              >
                0
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}