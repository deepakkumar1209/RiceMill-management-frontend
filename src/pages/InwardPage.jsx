import React, {
  useState,
  useEffect,
} from "react";
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
  MenuItem,
  Autocomplete,
} from "@mui/material";
import {
  createInward,
  getInwards,
  updateInward,
  deleteInward,
} from "../services/inwardService";
import Sidebar from "../components/Sidebar";
import { getItems } from "../services/itemService";

import { getDpcs } from "../services/dpcService";

import { getWarehouses } from "../services/warehouseService";

import { getVehicles } from "../services/vehicleService";

export default function InwardPage() {
const [success,setSuccess]=useState(false);

const [deleteSuccess,setDeleteSuccess]=useState(false);

const [message,setMessage]=useState("");

const [editId,setEditId]=useState(null);

const [inwards,setInwards]=useState([]);

const [formData, setFormData] = useState({
  issueDate: new Date().toISOString().substring(0, 10),
  acknowledgeDate: new Date().toISOString().substring(0, 10),

  issueMemoNo: "",
  acknowledgeNumber: "",

  item: "",

  dpcFrom: "",
  warehouse: "",

  lorryNo: "",

  variety: "A",

  netWeight: "",
  totalNetWeight: "",

  nbg: 0,
  onb: 0,
  ssg: 0,
  swp: 0,

  noOfBags: 0,
  totalNoOfBags: 0,

  riceOutturn: "",
  totalRiceDue: "",
});

useEffect(() => {
    loadItems();
    loadDpcs();
    loadWarehouses();
    loadVehicles();
}, []);

const [items, setItems] = useState([]);

const [dpcs, setDpcs] = useState([]);

const [warehouses, setWarehouses] = useState([]);

const [vehicles, setVehicles] = useState([]);

const loadInwards=
async()=>{

const data=
await getInwards();

setInwards(data);

}
const loadItems = async () => {
  const data = await getItems();

  setItems(data);

  if (data.length > 0) {
    setFormData((prev) => ({
      ...prev,
      item: data[0].itemName,
    }));
  }
};

const loadDpcs = async () => {
  const data = await getDpcs();

  setDpcs(data);

  if (data.length > 0) {
    setFormData((prev) => ({
      ...prev,
      dpcFrom: data[0].dpcName,
    }));
  }
};

const loadWarehouses = async () => {
  const data = await getWarehouses();

  setWarehouses(data);

  if (data.length > 0) {
    setFormData((prev) => ({
      ...prev,
      warehouse: data[0].warehouseName,
    }));
  }
};

const loadVehicles = async () => {
  const data = await getVehicles();

  setVehicles(data);

  if (data.length > 0) {
    setFormData((prev) => ({
      ...prev,
      lorryNo: data[0].vehicleNumber,
    }));
  }
};

const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};


const handleSubmit = async () => {
  try {

    const payload = {

      ...formData,

      netWeight: Number(formData.netWeight || 0),

      totalNetWeight: Number(formData.totalNetWeight || 0),

      nbg: Number(formData.nbg || 0),

      onb: Number(formData.onb || 0),

      ssg: Number(formData.ssg || 0),

      swp: Number(formData.swp || 0),

      noOfBags:

        Number(formData.nbg || 0) +

        Number(formData.onb || 0) +

        Number(formData.ssg || 0) +

        Number(formData.swp || 0),

      totalNoOfBags:

        Number(formData.nbg || 0) +

        Number(formData.onb || 0) +

        Number(formData.ssg || 0) +

        Number(formData.swp || 0),

      riceOutturn:Number(formData.riceOutturn||0),

      totalRiceDue:Number(formData.totalRiceDue||0),

    };

    console.log(payload);

    if(editId){

      await updateInward(editId,payload);

      setMessage("Updated Successfully");

    }

    else{

      await createInward(payload);

      setMessage("Saved Successfully");

    }

    loadInwards();

    setSuccess(true);

    resetForm();

  }

  catch(error){

    console.log(error);

  }

};

