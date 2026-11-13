import {
  Box,
  Card,
  CardContent,
  Typography,
} from "@mui/material";

import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers } from "../services/userService";

export default function DashboardPage() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  useEffect(() => {
    const role = localStorage.getItem("role");

    if (role !== "SUPER_ADMIN") {
      navigate("/user-home");
      return;
    }

    let isMounted = true;

    getUsers()
      .then((data) => {
        if (!isMounted || !Array.isArray(data)) return;
        const total = data.length;
        const active = data.filter(
          (u) => (u.status || "").toLowerCase() === "active"
        ).length;
        const inactive = total - active;

        setStats({
          total,
          active,
          inactive,
        });
      })
      .catch((error) => {
        console.log(error);
      });

    return () => {
      isMounted = false;
    };
  }, [navigate]);
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
                {stats.total}
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
                {stats.active}
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
                {stats.inactive}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}