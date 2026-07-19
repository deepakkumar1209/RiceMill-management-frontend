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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import Sidebar from "../components/Sidebar";

import {
  createWarehouse,
  getWarehouses,
  updateWarehouse,
  deleteWarehouse,
} from "../services/warehouseService";



export default function WarehousePage() {


  const [success, setSuccess] =
    useState(false);
    const [warehouses,
setWarehouses] =
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

  const [formData,setFormData]=useState({

warehouseName:"",
warehouseNumber:"",
location:""

});

  useEffect(() => {
  
  loadWarehouses();
}, []);

const loadWarehouses = async () => {

  try {

    const data = await getWarehouses();

    console.log(data);

    setWarehouses(data);

  } catch (error) {

    console.log(error.response?.data);

  }

};  

 

  const handleChange = (
    e
  ) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

const handleSubmit =
  async () => {
    try {
      if (editId) {
        await updateWarehouse(
          editId,
          formData
        );

        setMessage(
          "Warehouse Updated Successfully"
        );
      } else {
        await createWarehouse(
          formData
        );

        setMessage(
          "Warehouse Saved Successfully"
        );
      }

      loadWarehouses();

      setSuccess(true);

      setFormData({
        warehouseName: "",
        warehouseNumber:
          "",
        location: "",
      });

      setEditId(null);
    } catch (error) {
      console.log(error);
    }
  }; 
  const handleEdit =
  (warehouse) => {
    setEditId(
      warehouse._id
    );

    setFormData({
      warehouseName:
        warehouse.warehouseName,

      warehouseNumber:
        warehouse.warehouseNumber,

      location:
        warehouse.location,
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
        "Delete Warehouse?"
      );

    if (!ok) return;

    await deleteWarehouse(
      id
    );

    setDeleteSuccess(
      true
    );

    loadWarehouses();
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
          }}
        >
          <Typography
            variant="h4"
            fontWeight={700}
          >
            Warehouse Master
          </Typography>

          <Typography
            sx={{
              color: "#6B7280",
              mt: 1,
              mb: 4,
            }}
          >
            Create and manage
            warehouses
          </Typography>

          <Grid
            container
            spacing={3}
          >
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Warehouse Name"
                name="warehouseName"
                value={
                  formData.warehouseName
                }
                onChange={
                  handleChange
                }
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Warehouse Number"
                name="warehouseNumber"
                value={
                  formData.warehouseNumber
                }
                onChange={
                  handleChange
                }
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={
                  formData.location
                }
                onChange={
                  handleChange
                }
              />
            </Grid>
          </Grid>

         <Box
  sx={{
    mt: 4,
    display: "flex",
    justifyContent: "flex-end",
    gap: 2,
  }}
>
  <Button
    variant="outlined"
    onClick={() => {
      setEditId(null);

      setFormData({
        warehouseName: "",
        warehouseNumber: "",
        location: "",
      });
    }}
  >
    Cancel
  </Button>
          <Button
  variant="contained"
  onClick={handleSubmit}
  sx={{
    bgcolor: "#111827",
    px: 4,
    borderRadius: "10px",
    textTransform: "none",
    fontWeight: 600,
  }}
>
  {editId
    ? "Update Warehouse"
    : "Save Warehouse"}
</Button>
          </Box>
        </Paper>
        
        <Paper
  sx={{
    mt: 4,
    borderRadius: "20px",
    overflow: "hidden",
  }}
>
  <TableContainer>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>
            Warehouse No
          </TableCell>

          <TableCell>
            Warehouse Name
          </TableCell>

          <TableCell>
            Location
          </TableCell>

          <TableCell>
            Actions
          </TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {warehouses.map(
          (warehouse) => (
            <TableRow
              key={
                warehouse._id
              }
            >
              <TableCell>
                {
                  warehouse.warehouseNumber
                }
              </TableCell>

              <TableCell>
                {
                  warehouse.warehouseName
                }
              </TableCell>

              <TableCell>
                {
                  warehouse.location
                }
              </TableCell>

              <TableCell>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    mr: 1,
                    bgcolor:
                      "#111827",
                  }}
                  onClick={() =>
                    handleEdit(
                      warehouse
                    )
                  }
                >     
                  Edit
                </Button>

                <Button
                  color="error"
                  variant="contained"
                  size="small"
                  onClick={() =>
                    handleDelete(
                      warehouse._id
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
    vertical: "top",
    horizontal: "right",
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
    vertical: "top",
    horizontal: "right",
  }}
>
  <Alert
    severity="success"
    variant="filled"
  >
    Warehouse Deleted Successfully
  </Alert>
</Snackbar>
      </Box>
    </Box>
  );
}