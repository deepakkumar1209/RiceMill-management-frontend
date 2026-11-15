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
  Autocomplete,
  MenuItem,
} from "@mui/material";

import Sidebar from "../components/Sidebar";

import {
  createOutward,
  updateOutward,
  getOutward,
} from "../services/outwardService";

import { getItems } from "../services/itemService";
import { getDpcs } from "../services/dpcService";
import { getWarehouses } from "../services/warehouseService";
import { getVehicles } from "../services/vehicleService";

import { useSearchParams, useNavigate } from "react-router-dom";

export default function OutwardPage() {

const [searchParams] = useSearchParams();
const navigate = useNavigate();

const editId = searchParams.get("id");

const [success, setSuccess] = useState(false);

const [message, setMessage] = useState("");

const [items, setItems] = useState([]);

const [vehicles, setVehicles] = useState([]);

const [formData, setFormData] = useState({
  issueDate: new Date().toISOString().substring(0, 10),
  issueNumber: "",
  acknowledgeDate: new Date().toISOString().substring(0, 10),
  acknowledgeNumber: "",
  item: "",
  lorryNo: "",
  variety: "A",
  placeOfDeposit: "",
  sampleNo: "",
  totalNetWeight: "",
  balanceRiceDue: "",
  onbg: "",
  ssg: "",
  swp: "",
  usb: "",
  noOfBags: 0,
  totalNoOfBags: 0,
  balanceNoOfBags: 0,
});

useEffect(() => {
  loadMasters();

  if (editId) {
    loadOutward();
  }
}, [editId]);

const loadMasters = async () => {
  try {
    const itemData = await getItems();
    const dpcData = await getDpcs();
    const warehouseData = await getWarehouses();
    const vehicleData = await getVehicles();

    setItems(itemData);
    setVehicles(vehicleData);

    if (!editId) {
      setFormData((prev) => {
        const defaultItem = itemData.length > 0 ? itemData[0] : null;
        const defaultVehicle = vehicleData.length > 0 ? vehicleData[0] : null;

        const selectedItemName = prev.item || (defaultItem ? defaultItem.itemName : "");
        const currentItem = itemData.find((i) => i.itemName === selectedItemName) || defaultItem;
        const outturn = Number(currentItem?.outlet || 100);
        const weight = Number(prev.totalNetWeight || 0);
        const due = weight > 0 ? Number(((weight * outturn) / 100).toFixed(2)) : "";

        return {
          ...prev,
          item: selectedItemName,
          lorryNo: prev.lorryNo || (defaultVehicle ? defaultVehicle.vehicleNumber : ""),
          balanceRiceDue: prev.balanceRiceDue !== "" ? prev.balanceRiceDue : (due !== "" ? String(due) : ""),
        };
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const loadOutward = async () => {
  try {
    const data = await getOutward(editId);

    setFormData({
      ...data,
      variety: data.variety ?? "A",
      totalNetWeight: data.totalNetWeight ?? data.netWeight ?? "",
      balanceRiceDue: data.balanceRiceDue ?? "",
      onbg: data.onbg ?? "",
      ssg: data.ssg ?? "",
      swp: data.swp ?? "",
      usb: data.usb ?? "",
      noOfBags: data.noOfBags ?? 0,
      totalNoOfBags: data.totalNoOfBags ?? 0,
      balanceNoOfBags: data.balanceNoOfBags ?? 0,
      issueDate: data.issueDate ? String(data.issueDate).substring(0, 10) : new Date().toISOString().substring(0, 10),
      acknowledgeDate: data.acknowledgeDate ? String(data.acknowledgeDate).substring(0, 10) : new Date().toISOString().substring(0, 10),
    });
  } catch (error) {
    console.log(error);
  }
};

const handleChange = (e) => {
  const { name, value } = e.target;

  let updated = {
    ...formData,
    [name]: value,
  };

  if (name === "totalNetWeight") {
    const weight = Number(value || 0);
    const selectedItem = items.find((i) => i.itemName === updated.item);
    const outturn = Number(selectedItem?.outlet || 100);
    const calculatedDue = weight > 0 ? Number(((weight * outturn) / 100).toFixed(2)) : "";
    updated.balanceRiceDue = calculatedDue !== "" ? String(calculatedDue) : "";
  }

  const bags =
    Number(updated.onbg || 0) +
    Number(updated.ssg || 0) +
    Number(updated.swp || 0) +
    Number(updated.usb || 0);

  updated.noOfBags = bags;
  updated.totalNoOfBags = bags;
  updated.balanceNoOfBags = bags;

  setFormData(updated);
};

const resetForm = () => {
  if (editId) {
    navigate("/outwards", { replace: true });
  }

  const defaultItem = items.length ? items[0] : null;
  const defaultVehicle = vehicles.length ? vehicles[0] : null;

  setFormData({
    issueDate: new Date().toISOString().substring(0, 10),
    issueNumber: "",
    acknowledgeDate: new Date().toISOString().substring(0, 10),
    acknowledgeNumber: "",
    item: defaultItem ? defaultItem.itemName : "",
    lorryNo: defaultVehicle ? defaultVehicle.vehicleNumber : "",
    variety: "A",
    placeOfDeposit: "",
    sampleNo: "",
    totalNetWeight: "",
    balanceRiceDue: "",
    onbg: "",
    ssg: "",
    swp: "",
    usb: "",
    noOfBags: 0,
    totalNoOfBags: 0,
    balanceNoOfBags: 0,
  });
};

const handleSubmit = async () => {
  try {
    const totalWeight = Number(formData.totalNetWeight || 0);
    const selectedItem = items.find((i) => i.itemName === formData.item);
    const outturn = Number(selectedItem?.outlet || 100);
    const calculatedDue = totalWeight > 0 ? Number(((totalWeight * outturn) / 100).toFixed(2)) : 0;
    const balanceDue = Number(formData.balanceRiceDue || calculatedDue);

    const bags =
      Number(formData.onbg || 0) +
      Number(formData.ssg || 0) +
      Number(formData.swp || 0) +
      Number(formData.usb || 0);

    const payload = {
      ...formData,
      variety: formData.variety || "A",
      netWeight: totalWeight,
      totalNetWeight: totalWeight,
      balanceRiceDue: balanceDue,
      onbg: Number(formData.onbg || 0),
      ssg: Number(formData.ssg || 0),
      swp: Number(formData.swp || 0),
      usb: Number(formData.usb || 0),
      noOfBags: bags,
      totalNoOfBags: bags,
      balanceNoOfBags: bags,
    };

    if (editId) {
      await updateOutward(editId, payload);
      setMessage("Outward Updated Successfully");
    } else {
      await createOutward(payload);
      setMessage("Outward Saved Successfully");
    }

    setSuccess(true);
    resetForm();
  } catch (error) {
    console.log(error);
  }
};

return(

<Box sx={{display:"flex"}}>

<Sidebar/>

<Box
sx={{
flex:1,
p:4,
bgcolor:"#F8FAFC",
minHeight:"100vh",
}}
>

<Paper
sx={{
p:4,
borderRadius:"20px",
background:"#FFFFFF",
border:"1px solid #E5E7EB",
boxShadow:"0 8px 30px rgba(0,0,0,0.05)",
}}
>

<Typography
variant="h4"
fontWeight={700}
>

Outward Master

</Typography>

<Typography
sx={{
color:"#6B7280",
mt:1,
mb:4,
}}
>

Create and manage outward entries

</Typography>

<Box
sx={{
mb:4,
pb:2,
borderBottom:"1px solid #E5E7EB",
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
{/* Issue Date */}

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

{/* Issue Number */}

<Grid size={{ xs: 12, md: 4 }}>
  <TextField
    fullWidth
    label="Issue Number"
    name="issueNumber"
    value={formData.issueNumber}
    onChange={handleChange}
  />
</Grid>

{/* Acknowledge Date */}

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

{/* Acknowledge Number */}

<Grid size={{ xs: 12, md: 4 }}>
  <TextField
    fullWidth
    label="Acknowledge Number"
    name="acknowledgeNumber"
    value={formData.acknowledgeNumber}
    onChange={handleChange}
  />
</Grid>

{/* Item */}

<Grid size={{ xs: 12, md: 4 }}>
  <Autocomplete
    disableClearable
    options={items}
    getOptionLabel={(option) =>
      option.itemName || ""
    }
    value={
      items.find(
        (item) =>
          item.itemName === formData.item
      ) || null
    }
    onChange={(event, newValue) => {
      const selectedName = newValue ? newValue.itemName : "";
      const outturn = Number(newValue?.outlet || 100);
      const weight = Number(formData.totalNetWeight || 0);
      const calculatedDue = weight > 0 ? Number(((weight * outturn) / 100).toFixed(2)) : "";

      setFormData((prev) => ({
        ...prev,
        item: selectedName,
        balanceRiceDue: calculatedDue !== "" ? String(calculatedDue) : "",
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



{/* Vehicle */}

<Grid size={{ xs: 12, md: 4 }}>
  <Autocomplete
    disableClearable
    options={vehicles}
    getOptionLabel={(option) =>
      option.vehicleNumber || ""
    }
    value={
      vehicles.find(
        (vehicle) =>
          vehicle.vehicleNumber ===
          formData.lorryNo
      ) || null
    }
    onChange={(event, newValue) =>
      setFormData((prev) => ({
        ...prev,
        lorryNo: newValue
          ? newValue.vehicleNumber
          : "",
      }))
    }
    renderInput={(params) => (
      <TextField
        {...params}
        label="Lorry Number"
      />
    )}
  />
</Grid>

{/* Place Of Deposit */}

<Grid size={{ xs: 12, md: 4 }}>
  <TextField
    fullWidth
    label="Place Of Deposit"
    name="placeOfDeposit"
    value={formData.placeOfDeposit}
    onChange={handleChange}
  />
</Grid>

{/* Sample Number */}

<Grid size={{ xs: 12, md: 4 }}>
  <TextField
    fullWidth
    label="Sample Number"
    name="sampleNo"
    value={formData.sampleNo}
    onChange={handleChange}
  />
</Grid>

{/* Variety */}

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

    <MenuItem value="C">
      C
    </MenuItem>
  </TextField>
</Grid>

{/* Total Net Weight */}

<Grid size={{ xs: 12, md: 6 }}>
  <TextField
    fullWidth
    type="number"
    label="Total Net Weight"
    name="totalNetWeight"
    value={formData.totalNetWeight}
    onChange={handleChange}
  />
</Grid>

{/* Balance Rice Due */}

<Grid size={{ xs: 12, md: 6 }}>
  <TextField
    fullWidth
    type="number"
    label="Balance Rice Due"
    name="balanceRiceDue"
    value={formData.balanceRiceDue}
    helperText="Auto-calculated from Total Net Weight & Item Outturn"
    InputProps={{
      readOnly: true,
    }}
  />
</Grid>

</Grid>
{/* ============================
    Gunnies Deposit Section
============================= */}

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
    Gunnies Deposit Details
  </Typography>
</Box>

<Grid
  container
  spacing={3}
>
  {/* ONBG */}

  <Grid size={{ xs: 6, sm: 6, md: 3 }}>
    <TextField
      fullWidth
      label="ONBG"
      name="onbg"
      type="number"
      value={formData.onbg}
      onChange={handleChange}
    />
  </Grid>

  {/* SSG */}

  <Grid size={{ xs: 6, sm: 6, md: 3 }}>
    <TextField
      fullWidth
      label="SSG"
      name="ssg"
      type="number"
      value={formData.ssg}
      onChange={handleChange}
    />
  </Grid>

  {/* SWP */}

  <Grid size={{ xs: 6, sm: 6, md: 3 }}>
    <TextField
      fullWidth
      label="SWP"
      name="swp"
      type="number"
      value={formData.swp}
      onChange={handleChange}
    />
  </Grid>

  {/* USB */}

  <Grid size={{ xs: 6, sm: 6, md: 3 }}>
    <TextField
      fullWidth
      label="USB"
      name="usb"
      type="number"
      value={formData.usb}
      onChange={handleChange}
    />
  </Grid>

  {/* Number Of Bags */}

  <Grid size={{ xs: 12, md: 4 }}>
    <TextField
      fullWidth
      label="No Of Bags"
      value={formData.noOfBags}
      InputProps={{
        readOnly: true,
      }}
    />
  </Grid>

  {/* Total Number Of Bags */}

  <Grid size={{ xs: 12, md: 4 }}>
    <TextField
      fullWidth
      label="Total No Of Bags"
      value={formData.totalNoOfBags}
      InputProps={{
        readOnly: true,
      }}
    />
  </Grid>

  {/* Balance Number Of Bags */}

  <Grid size={{ xs: 12, md: 4 }}>
    <TextField
      fullWidth
      label="Balance No Of Bags"
      value={formData.balanceNoOfBags}
      InputProps={{
        readOnly: true,
      }}
    />
  </Grid>
</Grid>

{/* ============================
      Action Buttons
============================= */}

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
    sx={{
      textTransform: "none",
      borderRadius: "10px",
      px: 4,
      height: 45,
    }}
  >
    Cancel
  </Button>

  <Button
    variant="contained"
    onClick={handleSubmit}
    sx={{
      bgcolor: "#111827",
      textTransform: "none",
      borderRadius: "10px",
      px: 5,
      height: 45,
      fontWeight: 600,
      "&:hover": {
        bgcolor: "#1F2937",
      },
    }}
  >
    {editId
      ? "Update Outward"
      : "Save Outward"}
  </Button>
</Box>

</Paper>
{/* ============================
      Success Snackbar
============================ */}

<Snackbar
  open={success}
  autoHideDuration={4000}
  onClose={() => setSuccess(false)}
  anchorOrigin={{
    vertical: "top",
    horizontal: "right",
  }}
>
  <Alert
    severity="success"
    variant="filled"
    onClose={() => setSuccess(false)}
    sx={{
      width: "100%",
    }}
  >
    {message}
  </Alert>
</Snackbar>

</Box>

</Box>

);
}