import { useState } from "react";
import {
  Dashboard,
  Group,
  PersonAdd,
  Logout,
  Menu as MenuIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  Stack,
  Chip,
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
  { path: "/dpcs", label: "Godown", Icon: BusinessIcon },
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const currentNav = navItems.find((item) => item.path === location.pathname);
  const currentLabel = currentNav?.label || "UMS";

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

  const renderNavList = (onItemClick) => (
    <>
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
              onClick={onItemClick}
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
        <ListItemButton
          onClick={() => {
            if (onItemClick) onItemClick();
            handleLogout();
          }}
          sx={itemSx(false)}
        >
          <ListItemIcon sx={iconSx(false)}>
            <Logout fontSize="small" sx={{ color: "inherit" }} />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
          />
        </ListItemButton>
      </List>
    </>
  );

  return (
    <>
      {/* ==========================================================
          1. MOBILE TOP APP BAR & SLIDE-OUT DRAWER (< md)
      =========================================================== */}
      <Box sx={{ display: { xs: "block", md: "none" }, width: "100%", position: "sticky", top: 0, zIndex: 1100 }}>
        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: "#0F172A",
            borderBottom: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <Toolbar
            sx={{
              justifyContent: "space-between",
              px: { xs: 1.5, sm: 2 },
              minHeight: "56px !important",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <IconButton
                color="inherit"
                edge="start"
                onClick={() => setMobileOpen(true)}
                sx={{
                  p: 0.8,
                  bgcolor: "rgba(255,255,255,0.08)",
                  borderRadius: "10px",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
                }}
              >
                <MenuIcon fontSize="small" />
              </IconButton>

              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 800,
                  letterSpacing: "0.5px",
                  color: "#fff",
                }}
              >
                UMS
              </Typography>

              <Chip
                label={currentLabel}
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.12)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  height: 24,
                  border: "1px solid rgba(255,255,255,0.18)",
                }}
              />
            </Stack>

            <IconButton
              color="inherit"
              onClick={handleLogout}
              size="small"
              sx={{
                p: 0.8,
                bgcolor: "rgba(239,68,68,0.12)",
                color: "#F87171",
                borderRadius: "10px",
                "&:hover": { bgcolor: "rgba(239,68,68,0.22)" },
              }}
              title="Logout"
            >
              <Logout fontSize="small" />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Mobile Drawer */}
        <Drawer
          anchor="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          PaperProps={{
            sx: {
              width: 270,
              bgcolor: "#0F172A",
              color: "#fff",
              display: "flex",
              flexDirection: "column",
              boxSizing: "border-box",
            },
          }}
        >
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: "0.5px",
                color: "#fff",
              }}
            >
              UMS
            </Typography>
            <IconButton
              onClick={() => setMobileOpen(false)}
              sx={{ color: "rgba(255,255,255,0.7)" }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.12)" }} />

          {renderNavList(() => setMobileOpen(false))}
        </Drawer>
      </Box>

      {/* ==========================================================
          2. DESKTOP PERMANENT SIDEBAR (>= md)
      =========================================================== */}
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
          display: { xs: "none", md: "flex" },
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

        {renderNavList(undefined)}
      </Box>
    </>
  );
}