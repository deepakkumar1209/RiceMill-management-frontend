import {
  Box,
  Paper,
  Typography,
} from "@mui/material";

export default function UserHomePage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#F8FAFC",
        p: 5,
      }}
    >
      <Paper
        sx={{
          p: 4,
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
        >
          Welcome User
        </Typography>

        <Typography
          sx={{ mt: 2 }}
        >
          Login successful.
        </Typography>
      </Paper>
    </Box>
  );
}