const resetForm = () => {

  setEditId(null);

  setFormData({

    issueDate:new Date().toISOString().substring(0,10),

    acknowledgeDate:new Date().toISOString().substring(0,10),

    issueMemoNo:"",

    acknowledgeNumber:"",

   item: items.length ? items[0].itemName : "",
   dpcFrom: dpcs.length ? dpcs[0].dpcName : "",
  warehouse: warehouses.length ? warehouses[0].warehouseName : "",
  lorryNo: vehicles.length ? vehicles[0].vehicleNumber : "",

    variety:"A",

    netWeight:"",

    totalNetWeight:"",

    nbg:0,

    onb:0,

    ssg:0,

    swp:0,

    noOfBags:0,

    totalNoOfBags:0,

    riceOutturn:"",

    totalRiceDue:""

  });

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
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    boxShadow: "0 8px 30px rgba(0,0,0,0.05)",
  }}
>
    <Typography
  variant="h4"
  fontWeight={700}
>
  Inward Master
</Typography>

<Typography
  sx={{
    color: "#6B7280",
    mt: 1,
    mb: 4,
  }}
>
  Create and manage inward entries
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
    Basic Information
  </Typography>
</Box>
<Grid
  container
  spacing={3}
>
  <Grid item xs={12} md={4}>
  <TextField
    fullWidth
    type="date"
    label="Issue Date"
    name="issueDate"
    value={formData.issueDate}
    onChange={handleChange}
    InputLabelProps={{
      shrink: true,
    }}
  />
</Grid>
<Grid item xs={12} md={4}>
  <TextField
    fullWidth
    label="Issue Memo No."
    name="issueMemoNo"
    value={formData.issueMemoNo}
    onChange={handleChange}
  />
</Grid>

<Grid item xs={12} md={4}>
  <TextField
    fullWidth
    type="date"
    label="Acknowledge Date"
    name="acknowledgeDate"
    value={formData.acknowledgeDate}
    onChange={handleChange}
    InputLabelProps={{
      shrink: true,
    }}
  />
</Grid>
<Grid item xs={12} md={4}>
  <TextField
    fullWidth
    label="Acknowledge Number"
    name="acknowledgeNumber"
    value={formData.acknowledgeNumber}
    onChange={handleChange}
  />
</Grid>

<Grid size={{ xs: 12, md: 1.5 }}>
<Autocomplete
   disableClearable
  fullWidth
  options={items}
  getOptionLabel={(option) => option.itemName || ""}
  value={
    items.find(
      (item) => item.itemName === formData.item
    ) || null
  }
  onChange={(event, newValue) =>
    setFormData({
      ...formData,
      item: newValue ? newValue.itemName : "",
    })
  }
  renderInput={(params) => (
    <TextField
      {...params}
      label="Item"
    />
  )}
/>
</Grid>

<Grid size={{ xs: 12, md: 1.5 }}>
  <Autocomplete
   disableClearable
  fullWidth
  options={dpcs}
  getOptionLabel={(option) => option.dpcName || ""}
  value={
    dpcs.find(
      (dpc) => dpc.dpcName === formData.dpcFrom
    ) || null
  }
  onChange={(event, newValue) =>
    setFormData({
      ...formData,
      dpcFrom: newValue ? newValue.dpcName : "",
    })
  }
  renderInput={(params) => (
    <TextField
      {...params}
      label="DPC"
    />
  )}
/>
</Grid>

<Grid size={{ xs: 12, md: 1.5 }}>
 <Autocomplete
   disableClearable
  fullWidth
  options={warehouses}
  getOptionLabel={(option) => option.warehouseName || ""}
  value={
    warehouses.find(
      (warehouse) =>
        warehouse.warehouseName === formData.warehouse
    ) || null
  }
  onChange={(event, newValue) =>
    setFormData({
      ...formData,
      warehouse: newValue
        ? newValue.warehouseName
        : "",
    })
  }
  renderInput={(params) => (
    <TextField
      {...params}
      label="Warehouse"
    />
  )}
