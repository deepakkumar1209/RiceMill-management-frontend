import {
  Dashboard,
  Group,
  PersonAdd,
  Logout,
} from "@mui/icons-material";

import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import Inventory2 from "@mui/icons-material/Inventory2";
import BusinessIcon from "@mui/icons-material/Business";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AssessmentIcon from "@mui/icons-material/Assessment";


import { useNavigate, useLocation, Link } from "react-router-dom";

const navItems = [
  { path: "/dashboard", label: "Dashboard", Icon: Dashboard },
  { path: "/users", label: "Users", Icon: Group },
  { path: "/create-user", label: "Create User", Icon: PersonAdd },
  { path: "/items", label: "Items", Icon: Inventory2 },
  { path: "/dpcs", label: "DPCs", Icon: BusinessIcon },
  { path: "/warehouses", label: "Warehouses", Icon: WarehouseIcon },
  { path: "/vehicles", label: "Vehicles", Icon: DirectionsCarIcon },
  { path: "/customer-vendor", label: "Customer/Vendor", Icon: BusinessCenterIcon },
  { path: "/legal-entity", label: "Legal Entity", Icon: BusinessIcon },
  { path: "/inwards", label: "Inward", Icon: MoveToInboxIcon },
  { path: "/inward-list", label: "Inward List", Icon: ReceiptLongIcon },
  { path: "/outwards", label: "Outward", Icon: LocalShippingIcon },
  { path: "/outward-list", label: "Outward List", Icon: ReceiptLongIcon },
  { path: "/monthly-report", label: "Monthly Report", Icon: AssessmentIcon },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const itemSx = (active) => ({
    mx: 1.5,
    my: 0.3,
    px: 2,
    borderRadius: "10px",
    color: active ? "#fff" : "rgba(255,255,255,0.75)",
    bgcolor: active ? "rgba(255,255,255,0.12)" : "transparent",
    "&:hover": {
      bgcolor: "rgba(255,255,255,0.08)",
    },
  });

  const iconSx = (active) => ({
    color: active ? "#fff" : "rgba(255,255,255,0.75)",
    minWidth: 36,
  });

  return (
    <Box
      sx={{
        width: 240,
        flexShrink: 0,
        bgcolor: "#0F172A",
        color: "#fff",
        minHeight: "100vh",
        position: "sticky",
        top: 0,
        alignSelf: "flex-start",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography
        sx={{
          px: 3,
          py: 3,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "0.5px",
        }}
      >
        UMS
      </Typography>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.12)" }} />

      <List
        sx={{
          flex: 1,
          py: 1,
          overflowY: "auto",
        }}
      >
        {navItems.map(({ path, label, Icon }) => {
          const active = location.pathname === path;
          return (
            <ListItemButton
              key={path}
              component={Link}
              to={path}
              selected={active}
              sx={itemSx(active)}
            >
              <ListItemIcon sx={iconSx(active)}>
                <Icon fontSize="small" sx={{ color: "inherit" }} />
              </ListItemIcon>
              <ListItemText
                primary={label}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: active ? 600 : 500,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.12)" }} />

      <List sx={{ py: 1 }}>
        <ListItemButton onClick={handleLogout} sx={itemSx(false)}>
          <ListItemIcon sx={iconSx(false)}>
            <Logout fontSize="small" sx={{ color: "inherit" }} />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
          />
        </ListItemButton>
      </List>
    </Box>
  );
}
