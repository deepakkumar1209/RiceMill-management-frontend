import {
  Dashboard,
  Group,
  PersonAdd,
  Logout,
} from "@mui/icons-material";

import {
  Box,
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


import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
export default function Sidebar() {
  const navigate = useNavigate();
  const handleLogout = () => {
  localStorage.removeItem("token");

  navigate("/");
};
  return (
    <Box
  sx={{
    width: 240,
    bgcolor: "#0F172A",
    color: "#fff",
    minHeight: "100vh",
  }}
>
      <Typography
        sx={{
          p: 3,
          fontSize: 22,
          fontWeight: 700,
        }}
      >
        UMS
      </Typography>

      <List>
        <ListItemButton
          onClick={() => navigate("/dashboard")}
        >
          <ListItemIcon>
            <Dashboard sx={{ color: "#fff" }} />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>

        <ListItemButton
          onClick={() => navigate("/users")}
        >
          <ListItemIcon>
            <Group sx={{ color: "#fff" }} />
          </ListItemIcon>
          <ListItemText primary="Users" />
        </ListItemButton>

        <ListItemButton
          onClick={() => navigate("/create-user")}
        >
          <ListItemIcon>
            <PersonAdd sx={{ color: "#fff" }} />
          </ListItemIcon>
          <ListItemText primary="Create User" />
        </ListItemButton>
        <ListItemButton
  component={Link}
  to="/items"
>
  <ListItemIcon>
    <Inventory2
      sx={{ color: "#fff" }}
    />
  </ListItemIcon>

  <ListItemText primary="Items" />
</ListItemButton>

<ListItemButton
  onClick={() => navigate("/dpcs")}
>
  <ListItemIcon>
    <BusinessIcon
      sx={{ color: "#fff" }}
    />
  </ListItemIcon>

  <ListItemText primary="DPCs" />
</ListItemButton>
<ListItemButton
  onClick={() =>
    navigate("/warehouses")
  }
>
  <ListItemIcon>
    <WarehouseIcon
      sx={{ color: "#fff" }}
    />
  </ListItemIcon>

  <ListItemText
    primary="Warehouses"
  />
</ListItemButton>

<ListItemButton
  onClick={() =>
    navigate("/vehicles")
  }
>
  <ListItemIcon>
    <DirectionsCarIcon
      sx={{ color: "#fff" }}
    />
  </ListItemIcon>

  <ListItemText
    primary="Vehicles"
  />
</ListItemButton>

<ListItemButton
  onClick={() =>
    navigate("/customer-vendor")
  }
>
  <ListItemIcon>
    <BusinessCenterIcon
      sx={{ color: "#fff" }}
    />
  </ListItemIcon>

  <ListItemText
    primary="Customer/Vendor"
  />
</ListItemButton>

<ListItemButton
  onClick={() =>
    navigate("/legal-entity")
  }
>
  <ListItemIcon>
    <BusinessIcon
      sx={{ color: "#fff" }}
    />
  </ListItemIcon>

  <ListItemText
    primary="Legal Entity"
  />
</ListItemButton>
<ListItemButton
  onClick={() => navigate("/inwards")}
>
  <ListItemIcon>
    <MoveToInboxIcon
      sx={{ color: "#fff" }}
    />
  </ListItemIcon>

  <ListItemText primary="Inward" />
</ListItemButton>
<ListItemButton
  component={Link}
  to="/inward-list"
>
  <ListItemIcon>
    <ReceiptLongIcon 
    sx={{ color: "#fff" }}
    />
  </ListItemIcon>

  <ListItemText
    primary="Inward List"
  />
</ListItemButton>
<ListItemButton
  component={Link}
  to="/outwards"
>
  <ListItemIcon>
    <LocalShippingIcon
      sx={{ color: "#fff" }}
    />
  </ListItemIcon>

  <ListItemText
    primary="Outward"
  />
</ListItemButton>
<ListItemButton
  component={Link}
  to="/outward-list"
>
  <ListItemIcon>
    <ReceiptLongIcon
      sx={{ color: "#fff" }}
    />
  </ListItemIcon>

  <ListItemText
    primary="Outward List"
  />
</ListItemButton>
<ListItemButton
  onClick={() =>
    navigate("/monthly-report")
  }
>
  <ListItemIcon>
    <AssessmentIcon
      sx={{ color: "#fff" }}
    />
  </ListItemIcon>

  <ListItemText
    primary="Monthly Report"
  />
</ListItemButton>

      <ListItemButton onClick={handleLogout}>
  <ListItemIcon>
    <Logout sx={{ color: "#fff" }} />
  </ListItemIcon>
  <ListItemText primary="Logout" />
</ListItemButton>
      </List>
    </Box>
  );
}