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
  createLegalEntity,
  getLegalEntities,
  updateLegalEntity,
  deleteLegalEntity,
} from "../services/legalEntityService";

export default function LegalEntityPage() {
  const [success, setSuccess] =
    useState(false);
    const [legalEntities, setLegalEntities] =
  useState([]);

const [editId, setEditId] =
  useState(null);

const [message, setMessage] =
  useState("");

const [
  deleteSuccess,
  setDeleteSuccess,
] = useState(false);

  const [formData, setFormData] =
    useState({
      companyName: "",
      companyLogo: "",
      address: "",
      contactInformation: "",
      gstNumber: "",
    });

  useEffect(() => {
  loadLegalEntities();
}, []);

const loadLegalEntities =
  async () => {
    const data =
      await getLegalEntities();

    setLegalEntities(data);
  };

  const handleChange = (e) => {
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
        await updateLegalEntity(
          editId,
          formData
        );

        setMessage(
          "Legal Entity Updated Successfully"
        );
      } else {
        await createLegalEntity(
          formData
        );

        setMessage(
          "Legal Entity Saved Successfully"
        );
      }

      loadLegalEntities();

      setSuccess(true);

      setEditId(null);

      setFormData({
        companyName: "",
        companyLogo: "",
        address: "",
        contactInformation: "",
        gstNumber: "",
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = (row) => {
  setEditId(row._id);

  setFormData({
    companyName: row.companyName,
    companyLogo: row.companyLogo,
    address: row.address,
    contactInformation:
      row.contactInformation,
    gstNumber: row.gstNumber,
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

const handleDelete = async (id) => {
  const ok = window.confirm(
    "Delete Legal Entity?"
  );

  if (!ok) return;

  await deleteLegalEntity(id);

  setDeleteSuccess(true);

  loadLegalEntities();
};
const resetForm = () => {
  setEditId(null);

  setFormData({
    companyName: "",
    companyLogo: "",
    address: "",
    contactInformation: "",
    gstNumber: "",
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, minHeight: "100vh" }}>
      <Sidebar />

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          width: "100%",
          p: { xs: 2, sm: 3, md: 4 },
          bgcolor: "#F8FAFC",
          minHeight: "100vh",
          boxSizing: "border-box",
        }}
      >
        <Paper
          sx={{
            maxWidth: 1200,
            mx: "auto",
            p: { xs: 2.5, sm: 3.5, md: 5 },
            borderRadius: 5,
            boxShadow:
              "0 15px 40px rgba(0,0,0,0.05)",
          }}
        >
          <Typography
            variant="h4"
            fontWeight={700}
          >
            Legal Entity Master
          </Typography>

          <Typography
            sx={{
              color: "#64748B",
              mb: 4,
            }}
          >
            Create and manage company legal entities
          </Typography>

          <Grid
            container
            spacing={3}
          >
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Company Name"
                name="companyName"
                value={
                  formData.companyName
                }
                onChange={
                  handleChange
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Company Logo URL"
                name="companyLogo"
                value={
                  formData.companyLogo
                }
                onChange={
                  handleChange
                }
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
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

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Contact Information"
                name="contactInformation"
                value={
                  formData.contactInformation
                }
                onChange={
                  handleChange
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="GST Number"
                name="gstNumber"
                value={
                  formData.gstNumber
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
              justifyContent:
                "flex-end",
              gap: 2,
            }}
          >
            <Button
  variant="outlined"
  onClick={resetForm}
  sx={{
    px: 5,
    py: 1.3,
    borderRadius: "10px",
    textTransform: "none",
    fontWeight: 600,
  }}
>
  Cancel
</Button>
          <Button
  variant="contained"
  onClick={handleSubmit}
  sx={{
    bgcolor: "#111827",
    px: 5,
    py: 1.3,
    borderRadius: "10px",
    textTransform: "none",
    fontWeight: 600,
    "&:hover": {
      bgcolor: "#1F2937",
    },
  }}
>
  {editId
    ? "Update Legal Entity"
    : "Save Legal Entity"}
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
  <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
    <Table sx={{ minWidth: 650 }}>
      <TableHead>
        <TableRow>
          <TableCell>
            Company Name
          </TableCell>

          <TableCell>
            GST Number
          </TableCell>

          <TableCell>
            Contact
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
        {legalEntities.map(
          (row) => (
            <TableRow
              key={row._id}
            >
              <TableCell>
                {row.companyName}
              </TableCell>

              <TableCell>
                {row.gstNumber}
              </TableCell>

              <TableCell>
                {
                  row.contactInformation
                }
              </TableCell>

              <TableCell>
                {row.address}
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
                    handleEdit(
                      row
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
                      row._id
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
    Legal Entity Deleted Successfully
  </Alert>
</Snackbar>
      </Box>
    </Box>
  );
}