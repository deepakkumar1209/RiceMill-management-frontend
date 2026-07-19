import { useState, useEffect } from "react";

import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
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
  createDpc,
  getDpcs,
  updateDpc,
  deleteDpc,
} from "../services/dpcService";

export default function DpcPage() {
const [success, setSuccess] = useState(false);
const [deleteSuccess, setDeleteSuccess] = useState(false);

const [message, setMessage] = useState("");

const [dpc, setDpcs] = useState([]);

const [editId, setEditId] = useState(null);

const [formData, setFormData] = useState({
  dpcName: "",
  dpcNumber: "",
  location: "",
  address: "",
});
useEffect(() => {
  loadDpcs();
}, []);
const loadDpcs = async () => {
  try {
    const data = await getDpcs();

setDpcs(data);
  } catch (error) {
    console.log(error);
  }
};
const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};


const handleSubmit = async () => {
  try {
    if (editId) {
      await updateDpc(editId, formData);

      setMessage(
        "DPC Updated Successfully"
      );
    } else {
      await createDpc(formData);

      setMessage(
        "DPC Saved Successfully"
      );
    }

    loadDpcs();

    setSuccess(true);

    setFormData({
      dpcName: "",
  dpcNumber: "",
      location: "",
      address: "",
    });

    setEditId(null);
  } catch (error) {
    console.log(error);
  }
};

const handleEdit = (dpc) => {
  setEditId(dpc._id);

  setFormData({
    dpcName: dpc.dpcName,
    dpcNumber: dpc.dpcNumber,
    location: dpc.location,
    address: dpc.address,
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};


const handleDelete = async (id) => {
  const ok = window.confirm(
    "Delete DPC?"
  );

  if (!ok) return;

  try {
    await deleteDpc(id);
    setDeleteSuccess(true);

    loadDpcs();
  } catch (error) {
    console.log(error);
  }
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
            background: "#fff",
            border:
              "1px solid #E5E7EB",
            boxShadow:
              "0px 10px 30px rgba(0,0,0,0.05)",
          }}
        >

          <Typography
            variant="h4"
            fontWeight={700}
          >
            DPC Master
          </Typography>

          <Typography
            sx={{
              color: "#6B7280",
              mb: 4,
              mt: 1,
            }}
          >
           Create and manage DPCs
          </Typography>

          <Box
            sx={{
              pb: 2,
              mb: 4,
              borderBottom:
                "1px solid #E5E7EB",
            }}
          >
            <Typography
              variant="h6"
              fontWeight={600}
            >
              DPC Information
            </Typography>
          </Box>

          <Grid
            container
            spacing={3}
          >
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="DPC Name"
                name="dpcName"
                value={
                  formData.dpcName
                }
                onChange={
                  handleChange
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="DPC Number"
                name="dpcNumber"
                value={
                  formData.dpcNumber
                }
                onChange={
                  handleChange
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
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

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Address"
                name="address"
                value={
                  formData.address
                }
                onChange={
                  handleChange
                }
              />
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
            variant="contained"
            onClick={handleSubmit}
            sx={{
                bgcolor: "#111827",
                px: 4,
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 600,
                }}>
        {editId
          ? "Update DPC"
          : "Save DPC"}
</Button>
<Button
  variant="outlined"
  onClick={() => {
    setEditId(null);

    setFormData({
      dpcName: "",
      dpcNumber: "",
      location: "",
      address: "",
    });
  }}
>
  Cancel
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
            DPC Number
          </TableCell>

          <TableCell>
            DPC Name
          </TableCell>

          <TableCell>
            Location
          </TableCell>

          <TableCell>
            Address
          </TableCell>

          <TableCell>
            Actions
          </TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {dpc.map((dpc) => (
          <TableRow
            key={dpc._id}
          >
            <TableCell>
              {dpc.dpcNumber}
            </TableCell>

            <TableCell>
              {dpc.dpcName}
            </TableCell>

            <TableCell>
              {dpc.location}
            </TableCell>

            <TableCell>
              {dpc.address}
            </TableCell>

            <TableCell>
              <Button
                size="small"
                variant="contained"
                sx={{
                  mr: 1,
                  bgcolor:
                    "#111827",
                }}
                onClick={() =>
                  handleEdit(dpc)
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
                    dpc._id
                  )
                }
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
</Paper>
        {/* SAVE MESSAGE */}
        
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
        
                {/* DELETE MESSAGE */}
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
    DPC Deleted Successfully
  </Alert>
</Snackbar>

      </Box>
    </Box>
  );
}