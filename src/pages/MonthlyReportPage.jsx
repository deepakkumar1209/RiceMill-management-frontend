import React, {
  useState,
  useMemo,
} from "react";

import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Stack,
  Divider,
} from "@mui/material";

import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PrintIcon from "@mui/icons-material/Print";
import SearchIcon from "@mui/icons-material/Search";
import InventoryIcon from "@mui/icons-material/Inventory";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

import * as XLSX from "xlsx";

import Sidebar from "../components/Sidebar";

import {
  getMonthlyReport,
  closeMonth,
} from "../services/monthlyReportService";

export default function MonthlyReportPage() {
  // ===========================
  // STATES
  // ===========================
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  // Table Filters
  const [filterType, setFilterType] = useState("ALL");
  const [filterItem, setFilterItem] = useState("ALL");
  const [filterVariety, setFilterVariety] = useState("ALL");
  const [search, setSearch] = useState("");

  // ===========================
  // GENERATE REPORT
  // ===========================
  const handleGenerate = async () => {
    if (!fromDate || !toDate) {
      alert("Please select both From Date and To Date.");
      return;
    }

    try {
      setLoading(true);
      const data = await getMonthlyReport(fromDate, toDate);
      setReport(data);
    } catch (error) {
      console.log(error);
      alert("Unable to generate report.");
    } finally {
      setLoading(false);
    }
  };

  // ===========================
  // CLOSE MONTH
  // ===========================
  const handleCloseMonth = async () => {
    if (!report) return;

    const confirmClose = window.confirm(
      "Do you want to close this month?\n\nThe Closing Balance will become the Opening Balance for the next month for each item and variety."
    );

    if (!confirmClose) return;

    try {
      setClosing(true);
      await closeMonth({
        month: report.month,
        year: report.year,
        closingWeight: report.summary.closingWeight,
        closingBags: report.summary.closingBags,
        breakdown: report.breakdown || [],
      });

      setMessage("Month Closed Successfully.");
      setSuccess(true);
    } catch (error) {
      console.log(error);
      const errorMsg =
        error.response?.data?.message || "Unable to close month.";
      alert(errorMsg);
    } finally {
      setClosing(false);
    }
  };

  // ===========================
  // RUNNING BALANCE CALCULATION
  // ===========================
  const transactionsWithRunningBalance = useMemo(() => {
    if (!report?.transactions) return [];

    let currentWeight = Number(report.opening?.weight || 0);
    let currentBags = Number(report.opening?.bags || 0);

    return report.transactions.map((tx) => {
      currentWeight +=
        Number(tx.inwardWeight || 0) - Number(tx.outwardWeight || 0);
      currentBags +=
        Number(tx.inwardBags || 0) - Number(tx.outwardBags || 0);

      return {
        ...tx,
        runningWeight: Number(currentWeight.toFixed(2)),
        runningBags: Number(currentBags.toFixed(2)),
      };
    });
  }, [report]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactionsWithRunningBalance.filter((tx) => {
      if (filterType !== "ALL" && tx.type !== filterType) return false;
      if (filterItem !== "ALL" && tx.item !== filterItem) return false;
      if (filterVariety !== "ALL" && (tx.variety || "A") !== filterVariety)
        return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchIssue = tx.issueNumber?.toLowerCase().includes(q);
        const matchAck = tx.acknowledgeNumber?.toLowerCase().includes(q);
        const matchItem = tx.item?.toLowerCase().includes(q);
        const matchVariety = tx.variety?.toLowerCase().includes(q);
        if (!matchIssue && !matchAck && !matchItem && !matchVariety)
          return false;
      }

      return true;
    });
  }, [
    transactionsWithRunningBalance,
    filterType,
    filterItem,
    filterVariety,
    search,
  ]);

  // Unique Items from report breakdown
  const availableItems = useMemo(() => {
    if (!report?.breakdown) return [];
    return Array.from(new Set(report.breakdown.map((b) => b.item)));
  }, [report]);

  // Count tallies for filter buttons
  const inwardTxCount = useMemo(() => {
    return (
      report?.transactions?.filter((t) => t.type === "INWARD").length || 0
    );
  }, [report]);

  const outwardTxCount = useMemo(() => {
    return (
      report?.transactions?.filter((t) => t.type === "OUTWARD").length || 0
    );
  }, [report]);

  // ===========================
  // EXCEL EXPORT
  // ===========================
  const handleExportExcel = () => {
    if (!report) return;

    const wb = XLSX.utils.book_new();

    // Sheet 1: Stock Summary by Item & Variety
    const summarySheetData = [
      ["MONTHLY INVENTORY REPORT - STOCK BY ITEM & VARIETY"],
      [`Date Range: ${fromDate} to ${toDate}`],
      [],
      [
        "Item",
        "Variety",
        "Opening Weight (Kg)",
        "Opening Bags",
        "Inward Weight (Kg)",
        "Inward Bags",
        "Inward Count",
        "Outward Weight (Kg)",
        "Outward Bags",
        "Outward Count",
        "Closing Weight (Kg)",
        "Closing Bags",
      ],
    ];

    (report.breakdown || []).forEach((row) => {
      summarySheetData.push([
        row.item,
        row.variety,
        row.openingWeight,
        row.openingBags,
        row.inwardWeight,
        row.inwardBags,
        row.inwardCount,
        row.outwardWeight,
        row.outwardBags,
        row.outwardCount,
        row.closingWeight,
        row.closingBags,
      ]);
    });

    // Totals row
    summarySheetData.push([
      "TOTAL",
      "",
      report.opening?.weight ?? 0,
      report.opening?.bags ?? 0,
      report.summary?.totalInwardWeight ?? 0,
      report.summary?.totalInwardBags ?? 0,
      report.summary?.totalInwardCount ?? 0,
      report.summary?.totalOutwardWeight ?? 0,
      report.summary?.totalOutwardBags ?? 0,
      report.summary?.totalOutwardCount ?? 0,
      report.summary?.closingWeight ?? 0,
      report.summary?.closingBags ?? 0,
    ]);

    const wsSummary = XLSX.utils.aoa_to_sheet(summarySheetData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Stock Summary");

    // Sheet 2: Transactions Ledger
    const ledgerSheetData = [
      ["TRANSACTION LEDGER"],
      [
        `Filters: Type=${filterType}, Item=${filterItem}, Variety=${filterVariety}, Search='${search}'`,
      ],
      [],
      [
        "Date",
        "Type",
        "Issue Number",
        "Ack Number",
        "Item",
        "Variety",
        "Inward Weight (Kg)",
        "Outward Weight (Kg)",
        "Running Balance Weight (Kg)",
        "Inward Bags",
        "Outward Bags",
        "Running Balance Bags",
      ],
    ];

    filteredTransactions.forEach((tx) => {
      ledgerSheetData.push([
        tx.issueDate
          ? new Date(tx.issueDate).toLocaleDateString("en-GB")
          : "-",
        tx.type,
        tx.issueNumber || "-",
        tx.acknowledgeNumber || "-",
        tx.item,
        tx.variety || "A",
        tx.inwardWeight || 0,
        tx.outwardWeight || 0,
        tx.runningWeight,
        tx.inwardBags || 0,
        tx.outwardBags || 0,
        tx.runningBags,
      ]);
    });

    const wsLedger = XLSX.utils.aoa_to_sheet(ledgerSheetData);
    XLSX.utils.book_append_sheet(wb, wsLedger, "Transactions Ledger");

    // Download file
    const safeFrom = fromDate.replace(/\//g, "-");
    const safeTo = toDate.replace(/\//g, "-");
    XLSX.writeFile(
      wb,
      `Monthly_Inventory_Report_${safeFrom}_to_${safeTo}.xlsx`
    );
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
          overflowX: "hidden",
        }}
      >
        {/* ==========================================
            PAGE HEADER
        =========================================== */}
        <Paper
          sx={{
            p: 4,
            borderRadius: "20px",
            border: "1px solid #E5E7EB",
            boxShadow: "0px 10px 25px rgba(0,0,0,0.05)",
          }}
        >
          <Typography variant="h4" fontWeight={700}>
            Monthly Inventory Report
          </Typography>
          <Typography sx={{ color: "#6B7280", mt: 1 }}>
            Item & variety-wise stock balances, comprehensive inward/outward
            movements, and exportable transaction ledger.
          </Typography>
        </Paper>

        {/* ==========================================
            FILTER SECTION
        =========================================== */}
        <Paper
          sx={{
            mt: 4,
            p: 4,
            borderRadius: "20px",
            border: "1px solid #E5E7EB",
            boxShadow: "0px 10px 25px rgba(0,0,0,0.05)",
          }}
        >
          <Typography variant="h6" fontWeight={600} mb={3}>
            Report Period Filters
          </Typography>

          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                type="date"
                label="From Date"
                slotProps={{ inputLabel: { shrink: true } }}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                type="date"
                label="To Date"
                slotProps={{ inputLabel: { shrink: true } }}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Button
                fullWidth
                variant="contained"
                disabled={loading}
                onClick={handleGenerate}
                sx={{
                  height: 56,
                  bgcolor: "#111827",
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor: "#1F2937",
                  },
                }}
              >
                {loading ? "Generating Report..." : "Generate Report"}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* ==========================================
            REPORT CONTENT
        =========================================== */}
        {report && (
          <>
            {/* ==========================
                1. OVERALL KPI CARDS
            =========================== */}
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ mt: 5, mb: 3 }}
            >
              Overall Stock Movement
            </Typography>

            <Grid container spacing={3}>
              {/* Opening Balance Card */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  sx={{
                    borderRadius: "20px",
                    boxShadow: "0px 8px 24px rgba(0,0,0,0.05)",
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography color="text.secondary" fontWeight={600}>
                        Opening Balance
                      </Typography>
                      <AccountBalanceIcon sx={{ color: "#6B7280" }} />
                    </Stack>

                    <Typography
                      variant="h4"
                      fontWeight={700}
                      mt={2}
                      color="#111827"
                    >
                      {report.opening?.weight ?? 0}
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        ml={1}
                      >
                        Kg
                      </Typography>
                    </Typography>

                    <Typography color="text.secondary" mt={1}>
                      {report.opening?.bags ?? 0} Bags
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Inward Stock Card */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  sx={{
                    borderRadius: "20px",
                    boxShadow: "0px 8px 24px rgba(0,0,0,0.05)",
                    border: "1px solid #BBF7D0",
                    bgcolor: "#F0FDF4",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography color="#166534" fontWeight={600}>
                        Total Inward Stock
                      </Typography>
                      <ArrowDownwardIcon sx={{ color: "#16A34A" }} />
                    </Stack>

                    <Typography
                      variant="h4"
                      fontWeight={700}
                      mt={2}
                      color="#166534"
                    >
                      {report.summary?.totalInwardWeight ?? 0}
                      <Typography
                        component="span"
                        variant="body2"
                        color="#166534"
                        ml={1}
                      >
                        Kg
                      </Typography>
                    </Typography>

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      mt={1}
                    >
                      <Typography color="#166534">
                        {report.summary?.totalInwardBags ?? 0} Bags
                      </Typography>
                      <Chip
                        label={`${report.summary?.totalInwardCount ?? 0} Inwards`}
                        size="small"
                        sx={{
                          bgcolor: "#DCFCE7",
                          color: "#166534",
                          fontWeight: 600,
                        }}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Outward Stock Card */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  sx={{
                    borderRadius: "20px",
                    boxShadow: "0px 8px 24px rgba(0,0,0,0.05)",
                    border: "1px solid #BFDBFE",
                    bgcolor: "#EFF6FF",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography color="#1E40AF" fontWeight={600}>
                        Total Outward Stock
                      </Typography>
                      <ArrowUpwardIcon sx={{ color: "#2563EB" }} />
                    </Stack>

                    <Typography
                      variant="h4"
                      fontWeight={700}
                      mt={2}
                      color="#1E40AF"
                    >
                      {report.summary?.totalOutwardWeight ?? 0}
                      <Typography
                        component="span"
                        variant="body2"
                        color="#1E40AF"
                        ml={1}
                      >
                        Kg
                      </Typography>
                    </Typography>

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      mt={1}
                    >
                      <Typography color="#1E40AF">
                        {report.summary?.totalOutwardBags ?? 0} Bags
                      </Typography>
                      <Chip
                        label={`${report.summary?.totalOutwardCount ?? 0} Outwards`}
                        size="small"
                        sx={{
                          bgcolor: "#DBEAFE",
                          color: "#1E40AF",
                          fontWeight: 600,
                        }}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Closing Balance Card */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  sx={{
                    borderRadius: "20px",
                    boxShadow: "0px 10px 30px rgba(0,0,0,0.15)",
                    bgcolor: "#111827",
                    color: "#FFFFFF",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography color="#9CA3AF" fontWeight={600}>
                        Closing Balance
                      </Typography>
                      <InventoryIcon sx={{ color: "#10B981" }} />
                    </Stack>

                    <Typography
                      variant="h4"
                      fontWeight={700}
                      mt={2}
                      color="#FFFFFF"
                    >
                      {report.summary?.closingWeight ?? 0}
                      <Typography
                        component="span"
                        variant="body2"
                        color="#9CA3AF"
                        ml={1}
                      >
                        Kg
                      </Typography>
                    </Typography>

                    <Typography color="#10B981" mt={1} fontWeight={600}>
                      {report.summary?.closingBags ?? 0} Bags
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* ========================================================
                2. ITEM & VARIETY-WISE BREAKDOWN TABLE
            ========================================================= */}
            <Box
              sx={{
                mt: 6,
                mb: 3,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  Stock Balance by Item & Variety
                </Typography>
                <Typography color="text.secondary" mt={0.5}>
                  Opening balance, inward/outward counts and weights, and closing
                  stock grouped by item and variety.
                </Typography>
              </Box>
            </Box>

            <Paper
              sx={{
                borderRadius: "20px",
                overflow: "hidden",
                border: "1px solid #E5E7EB",
                boxShadow: "0px 10px 30px rgba(0,0,0,0.05)",
                mb: 6,
              }}
            >
              <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                <Table sx={{ minWidth: 1000 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                      <TableCell sx={{ fontWeight: 700, py: 2 }}>Item</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 2 }}>Variety</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, py: 2 }}>
                        Opening Wt (Kg)
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, py: 2 }}>
                        Opening Bags
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, py: 2 }}>
                        Inward Wt (Kg)
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, py: 2 }}>
                        Inward Bags
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, py: 2 }}>
                        Inward Count
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, py: 2 }}>
                        Outward Wt (Kg)
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, py: 2 }}>
                        Outward Bags
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, py: 2 }}>
                        Outward Count
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, py: 2 }}>
                        Closing Wt (Kg)
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, py: 2 }}>
                        Closing Bags
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {(report.breakdown || []).map((row, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {row.item}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`Variety ${row.variety || "A"}`}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor:
                                row.variety === "C" ? "#F59E0B" : "#3B82F6",
                              color:
                                row.variety === "C" ? "#B45309" : "#1D4ED8",
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {row.openingWeight}
                        </TableCell>
                        <TableCell align="right">
                          {row.openingBags}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ color: "#166534", fontWeight: 600 }}
                        >
                          {row.inwardWeight}
                        </TableCell>
                        <TableCell align="right">
                          {row.inwardBags}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={row.inwardCount}
                            size="small"
                            sx={{
                              bgcolor:
                                row.inwardCount > 0 ? "#DCFCE7" : "#F3F4F6",
                              color:
                                row.inwardCount > 0 ? "#166534" : "#9CA3AF",
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ color: "#1E40AF", fontWeight: 600 }}
                        >
                          {row.outwardWeight}
                        </TableCell>
                        <TableCell align="right">
                          {row.outwardBags}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={row.outwardCount}
                            size="small"
                            sx={{
                              bgcolor:
                                row.outwardCount > 0 ? "#DBEAFE" : "#F3F4F6",
                              color:
                                row.outwardCount > 0 ? "#1E40AF" : "#9CA3AF",
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: 700, color: "#111827" }}
                        >
                          {row.closingWeight}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: 700, color: "#111827" }}
                        >
                          {row.closingBags}
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* TOTAL FOOTER ROW */}
                    <TableRow
                      sx={{
                        bgcolor: "#F1F5F9",
                        borderTop: "2px solid #CBD5E1",
                      }}
                    >
                      <TableCell sx={{ fontWeight: 700 }}>
                        TOTAL
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        -
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {report.opening?.weight ?? 0}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {report.opening?.bags ?? 0}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: 700, color: "#166534" }}
                      >
                        {report.summary?.totalInwardWeight ?? 0}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {report.summary?.totalInwardBags ?? 0}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                        <Chip
                          label={report.summary?.totalInwardCount ?? 0}
                          size="small"
                          sx={{
                            bgcolor: "#166534",
                            color: "#FFFFFF",
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: 700, color: "#1E40AF" }}
                      >
                        {report.summary?.totalOutwardWeight ?? 0}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {report.summary?.totalOutwardBags ?? 0}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                        <Chip
                          label={report.summary?.totalOutwardCount ?? 0}
                          size="small"
                          sx={{
                            bgcolor: "#1E40AF",
                            color: "#FFFFFF",
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1rem" }}
                      >
                        {report.summary?.closingWeight ?? 0}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1rem" }}
                      >
                        {report.summary?.closingBags ?? 0}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* ========================================================
                3. TRANSACTION LEDGER WITH FILTERS & EXPORT
            ========================================================= */}
            <Box
              sx={{
                mt: 6,
                mb: 3,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  Transaction Ledger
                </Typography>
                <Typography color="text.secondary" mt={0.5}>
                  Detailed inward and outward entries with interactive filters
                  and Excel download.
                </Typography>
              </Box>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={handleExportExcel}
                  startIcon={<FileDownloadIcon />}
                  sx={{
                    bgcolor: "#16A34A",
                    color: "#FFFFFF",
                    textTransform: "none",
                    borderRadius: "10px",
                    fontWeight: 600,
                    px: 3,
                    "&:hover": {
                      bgcolor: "#15803D",
                    },
                  }}
                >
                  Export Excel
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => window.print()}
                  startIcon={<PrintIcon />}
                  sx={{
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Print
                </Button>
              </Stack>
            </Box>

            {/* Interactive Filter Toolbar */}
            <Paper
              sx={{
                p: 3,
                mb: 3,
                borderRadius: "20px",
                border: "1px solid #E5E7EB",
                boxShadow: "0px 8px 24px rgba(0,0,0,0.04)",
              }}
            >
              <Grid container spacing={2} alignItems="center">
                {/* Type Toggle: ALL / INWARD / OUTWARD */}
                <Grid size={{ xs: 12, md: 5 }}>
                  <ToggleButtonGroup
                    value={filterType}
                    exclusive
                    onChange={(e, val) => val && setFilterType(val)}
                    fullWidth
                    sx={{
                      "& .MuiToggleButton-root": {
                        textTransform: "none",
                        fontWeight: 600,
                        py: 1,
                        borderRadius: "10px",
                      },
                      "& .Mui-selected": {
                        bgcolor: "#111827 !important",
                        color: "#FFFFFF !important",
                      },
                    }}
                  >
                    <ToggleButton value="ALL">
                      All ({report.transactions?.length || 0})
                    </ToggleButton>
                    <ToggleButton value="INWARD">
                      Inward ({inwardTxCount})
                    </ToggleButton>
                    <ToggleButton value="OUTWARD">
                      Outward ({outwardTxCount})
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Grid>

                {/* Item Filter Dropdown */}
                <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Filter by Item</InputLabel>
                    <Select
                      value={filterItem}
                      label="Filter by Item"
                      onChange={(e) => setFilterItem(e.target.value)}
                    >
                      <MenuItem value="ALL">All Items</MenuItem>
                      {availableItems.map((it) => (
                        <MenuItem key={it} value={it}>
                          {it}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Variety Filter Dropdown */}
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Filter by Variety</InputLabel>
                    <Select
                      value={filterVariety}
                      label="Filter by Variety"
                      onChange={(e) => setFilterVariety(e.target.value)}
                    >
                      <MenuItem value="ALL">All Varieties</MenuItem>
                      <MenuItem value="A">Variety A</MenuItem>
                      <MenuItem value="C">Variety C</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Search Text Field */}
                <Grid size={{ xs: 12, md: 2.5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search Memo, Ack No..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Transaction Ledger Table */}
            <Paper
              sx={{
                borderRadius: "20px",
                overflow: "hidden",
                border: "1px solid #E5E7EB",
                boxShadow: "0px 10px 30px rgba(0,0,0,0.05)",
                mb: 6,
              }}
            >
              <TableContainer
                sx={{
                  width: "100%",
                  overflowX: "auto",
                  overflowY: "auto",
                  maxHeight: 650,
                }}
              >
                <Table stickyHeader sx={{ minWidth: 1200 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                      <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Issue No</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Ack No</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Variety</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        Inward Wt (Kg)
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        Outward Wt (Kg)
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        Balance Wt (Kg)
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        Inward Bags
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        Outward Bags
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        Balance Bags
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={12} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            No transactions match the selected filters.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransactions.map((row, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            {row.issueDate
                              ? new Date(row.issueDate).toLocaleDateString(
                                  "en-GB"
                                )
                              : "-"}
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={row.type}
                              size="small"
                              sx={{
                                bgcolor:
                                  row.type === "INWARD"
                                    ? "#DCFCE7"
                                    : "#DBEAFE",
                                color:
                                  row.type === "INWARD"
                                    ? "#166534"
                                    : "#1E40AF",
                                fontWeight: 700,
                              }}
                            />
                          </TableCell>

                          <TableCell>{row.issueNumber}</TableCell>
                          <TableCell>{row.acknowledgeNumber}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {row.item}
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={`Variety ${row.variety || "A"}`}
                              size="small"
                              variant="outlined"
                              sx={{
                                borderColor:
                                  row.variety === "C" ? "#F59E0B" : "#94A3B8",
                                color:
                                  row.variety === "C" ? "#B45309" : "#475569",
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>

                          <TableCell
                            align="right"
                            sx={{
                              color: row.inwardWeight > 0 ? "#166534" : "inherit",
                              fontWeight: row.inwardWeight > 0 ? 600 : "normal",
                            }}
                          >
                            {row.inwardWeight > 0 ? row.inwardWeight : "-"}
                          </TableCell>

                          <TableCell
                            align="right"
                            sx={{
                              color: row.outwardWeight > 0 ? "#1E40AF" : "inherit",
                              fontWeight: row.outwardWeight > 0 ? 600 : "normal",
                            }}
                          >
                            {row.outwardWeight > 0 ? row.outwardWeight : "-"}
                          </TableCell>

                          <TableCell
                            align="right"
                            sx={{ fontWeight: 700, color: "#111827" }}
                          >
                            {row.runningWeight}
                          </TableCell>

                          <TableCell align="right">
                            {row.inwardBags > 0 ? row.inwardBags : "-"}
                          </TableCell>

                          <TableCell align="right">
                            {row.outwardBags > 0 ? row.outwardBags : "-"}
                          </TableCell>

                          <TableCell
                            align="right"
                            sx={{ fontWeight: 700, color: "#111827" }}
                          >
                            {row.runningBags}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* ========================================================
                4. CLOSE MONTH SECTION
            ========================================================= */}
            <Paper
              sx={{
                p: 4,
                borderRadius: "20px",
                border: "1px solid #E5E7EB",
                boxShadow: "0px 10px 25px rgba(0,0,0,0.05)",
              }}
            >
              <Typography variant="h5" fontWeight={700}>
                Month Closing
              </Typography>
              <Typography sx={{ mt: 1, color: "#6B7280" }}>
                Review the closing balances before finalizing this month.
              </Typography>

              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ borderRadius: "18px", border: "1px solid #E5E7EB" }}>
                    <CardContent>
                      <Typography color="text.secondary">
                        Closing Weight
                      </Typography>
                      <Typography variant="h4" fontWeight={700} mt={1}>
                        {report.summary?.closingWeight ?? 0} Kg
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ borderRadius: "18px", border: "1px solid #E5E7EB" }}>
                    <CardContent>
                      <Typography color="text.secondary">
                        Closing Bags
                      </Typography>
                      <Typography variant="h4" fontWeight={700} mt={1}>
                        {report.summary?.closingBags ?? 0} Bags
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Paper
                sx={{
                  mt: 4,
                  p: 3,
                  bgcolor: "#FFF8E1",
                  border: "1px solid #FFE082",
                  borderRadius: "15px",
                }}
              >
                <Typography fontWeight={700}>Month End Confirmation</Typography>
                <Typography sx={{ mt: 1, color: "#6B7280" }}>
                  Do you want to use this Closing Balance as the Opening Balance
                  for the next month for all items and varieties?
                </Typography>

                <Box
                  sx={{
                    mt: 3,
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    variant="contained"
                    disabled={closing}
                    onClick={handleCloseMonth}
                    sx={{
                      bgcolor: "#111827",
                      px: 5,
                      py: 1.5,
                      borderRadius: "12px",
                      textTransform: "none",
                      fontWeight: 600,
                      "&:hover": {
                        bgcolor: "#1F2937",
                      },
                    }}
                  >
                    {closing ? "Closing..." : "Close Month"}
                  </Button>
                </Box>
              </Paper>
            </Paper>
          </>
        )}

        {/* ==========================================
            SUCCESS SNACKBAR
        =========================================== */}
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
          >
            {message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}
