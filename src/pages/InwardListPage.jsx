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
import { printTable } from "../utils/printTable";
import {
  getInwards,
  deleteInward,
} from "../services/inwardService";
export default function InwardListPage() {

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
    const data = await getInwards();

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
    await deleteInward(id);

    setDeleteSuccess(true);

    loadData();
  } catch (error) {
    console.log(error);
  }
};

const handleEdit = (id) => {
  navigate(`/inwards?id=${id}`);
};

const filteredRows = rows.filter((row) => {

  const searchText = search.toLowerCase();

  return (

    row.acknowledgeNumber?.toLowerCase().includes(searchText) ||

    row.issueMemoNo?.toLowerCase().includes(searchText) ||

    row.item?.toLowerCase().includes(searchText) ||

    row.dpcFrom?.toLowerCase().includes(searchText) ||

    row.warehouse?.toLowerCase().includes(searchText) ||

    row.lorryNo?.toLowerCase().includes(searchText)

  );

});

const handlePrintInwards = () => {
  printTable({
    title: "RICE MILL MANAGEMENT - INWARD TRANSACTIONS REGISTER",
    subtitle: `Total Inward Entries: ${filteredRows.length}${search ? ` | Search: "${search}"` : ""}`,
    summary: [
      { label: "Total Entries", value: `${filteredRows.length}` },
      {
        label: "Total Net Wt",
        value: `${filteredRows.reduce((sum, r) => sum + (Number(r.totalNetWeight) || 0), 0).toLocaleString()} Kg`,
      },
      {
        label: "Total Bags",
        value: `${filteredRows.reduce((sum, r) => sum + (Number(r.totalNoOfBags) || 0), 0).toLocaleString()} Bags`,
      },
      {
        label: "Total Rice Due",
        value: `${filteredRows.reduce((sum, r) => sum + (Number(r.totalRiceDue) || 0), 0).toLocaleString()} Kg`,
      },
    ],
    columns: [
      {
        label: "Issue Date",
        align: "center",
        render: (r) => (r.issueDate ? new Date(r.issueDate).toLocaleDateString("en-GB").replace(/\//g, "-") : "-"),
      },
      {
        label: "Ack Date",
        align: "center",
        render: (r) => (r.acknowledgeDate ? new Date(r.acknowledgeDate).toLocaleDateString("en-GB").replace(/\//g, "-") : "-"),
      },
      { label: "Ack No", key: "acknowledgeNumber" },
      { label: "Issue Memo", key: "issueMemoNo" },
      { label: "Item", key: "item" },
      { label: "Godown", key: "dpcFrom" },
      { label: "Warehouse", key: "warehouse" },
      { label: "Lorry No", key: "lorryNo" },
      {
        label: "Variety",
        align: "center",
        render: (r) => `<span class="badge ${r.variety === "A" ? "badge-grade-a" : "badge-common-b"}">${r.variety === "A" ? "Grade A" : r.variety === "B" ? "Common B" : (r.variety || "-")}</span>`,
      },
      {
        label: "Net Wt (Kg)",
        align: "right",
        render: (r) => Number(r.totalNetWeight || 0).toLocaleString(),
      },
      { label: "NBG", align: "center", render: (r) => r.nbg ?? "-" },
      { label: "ONB", align: "center", render: (r) => r.onb ?? "-" },
      { label: "SSG", align: "center", render: (r) => r.ssg ?? "-" },
      { label: "SWP", align: "center", render: (r) => r.swp ?? "-" },
      { label: "USB", align: "center", render: (r) => r.usb ?? "-" },
      {
        label: "Total Bags",
        align: "center",
        render: (r) => Number(r.totalNoOfBags || 0).toLocaleString(),
      },
      {
        label: "Outturn %",
        align: "center",
        render: (r) => (r.riceOutturn ? `${r.riceOutturn}%` : "-"),
      },
      {
        label: "Rice Due (Kg)",
        align: "right",
        render: (r) => Number(r.totalRiceDue || 0).toLocaleString(),
      },
    ],
    rows: filteredRows,
    footer: [
      { content: "TOTAL", colSpan: 9, align: "left" },
      {
        content: `${filteredRows.reduce((sum, r) => sum + (Number(r.totalNetWeight) || 0), 0).toLocaleString()} Kg`,
        align: "right",
      },
      { content: `${filteredRows.reduce((sum, r) => sum + (Number(r.nbg) || 0), 0).toLocaleString()}`, align: "center" },
      { content: `${filteredRows.reduce((sum, r) => sum + (Number(r.onb) || 0), 0).toLocaleString()}`, align: "center" },
      { content: `${filteredRows.reduce((sum, r) => sum + (Number(r.ssg) || 0), 0).toLocaleString()}`, align: "center" },
      { content: `${filteredRows.reduce((sum, r) => sum + (Number(r.swp) || 0), 0).toLocaleString()}`, align: "center" },
      { content: `${filteredRows.reduce((sum, r) => sum + (Number(r.usb) || 0), 0).toLocaleString()}`, align: "center" },
      { content: `${filteredRows.reduce((sum, r) => sum + (Number(r.totalNoOfBags) || 0), 0).toLocaleString()} Bags`, align: "center" },
      { content: "-", align: "center" },
      {
        content: `${filteredRows.reduce((sum, r) => sum + (Number(r.totalRiceDue) || 0), 0).toLocaleString()} Kg`,
        align: "right",
      },
    ],
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
    width: "100%",
    p: { xs: 2, sm: 3, md: 4 },
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

Inward List

</Typography>

<Typography
sx={{
color:"#6B7280",
mt:1
}}
>

View and manage inward entries

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
    Inward Records
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
      onClick={handlePrintInwards}
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

    <TableCell sx={{ fontWeight: 700 }}>Issue Date</TableCell>

    <TableCell sx={{ fontWeight: 700 }}>Ack Date</TableCell>

    <TableCell sx={{ fontWeight: 700 }}>Ack No</TableCell>

    <TableCell sx={{ fontWeight: 700 }}>Issue Memo</TableCell>

    <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>

    <TableCell sx={{ fontWeight: 700 }}>Godown</TableCell>

    <TableCell sx={{ fontWeight: 700 }}>Warehouse</TableCell>

    <TableCell sx={{ fontWeight: 700 }}>Lorry No</TableCell>

    <TableCell sx={{ fontWeight: 700 }}>Variety</TableCell>

    <TableCell sx={{ fontWeight: 700 }}>Total Net Weight</TableCell>

    <TableCell sx={{ fontWeight: 700 }}>NBG</TableCell>

    <TableCell sx={{ fontWeight: 700 }}>ONB</TableCell>

    <TableCell sx={{ fontWeight: 700 }}>SSG</TableCell>

    <TableCell sx={{ fontWeight: 700 }}>SWP</TableCell>

    <TableCell sx={{ fontWeight: 700 }}>USB</TableCell>

    <TableCell sx={{ fontWeight: 700 }}>Total Bags</TableCell>

    <TableCell sx={{ fontWeight: 700 }}>Rice Outturn</TableCell>

    <TableCell sx={{ fontWeight: 700 }}>Rice Due</TableCell>

    <TableCell
      align="center"
      sx={{ fontWeight: 700 }}
    >
      Actions
    </TableCell>

  </TableRow>
</TableHead>

<TableBody>

{filteredRows.map((row,index)=>(

<TableRow key={row._id} hover>

  {/* Issue Date */}
  <TableCell>
    {row.issueDate
      ? new Date(row.issueDate)
          .toLocaleDateString("en-GB")
          .replace(/\//g, "-")
      : "-"}
  </TableCell>

  {/* Ack Date */}
  <TableCell>
    {row.acknowledgeDate
      ? new Date(row.acknowledgeDate)
          .toLocaleDateString("en-GB")
          .replace(/\//g, "-")
      : "-"}
  </TableCell>

  {/* Ack No */}
  <TableCell>
    {row.acknowledgeNumber || "-"}
  </TableCell>

  {/* Issue Memo */}
  <TableCell>
    {row.issueMemoNo || "-"}
  </TableCell>

  {/* Item */}
  <TableCell>
    {row.item || "-"}
  </TableCell>

  {/* DPC */}
  <TableCell>
    {row.dpcFrom || "-"}
  </TableCell>

  {/* Warehouse */}
  <TableCell>
    {row.warehouse || "-"}
  </TableCell>

  {/* Lorry */}
  <TableCell>
    {row.lorryNo || "-"}
  </TableCell>

  {/* Variety */}
  <TableCell>
    {row.variety === "A" ? "Grade A" : row.variety === "B" ? "Common B" : (row.variety || "-")}
  </TableCell>

  {/* Total Net Weight */}
  <TableCell>
    {row.totalNetWeight ?? "-"}
  </TableCell>

  {/* NBG */}
  <TableCell>
    {row.nbg ?? "-"}
  </TableCell>

  {/* ONB */}
  <TableCell>
    {row.onb ?? "-"}
  </TableCell>

  {/* SSG */}
  <TableCell>
    {row.ssg ?? "-"}
  </TableCell>

  {/* SWP */}
  <TableCell>
    {row.swp ?? "-"}
  </TableCell>

  {/* USB */}
  <TableCell>
    {row.usb ?? "-"}
  </TableCell>

  {/* Total Bags */}
  <TableCell>
    {row.totalNoOfBags ?? "-"}
  </TableCell>

  {/* Rice Outturn */}
  <TableCell>
    {row.riceOutturn ?? "-"}
  </TableCell>

  {/* Rice Due */}
  <TableCell>
    {row.totalRiceDue ?? "-"}
  </TableCell>

  {/* Actions */}
  <TableCell align="center">

    <Button
      variant="contained"
      size="small"
      sx={{
        mr: 1,
        bgcolor: "#111827",
        textTransform: "none",
      }}
      onClick={() => handleEdit(row._id)}
    >
      Edit
    </Button>

    <Button
      variant="contained"
      color="error"
      size="small"
      onClick={() => handleDelete(row._id)}
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
    Inward Deleted Successfully
  </Alert>
</Snackbar>
</Box>
</Box>
);
}