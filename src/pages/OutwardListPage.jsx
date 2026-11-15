import React, {
  useState,
  useEffect,
} from "react";

import {
  Box,
  Paper,
  Typography,
  Button,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import {
  getOutwards,
  deleteOutward,
} from "../services/outwardService";
export default function OutwardListPage() {

const navigate = useNavigate();

const [rows, setRows] = useState([]);

const [search, setSearch] = useState("");

const [deleteSuccess, setDeleteSuccess] =
  useState(false);

  useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  try {
    const data = await getOutwards();

    setRows(data);
  } catch (error) {
    console.log(error);
  }
};

const handleDelete = async (id) => {
  const ok = window.confirm(
    "Delete this record?"
  );

  if (!ok) return;

  try {
   await deleteOutward(id);

    setDeleteSuccess(true);

    loadData();
  } catch (error) {
    console.log(error);
  }
};

const handleEdit = (id) => {
 navigate(`/outwards?id=${id}`);
};

const filteredRows = rows.filter((row) => {

  const searchText = search.toLowerCase();

  return (

    row.issueNumber?.toLowerCase().includes(searchText) ||

    row.acknowledgeNumber?.toLowerCase().includes(searchText) ||

    row.item?.toLowerCase().includes(searchText) ||

    row.variety?.toLowerCase().includes(searchText) ||

    row.placeOfDeposit?.toLowerCase().includes(searchText) ||

    row.lorryNo?.toLowerCase().includes(searchText)

  );

});

return (
<Box sx={{ display: "flex" }}>

<Sidebar />

<Box
  sx={{
    flex: 1,
    p: 4,
    bgcolor: "#F8FAFC",
    minHeight: "100vh",
    overflowX: "hidden",   // Prevent page horizontal scrolling
    width: "100%",
  }}
>
 <Paper
  sx={{
    width: "100%",
    p: 4,
    mb: 3,
    borderRadius: "20px",
    border: "1px solid #E5E7EB",
    boxShadow: "0 8px 30px rgba(0,0,0,0.05)",
  }}
>

<Typography
variant="h4"
fontWeight={700}
>
Outward List

</Typography>

<Typography
sx={{
color:"#6B7280",
mt:1
}}
>
View and manage outward entries

</Typography>

</Paper>
<Paper
  sx={{
    p: 3,
    mb: 3,
    width: "100%",
    borderRadius: "20px",
  }}
>

<TextField

fullWidth

placeholder="Search by Ack No, Item or Received From"

value={search}

onChange={(e)=>

setSearch(e.target.value)

}

InputProps={{

startAdornment:(

<InputAdornment position="start">

<SearchIcon/>

</InputAdornment>

)

}}

>

</TextField>

</Paper>
<Box
  sx={{
    mb: 3,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 2,
  }}
>
  <Typography
    variant="h6"
    fontWeight={600}
  >
   Outward Records
  </Typography>

  <Box
    sx={{
      display: "flex",
      gap: 2,
    }}
  >
    <Button
      variant="outlined"
      onClick={loadData}
      sx={{
        textTransform: "none",
        borderRadius: "10px", 
      }}
    >
      Refresh
    </Button>

    <Button
      variant="outlined"
      sx={{
        textTransform: "none",
        borderRadius: "10px",
      }}
    >
      Export Excel
    </Button>

    <Button
      variant="contained"
      onClick={() => window.print()}
      sx={{
        bgcolor: "#111827",
        textTransform: "none",
        borderRadius: "10px",
      }}
    >
      Print
    </Button>
  </Box>
</Box>
<Paper
  sx={{
    mt: 3,
    width: "100%",
    borderRadius: "20px",
    border: "1px solid #E5E7EB",
    boxShadow: "0 8px 30px rgba(0,0,0,0.05)",
    overflow: "hidden",
  }}
>
  <TableContainer
  sx={{
    width: "100%",
    overflowX: "auto",
    overflowY: "auto",
    maxHeight: 600,
  }}
>
  <Table
  stickyHeader
  sx={{
    minWidth: 1900,
    tableLayout: "auto",
  }}
>
    <TableHead>

<TableRow>

<TableCell sx={{fontWeight:700}}>
Issue Date
</TableCell>

<TableCell sx={{fontWeight:700}}>
Issue No
</TableCell>

<TableCell sx={{fontWeight:700}}>
Ack Date
</TableCell>

<TableCell sx={{fontWeight:700}}>
Ack No
</TableCell>

<TableCell sx={{fontWeight:700}}>
Item
</TableCell>

<TableCell sx={{fontWeight:700}}>
Lorry No
</TableCell>

<TableCell sx={{fontWeight:700}}>
Place Of Deposit
</TableCell>

<TableCell sx={{fontWeight:700}}>
Sample No
</TableCell>

<TableCell sx={{fontWeight:700}}>
Variety
</TableCell>

<TableCell sx={{fontWeight:700}}>
Total Net Weight
</TableCell>

<TableCell sx={{fontWeight:700}}>
Balance Rice Due
</TableCell>

<TableCell sx={{fontWeight:700}}>
ONBG
</TableCell>

<TableCell sx={{fontWeight:700}}>
SSG
</TableCell>

<TableCell sx={{fontWeight:700}}>
SWP
</TableCell>

<TableCell sx={{fontWeight:700}}>
USB
</TableCell>

<TableCell sx={{fontWeight:700}}>
No Of Bags
</TableCell>

<TableCell sx={{fontWeight:700}}>
Total Bags
</TableCell>

<TableCell sx={{fontWeight:700}}>
Balance Bags
</TableCell>

<TableCell
align="center"
sx={{fontWeight:700}}
>

Actions

</TableCell>

</TableRow>

</TableHead>

<TableBody>

{filteredRows.map((row,index)=>(

<TableRow key={row._id} hover>

<TableCell>
{row.issueDate
? new Date(row.issueDate).toLocaleDateString("en-GB")
: "-"}
</TableCell>

<TableCell>
{row.issueNumber}
</TableCell>

<TableCell>
{row.acknowledgeDate
? new Date(row.acknowledgeDate).toLocaleDateString("en-GB")
: "-"}
</TableCell>

<TableCell>
{row.acknowledgeNumber}
</TableCell>

<TableCell>
{row.item}
</TableCell>

<TableCell>
{row.lorryNo}
</TableCell>

<TableCell>
{row.placeOfDeposit}
</TableCell>

<TableCell>
{row.sampleNo}
</TableCell>

<TableCell>
{row.variety === "A" ? "Grade A" : row.variety === "B" ? "Common B" : (row.variety || "Grade A")}
</TableCell>

<TableCell>
{row.totalNetWeight ?? row.netWeight ?? "-"}
</TableCell>

<TableCell>
{row.balanceRiceDue ?? "-"}
</TableCell>

<TableCell>
{row.onbg ?? "-"}
</TableCell>

<TableCell>
{row.ssg ?? "-"}
</TableCell>

<TableCell>
{row.swp ?? "-"}
</TableCell>

<TableCell>
{row.usb ?? "-"}
</TableCell>

<TableCell>
{row.noOfBags}
</TableCell>

<TableCell>
{row.totalNoOfBags}
</TableCell>

<TableCell>
{row.balanceNoOfBags}
</TableCell>

<TableCell align="center">

<Button
variant="contained"
size="small"
sx={{
mr:1,
bgcolor:"#111827",
textTransform:"none",
}}
onClick={()=>handleEdit(row._id)}
>

Edit

</Button>

<Button
variant="contained"
color="error"
size="small"
onClick={()=>handleDelete(row._id)}
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
    onClose={() =>
      setDeleteSuccess(false)
    }
    sx={{
      width: "100%",
    }}
  >
    Outward Deleted Successfully
  </Alert>
</Snackbar>
</Box>
</Box>
);
}