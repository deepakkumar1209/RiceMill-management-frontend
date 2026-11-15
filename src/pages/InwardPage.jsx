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
  getInward,
  getInwards,
  updateInward,
  deleteInward,
} from "../services/inwardService";
import {
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getItems } from "../services/itemService";

import { getDpcs } from "../services/dpcService";

import { getWarehouses } from "../services/warehouseService";

import { getVehicles } from "../services/vehicleService";

export default function InwardPage() {
const [searchParams] = useSearchParams();
const idParam = searchParams.get("id");
const navigate = useNavigate();

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

  totalNetWeight: "",

  nbg: 0,
  onb: 0,
  ssg: 0,
  swp: 0,
  usb: 0,

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

useEffect(() => {
  if (!idParam) return;

  let active = true;
  getInward(idParam)
    .then((data) => {
      if (!active || !data) return;
      setEditId(data._id);
      setFormData({
        issueDate: data.issueDate
          ? String(data.issueDate).substring(0, 10)
          : new Date().toISOString().substring(0, 10),
        acknowledgeDate: data.acknowledgeDate
          ? String(data.acknowledgeDate).substring(0, 10)
          : new Date().toISOString().substring(0, 10),
        issueMemoNo: data.issueMemoNo ?? "",
        acknowledgeNumber: data.acknowledgeNumber ?? "",
        item: data.item ?? "",
        dpcFrom: data.dpcFrom ?? "",
        warehouse: data.warehouse ?? "",
        lorryNo: data.lorryNo ?? "",
        variety: data.variety ?? "A",
        totalNetWeight: data.totalNetWeight ?? data.netWeight ?? "",
        nbg: data.nbg ?? 0,
        onb: data.onb ?? 0,
        ssg: data.ssg ?? 0,
        swp: data.swp ?? 0,
        usb: data.usb ?? 0,
        noOfBags: data.noOfBags ?? 0,
        totalNoOfBags: data.totalNoOfBags ?? 0,
        riceOutturn: data.riceOutturn ?? "",
        totalRiceDue: data.totalRiceDue ?? "",
      });
    })
    .catch((error) => {
      console.log(error);
    });

  return () => {
    active = false;
  };
}, [idParam]);

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

  if (!idParam && data.length > 0) {
    const defaultItem = data[0];
    const defaultOutturn = Number(defaultItem.outlet || 0);

    setFormData((prev) => {
      const selectedItemName = prev.item || defaultItem.itemName;
      const currentItem = data.find((i) => i.itemName === selectedItemName) || defaultItem;
      const outturn = Number(currentItem.outlet || defaultOutturn || 0);
      const totalWeight = Number(prev.totalNetWeight || 0);
      const calculatedDue = outturn > 0 && totalWeight > 0 ? Number(((totalWeight * outturn) / 100).toFixed(2)) : "";

      return {
        ...prev,
        item: selectedItemName,
        riceOutturn: prev.riceOutturn !== "" ? prev.riceOutturn : (outturn > 0 ? String(outturn) : ""),
        totalRiceDue: prev.totalRiceDue !== "" ? prev.totalRiceDue : (calculatedDue !== "" ? String(calculatedDue) : ""),
      };
    });
  }
};

const loadDpcs = async () => {
  const data = await getDpcs();

  setDpcs(data);

  if (!idParam && data.length > 0) {
    setFormData((prev) => ({
      ...prev,
      dpcFrom: prev.dpcFrom || data[0].dpcName,
    }));
  }
};

const loadWarehouses = async () => {
  const data = await getWarehouses();

  setWarehouses(data);

  if (!idParam && data.length > 0) {
    setFormData((prev) => ({
      ...prev,
      warehouse: prev.warehouse || data[0].warehouseName,
    }));
  }
};

const loadVehicles = async () => {
  const data = await getVehicles();

  setVehicles(data);

  if (!idParam && data.length > 0) {
    setFormData((prev) => ({
      ...prev,
      lorryNo: prev.lorryNo || data[0].vehicleNumber,
    }));
  }
};

const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === "totalNetWeight") {
    const weight = Number(value || 0);
    const outturn = Number(formData.riceOutturn || 0);
    const riceDue = outturn > 0 && weight > 0 ? Number(((weight * outturn) / 100).toFixed(2)) : "";

    setFormData((prev) => ({
      ...prev,
      totalNetWeight: value,
      totalRiceDue: riceDue !== "" ? String(riceDue) : "",
    }));
    return;
  }

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};


const handleSubmit = async () => {
  try {
    const totalWeight = Number(formData.totalNetWeight || 0);
    const outturn = Number(formData.riceOutturn || 0);
    const calculatedDue = outturn > 0 && totalWeight > 0 ? Number(((totalWeight * outturn) / 100).toFixed(2)) : 0;
    const totalDue = Number(formData.totalRiceDue || calculatedDue);

    const totalBags =
      Number(formData.nbg || 0) +
      Number(formData.onb || 0) +
      Number(formData.ssg || 0) +
      Number(formData.swp || 0) +
      Number(formData.usb || 0);

    const payload = {
      ...formData,
      netWeight: totalWeight,
      totalNetWeight: totalWeight,
      nbg: Number(formData.nbg || 0),
      onb: Number(formData.onb || 0),
      ssg: Number(formData.ssg || 0),
      swp: Number(formData.swp || 0),
      usb: Number(formData.usb || 0),
      noOfBags: totalBags,
      totalNoOfBags: totalBags,
      riceOutturn: outturn,
      totalRiceDue: totalDue,
    };

    console.log(payload);

    if (editId) {
      await updateInward(editId, payload);
      setMessage("Updated Successfully");
    } else {
      await createInward(payload);
      setMessage("Saved Successfully");
    }

    loadInwards();
    setSuccess(true);
    resetForm();
  } catch (error) {
    console.log(error);
  }
};