/>
</Grid>
<Grid size={{ xs: 12, md: 1.5 }}>
<Autocomplete
   disableClearable
  fullWidth
  options={vehicles}
  getOptionLabel={(option) => option.vehicleNumber || ""}
  value={
    vehicles.find(
      (vehicle) =>
        vehicle.vehicleNumber === formData.lorryNo
    ) || null
  }
  onChange={(event, newValue) =>
    setFormData({
      ...formData,
      lorryNo: newValue
        ? newValue.vehicleNumber
        : "",
    })
  }
  renderInput={(params) => (
    <TextField
      {...params}
      label="Lorry Number"
    />
  )}
/>
</Grid>
<Grid size={{ xs: 10, md: 2 }}>
  <TextField
    select
    fullWidth
    label="Variety"
    name="variety"
    value={formData.variety}
    onChange={handleChange}
  >
    <MenuItem value="A">
      A
    </MenuItem>

    <MenuItem value="C">
      C
    </MenuItem>
  </TextField>
</Grid>
<Grid item xs={12} md={4}>
  <TextField
    fullWidth
    type="number"
    label="Net Weight"
    name="netWeight"
    value={formData.netWeight}
    onChange={handleChange}
  />
</Grid>
<Grid item xs={12} md={4}>
  <TextField
    fullWidth
    type="number"
    label="Total Net Weight"
    name="totalNetWeight"
    value={formData.totalNetWeight}
    onChange={handleChange}
  />
</Grid>

</Grid>



<Box
  sx={{
    mt: 5,
    mb: 4,
    pb: 2,
    borderBottom: "1px solid #E5E7EB",
  }}
>
  <Typography
    variant="h6"
    fontWeight={600}
  >
    Bag Details
  </Typography>
</Box>

<Grid
  container
  spacing={3}
>
<Grid item xs={3}>
<TextField
fullWidth
label="NBG"
name="nbg"
type="number"
value={formData.nbg}
onChange={handleChange}
/>
</Grid>

<Grid item xs={3}>
<TextField
fullWidth
label="ONB"
name="onb"
type="number"
value={formData.onb}
onChange={handleChange}
/>
</Grid>

<Grid item xs={3}>
<TextField
fullWidth
label="SSG"
name="ssg"
type="number"
value={formData.ssg}
onChange={handleChange}
/>
</Grid>

<Grid item xs={3}>
<TextField
fullWidth
label="SWP"
name="swp"
type="number"
value={formData.swp}
onChange={handleChange}
/>
</Grid>


<Grid item xs={12} md={4}>
  <TextField
fullWidth
label="Total No Of Bags"
value={
Number(formData.nbg || 0) +
Number(formData.onb || 0) +
Number(formData.ssg || 0) +
Number(formData.swp || 0)
}
InputProps={{
readOnly:true,
}}
/>
</Grid>
<Grid item xs={12} md={4}>
  <TextField
    fullWidth
    type="number"
    label="Rice Outturn"
    name="riceOutturn"
    value={formData.riceOutturn}
    onChange={handleChange}
  />
</Grid>
<Grid item xs={12} md={4}>
  <TextField
    fullWidth
    type="number"
    label="Total Rice Due"
    name="totalRiceDue"
    value={formData.totalRiceDue}
    onChange={handleChange}
  />
</Grid>

</Grid>
<Box
  sx={{
    mt: 5,
    pt: 3,
    borderTop: "1px solid #E5E7EB",
    display: "flex",
    justifyContent: "flex-end",
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
    onClick={handleSubmit}
    sx={{
      bgcolor: "#111827",
      px: 4,
      textTransform: "none",
      borderRadius: "10px",
    }}
  >
    {editId
      ? "Update Inward"
      : "Save Inward"}
  </Button>
</Box>


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
    onClose={() =>
      setSuccess(false)
    }
  >
    {message}
  </Alert>
</Snackbar>

    {/* Form Paper */}

    {/* Table Paper */}

    {/* Snackbars */}
 </Box>
</Box>
);
}



