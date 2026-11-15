import { useState, useEffect } from "react";

import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
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
  createCustomerVendor,
  getCustomerVendors,
  updateCustomerVendor,
  deleteCustomerVendor,
} from "../services/customerVendorService";

export default function CustomerVendorPage() {
  const [success, setSuccess] =
    useState(false);
    const [customerVendors, setCustomerVendors] =
  useState([]);

const [editId, setEditId] =
  useState(null);

const [message, setMessage] =
  useState("");

const [deleteSuccess,
setDeleteSuccess] =
useState(false);

  const [formData, setFormData] =
    useState({
      name: "",
      customerId: "",
      plotNo: "",
      street: "",
      location: "",
      city: "",
      taluk: "",
      district: "",
      state: "",
      country: "",
      pinCode: "",
      mobileNumber: "",
      fax: "",
      email: "",
      contactPerson: "",
      contactPersonMobileNumber:
        "",
      isCustomer: false,
      isVendor: false,
    });

    useEffect(() => {
  loadCustomerVendors();
}, []);

const loadCustomerVendors =
async () => {
  try {

    const data =
      await getCustomerVendors();

    setCustomerVendors(data);

  } catch (error) {
    console.log(error);
  }
};

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = async () => {
  try {
    if (editId) {
      // Update Customer/Vendor
      await updateCustomerVendor(
        editId,
        formData
      );

      setMessage(
        "Customer/Vendor Updated Successfully"
      );
    } else {
      // Create Customer/Vendor
      await createCustomerVendor(
        formData
      );

      setMessage(
        "Customer/Vendor Saved Successfully"
      );
    }

    // Reload Table
    loadCustomerVendors();

    // Show Success Message
    setSuccess(true);

    // Clear Form
    setFormData({
      name: "",
      customerId: "",
      plotNo: "",
      street: "",
      location: "",
      city: "",
      taluk: "",
      district: "",
      state: "",
      country: "",
      pinCode: "",
      mobileNumber: "",
      fax: "",
      email: "",
      contactPerson: "",
      contactPersonMobileNumber: "",
      isCustomer: false,
      isVendor: false,
    });

    // Exit Edit Mode
    setEditId(null);
  } catch (error) {
    console.log(error);
  }
};
    const handleEdit = (customer) => {

    setEditId(customer._id);

    setFormData({

        ...customer

    });

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });

};
const handleDelete =
async(id)=>{

const ok=window.confirm(
"Delete Customer/Vendor?"
);

if(!ok) return;

await deleteCustomerVendor(id);

setDeleteSuccess(true);

loadCustomerVendors();

};
const resetForm = () => {

setEditId(null);

setFormData({

name:"",
customerId:"",
plotNo:"",
street:"",
location:"",
city:"",
taluk:"",
district:"",
state:"",
country:"",
pinCode:"",
mobileNumber:"",
fax:"",
email:"",
contactPerson:"",
contactPersonMobileNumber:"",
isCustomer:false,
isVendor:false

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
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: "20px",
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
            Customer / Vendor Master
          </Typography>

          <Typography
            sx={{
              color: "#6B7280",
              mt: 1,
              mb: 4,
            }}
          >
            Create and manage
            customers and vendors
          </Typography>

          <Grid
            container
            spacing={3}
          >
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={
                  handleChange
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Customer ID"
                name="customerId"
                value={
                  formData.customerId
                }
                onChange={
                  handleChange
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="Plot No" name="plotNo" value={formData.plotNo} onChange={handleChange}/>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="Street" name="street" value={formData.street} onChange={handleChange}/>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="Location" name="location" value={formData.location} onChange={handleChange}/>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="City" name="city" value={formData.city} onChange={handleChange}/>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="Taluk" name="taluk" value={formData.taluk} onChange={handleChange}/>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="District" name="district" value={formData.district} onChange={handleChange}/>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="State" name="state" value={formData.state} onChange={handleChange}/>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="Country" name="country" value={formData.country} onChange={handleChange}/>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="Pin Code" name="pinCode" value={formData.pinCode} onChange={handleChange}/>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="Mobile Number" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange}/>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="Fax" name="fax" value={formData.fax} onChange={handleChange}/>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="Email" name="email" value={formData.email} onChange={handleChange}/>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Contact Person" name="contactPerson" value={formData.contactPerson} onChange={handleChange}/>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Contact Person Mobile Number" name="contactPersonMobileNumber" value={formData.contactPersonMobileNumber} onChange={handleChange}/>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={
                      formData.isCustomer
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isCustomer:
                          e.target
                            .checked,
                      })
                    }
                  />
                }
                label="Customer"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={
                      formData.isVendor
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isVendor:
                          e.target
                            .checked,
                      })
                    }
                  />
                }
                label="Vendor"
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
>
Cancel
</Button>
            <Button
              variant="contained"
              onClick={
                handleSubmit
              }
              sx={{
                bgcolor:
                  "#111827",
                px: 4,
              }}
            >
           {editId
? "Update Customer"
: "Save Customer"}
            </Button>
          </Box>
        </Paper>

        <Paper
  sx={{
    mt: 4,
    borderRadius: "20px",
    overflow: "hidden",
    border: "1px solid #E5E7EB",
    boxShadow: "0px 10px 30px rgba(0,0,0,0.05)",
  }}
>
  <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
    <Table sx={{ minWidth: 650 }}>
      <TableHead
        sx={{
          bgcolor: "#F8FAFC",
        }}
      >
        <TableRow>
          <TableCell
            sx={{ fontWeight: 700 }}
          >
            Customer ID
          </TableCell>

          <TableCell
            sx={{ fontWeight: 700 }}
          >
            Name
          </TableCell>

          <TableCell
            sx={{ fontWeight: 700 }}
          >
            Mobile
          </TableCell>

          <TableCell
            sx={{ fontWeight: 700 }}
          >
            Email
          </TableCell>

          <TableCell
            sx={{ fontWeight: 700 }}
          >
            Customer
          </TableCell>

          <TableCell
            sx={{ fontWeight: 700 }}
          >
            Vendor
          </TableCell>

          <TableCell
            align="center"
            sx={{ fontWeight: 700 }}
          >
            Actions
          </TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {customerVendors.map(
          (customer) => (
            <TableRow
              key={customer._id}
              hover
            >
              <TableCell>
                {customer.customerId}
              </TableCell>

              <TableCell>
                {customer.name}
              </TableCell>

              <TableCell>
                {customer.mobileNumber}
              </TableCell>

              <TableCell>
                {customer.email}
              </TableCell>

              <TableCell>
                {customer.isCustomer
                  ? "Yes"
                  : "No"}
              </TableCell>

              <TableCell>
                {customer.isVendor
                  ? "Yes"
                  : "No"}
              </TableCell>

              <TableCell
                align="center"
              >
                <Button
                  size="small"
                  variant="contained"
                  sx={{
                    mr: 1,
                    bgcolor:
                      "#111827",
                    textTransform:
                      "none",
                  }}
                  onClick={() =>
                    handleEdit(
                      customer
                    )
                  }
                >
                  Edit
                </Button>

                <Button
                  size="small"
                  color="error"
                  variant="contained"
                  sx={{
                    textTransform:
                      "none",
                  }}
                  onClick={() =>
                    handleDelete(
                      customer._id
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