const resetForm = () => {
  setEditId(null);

  if (idParam) {
    navigate("/inwards", { replace: true });
  }

  const defaultItem = items.length ? items[0] : null;
  const defaultOutturn = defaultItem ? Number(defaultItem.outlet || 0) : "";

  setFormData({
    issueDate: new Date().toISOString().substring(0, 10),
    acknowledgeDate: new Date().toISOString().substring(0, 10),
    issueMemoNo: "",
    acknowledgeNumber: "",
    item: defaultItem ? defaultItem.itemName : "",
    dpcFrom: dpcs.length ? dpcs[0].dpcName : "",
    warehouse: warehouses.length ? warehouses[0].warehouseName : "",
    lorryNo: vehicles.length ? vehicles[0].vehicleNumber : "",
    variety: "A",
    totalNetWeight: "",
    nbg: 0,
    onb: 0,
    ssg: 0,
    swp: 0,
    usb: 0,
    noOfBags: 0,
    totalNoOfBags: 0,
    riceOutturn: defaultOutturn ? String(defaultOutturn) : "",
    totalRiceDue: "",
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
  <Grid size={{ xs: 12, md: 4 }}>
  <TextField
    fullWidth
    type="date"
    label="Issue Date"
    name="issueDate"
    value={formData.issueDate}
    onChange={handleChange}
    slotProps={{ inputLabel: { shrink: true } }}
  />
</Grid>
<Grid size={{ xs: 12, md: 4 }}>
  <TextField
    fullWidth
    label="Issue Memo No."
    name="issueMemoNo"
    value={formData.issueMemoNo}
    onChange={handleChange}
  />
</Grid>

<Grid size={{ xs: 12, md: 4 }}>
  <TextField
    fullWidth
    type="date"
    label="Acknowledge Date"
    name="acknowledgeDate"
    value={formData.acknowledgeDate}
    onChange={handleChange}
    slotProps={{ inputLabel: { shrink: true } }}
  />
</Grid>
<Grid size={{ xs: 12, md: 4 }}>
  <TextField
    fullWidth
    label="Acknowledge Number"
    name="acknowledgeNumber"
    value={formData.acknowledgeNumber}
    onChange={handleChange}
  />
</Grid>

<Grid size={{ xs: 12, md: 3 }}>
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
  onChange={(event, newValue) => {
    const selectedName = newValue ? newValue.itemName : "";
    const outturn = newValue ? Number(newValue.outlet || 0) : 0;
    const totalWeight = Number(formData.totalNetWeight || 0);
    const calculatedDue =
      outturn > 0 && totalWeight > 0
        ? Number(((totalWeight * outturn) / 100).toFixed(2))
        : "";

    setFormData((prev) => ({
      ...prev,
      item: selectedName,
      riceOutturn: outturn > 0 ? String(outturn) : "",
      totalRiceDue: calculatedDue !== "" ? String(calculatedDue) : "",
    }));
  }}
  renderInput={(params) => (
    <TextField
      {...params}
      label="Item"
    />
  )}
/>
</Grid>

<Grid size={{ xs: 12, md: 3 }}>
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

<Grid size={{ xs: 12, md: 3 }}>
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
<Grid size={{ xs: 12, md: 3 }}>
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
<Grid size={{ xs: 12, md: 4 }}>
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

    <MenuItem value="B">
      B
    </MenuItem>

    <MenuItem value="C">
      C
    </MenuItem>
  </TextField>
</Grid>
<Grid size={{ xs: 12, md: 8 }}>
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
<Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
<TextField
fullWidth
label="NBG"
name="nbg"
type="number"
value={formData.nbg}
onChange={handleChange}
/>
</Grid>

<Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
<TextField
fullWidth
label="ONB"
name="onb"
type="number"
value={formData.onb}
onChange={handleChange}
/>
</Grid>

<Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
<TextField
fullWidth
label="SSG"
name="ssg"
type="number"
value={formData.ssg}
onChange={handleChange}
/>
</Grid>

<Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
<TextField
fullWidth
label="SWP"
name="swp"
type="number"
value={formData.swp}
onChange={handleChange}
/>
</Grid>

<Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
<TextField
fullWidth
label="USB"
name="usb"
type="number"
value={formData.usb}
onChange={handleChange}
/>
</Grid>


<Grid size={{ xs: 12, md: 4 }}>
  <TextField
fullWidth
label="Total No Of Bags"
value={
Number(formData.nbg || 0) +
Number(formData.onb || 0) +
Number(formData.ssg || 0) +
Number(formData.swp || 0) +
Number(formData.usb || 0)
}
InputProps={{
readOnly:true,
}}
/>
</Grid>
<Grid size={{ xs: 12, md: 4 }}>
  <TextField
    fullWidth
    type="number"
    label="Rice Outturn (%)"
    name="riceOutturn"
    value={formData.riceOutturn}
    helperText="Auto-filled from selected Item"
    InputProps={{
      readOnly: true,
    }}
  />
</Grid>
<Grid size={{ xs: 12, md: 4 }}>
  <TextField
    fullWidth
    type="number"
    label="Total Rice Due"
    name="totalRiceDue"
    value={formData.totalRiceDue}
    helperText="Auto-calculated: (Total Net Weight × Outturn) / 100"
    InputProps={{
      readOnly: true,
    }}
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



