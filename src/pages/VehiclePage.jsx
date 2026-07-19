import { useEffect, useState } from "react";

import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import Sidebar from "../components/Sidebar";

import {
  createVehicle,
  getVehicles,
  updateVehicle,
  deleteVehicle,
} from "../services/vehicleService";

export default function VehiclePage() {
    const [success, setSuccess] =
      useState(false);

  const [vehicles,
setVehicles] =
useState([]);

const [editId,
setEditId] =
useState(null);

const [message,
setMessage] =
useState("");

const [
deleteSuccess,
setDeleteSuccess,
] = useState(false);

  const [formData, setFormData] =
    useState({
      vehicleNumber: "",
      vehicleType: "",
      driverName: "",
      mobileNumber: "",
      fuelType: "",
    });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  useEffect(() => {
  loadVehicles();
}, []);

const loadVehicles =
async () => {
  const data =
    await getVehicles();

  setVehicles(data);
};

const handleSubmit =
async () => {
  try {

    if(editId){

      await updateVehicle(
        editId,
        formData
      );

      setMessage(
        "Vehicle Updated Successfully"
      );

    }else{

      await createVehicle(
        formData
      );

      setMessage(
        "Vehicle Saved Successfully"
      );

    }

    loadVehicles();

    setSuccess(true);

    setFormData({
      vehicleNumber: "",
      vehicleType: "",
      driverName: "",
      mobileNumber: "",
      fuelType: "",
    });

    setEditId(null);

  } catch(error){
    console.log(error);
  }
};
const handleEdit =
(vehicle) => {

  setEditId(
    vehicle._id
  );

  setFormData({
    vehicleNumber:
      vehicle.vehicleNumber,

    vehicleType:
      vehicle.vehicleType,

    driverName:
      vehicle.driverName,

    mobileNumber:
      vehicle.mobileNumber,

    fuelType:
      vehicle.fuelType,
  });

  window.scrollTo({
    top: 0,
    behavior:
      "smooth",
  });
};
const handleDelete =
async (id) => {

  const ok =
    window.confirm(
      "Delete Vehicle?"
    );

  if(!ok) return;

  await deleteVehicle(id);

  setDeleteSuccess(
    true
  );

  loadVehicles();
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
          sx={{
            p: 4,
            borderRadius: "20px",
            border:
              "1px solid #E5E7EB",
            boxShadow:
              "0 10px 30px rgba(0,0,0,0.05)",
          }}
        >
          <Typography
            variant="h4"
            fontWeight={700}
          >
            Vehicle Master
          </Typography>

          <Typography
            sx={{
              color: "#6B7280",
              mt: 1,
              mb: 4,
            }}
          >
            Create and manage
            vehicles
          </Typography>

          <Box
            sx={{
              mb: 4,
              pb: 2,
              borderBottom:
                "1px solid #E5E7EB",
            }}
          >
            <Typography
              variant="h6"
              fontWeight={600}
            >
              Vehicle Information
            </Typography>
          </Box>

          <Grid
            container
            spacing={3}
          >
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Vehicle Number"
                name="vehicleNumber"
                value={
                  formData.vehicleNumber
                }
                onChange={
                  handleChange
                }
              />
            </Grid>

           <Grid size={{ xs: 10, md: 2 }}>
             <TextField
  select
  fullWidth
  label="Vehicle Type"
  name="vehicleType"
  value={formData.vehicleType}
  onChange={handleChange}
>
  <MenuItem value="Own">Own</MenuItem>

  <MenuItem value="Rent">Rent</MenuItem>
</TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Driver Name"
                name="driverName"
                value={
                  formData.driverName
                }
                onChange={
                  handleChange
                }
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Mobile Number"
                name="mobileNumber"
                value={
                  formData.mobileNumber
                }
                onChange={
                  handleChange
                }
              />
            </Grid>

            <Grid size={{ xs: 10, md: 2 }}>
              <TextField
                select
                fullWidth
                label="Fuel Type"
                name="fuelType"
                value={
                  formData.fuelType
                }
                onChange={
                  handleChange
                }
              >
                <MenuItem value="Petrol">
                  Petrol
                </MenuItem>

                <MenuItem value="Diesel">
                  Diesel
                </MenuItem>

                <MenuItem value="Electric">
                  Electric
                </MenuItem>

                <MenuItem value="CNG">
                  CNG
                </MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <Box
            sx={{
              mt: 5,
              pt: 3,
              borderTop:
                "1px solid #E5E7EB",
              display: "flex",
              justifyContent:
                "flex-end",
              gap: 2,
            }}
          >
              <Button
    variant="outlined"
    onClick={() => {
      setEditId(null);

      setFormData({
        vehicleNumber: "",
        vehicleType: "Own",
        driverName: "",
        mobileNumber: "",
        fuelType: "Diesel",
      });
    }}
  >
    Cancel
  </Button>

            <Button
  variant="contained"
  onClick={handleSubmit}
  sx={{
    bgcolor:"#111827",
    px:4,
  }}
>
  {editId
    ? "Update Vehicle"
    : "Save Vehicle"}
</Button>
          </Box>
        </Paper>

        <Paper
  sx={{
    mt:4,
    borderRadius:"20px",
    overflow:"hidden",
  }}
>
  <TableContainer>
    <Table>
      <TableHead>
        <TableRow>

          <TableCell>
            Vehicle No
          </TableCell>

          <TableCell>
            Vehicle Type
          </TableCell>

          <TableCell>
            Driver
          </TableCell>

          <TableCell>
            Mobile
          </TableCell>

          <TableCell>
            Fuel
          </TableCell>

          <TableCell>
            Actions
          </TableCell>

        </TableRow>
      </TableHead>

      <TableBody>
        {vehicles.map(
          (vehicle) => (
            <TableRow
              key={
                vehicle._id
              }
            >

              <TableCell>
                {
                  vehicle.vehicleNumber
                }
              </TableCell>

              <TableCell>
                {
                  vehicle.vehicleType
                }
              </TableCell>

              <TableCell>
                {
                  vehicle.driverName
                }
              </TableCell>

              <TableCell>
                {
                  vehicle.mobileNumber
                }
              </TableCell>

              <TableCell>
                {
                  vehicle.fuelType
                }
              </TableCell>

              <TableCell>

                <Button
                  size="small"
                  variant="contained"
                  sx={{
                    mr:1,
                    bgcolor:
                    "#111827",
                  }}
                  onClick={() =>
                    handleEdit(
                      vehicle
                    )
                  }
                >
                  Edit
                </Button>

                <Button
                  size="small"
                  color="error"
                  variant="contained"
                  onClick={() =>
                    handleDelete(
                      vehicle._id
                    )
                  }
                >
                  Delete
                </Button>

              </TableCell>

            </TableRow>
          )
        )}
      </TableBody>
    </Table>
  </TableContainer>
</Paper>

<Snackbar
  open={success}
  autoHideDuration={5000}
  onClose={() =>
    setSuccess(false)
  }
  anchorOrigin={{
    vertical:"top",
    horizontal:"right",
  }}
>
  <Alert
    severity="success"
    variant="filled"
  >
    {message}
  </Alert>
</Snackbar>
<Snackbar
  open={deleteSuccess}
  autoHideDuration={5000}
  onClose={() =>
    setDeleteSuccess(false)
  }
  anchorOrigin={{
    vertical:"top",
    horizontal:"right",
  }}
>
  <Alert
    severity="success"
    variant="filled"
  >
    Vehicle Deleted Successfully
  </Alert>
</Snackbar>
      </Box>
    </Box>
  );
}