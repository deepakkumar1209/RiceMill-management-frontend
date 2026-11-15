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
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ScaleIcon from "@mui/icons-material/Scale";
import RestaurantIcon from "@mui/icons-material/Restaurant";

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
      // Deduct paddy equivalent in running weight calculation (e.g. 294.12 Kg)
      const weightDeduction = Number(tx.paddyEquivalentWeight ?? tx.outwardWeight ?? 0);
      currentWeight += Number(tx.inwardWeight || 0) - weightDeduction;
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

  // Group breakdown by Variety (Grade A and Common B) with Raw Paddy and Boiled Rice separated
  const varietyItemDetails = useMemo(() => {
    if (!report?.breakdown) return [];

    const varieties = [
      { key: "A", label: "Grade A", fullLabel: "Grade A / Fine Quality", color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
      { key: "B", label: "Common B", fullLabel: "Common B / Standard", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
    ];

    return varieties.map((vr) => {
      const summary = report.varietySummary?.find((v) => v.variety === vr.key) || {
        openingWeight: 0,
        openingBags: 0,
        inwardWeight: 0,
        inwardBags: 0,
        inwardCount: 0,
        outwardWeight: 0,
        outwardBags: 0,
        outwardCount: 0,
        closingWeight: 0,
        closingBags: 0,
      };

      const paddy = report.breakdown.find(
        (b) => b.variety === vr.key && b.item?.toUpperCase().includes("PADDY")
      ) || {
        item: "RAW PADDY",
        variety: vr.key,
        openingWeight: 0,
        openingBags: 0,
        inwardWeight: 0,
        inwardBags: 0,
        inwardCount: 0,
        outwardWeight: 0,
        outwardBags: 0,
        outwardCount: 0,
        closingWeight: 0,
        closingBags: 0,
        nbg: 0,
        onb: 0,
        ssg: 0,
        swp: 0,
        usb: 0,
      };

      const rice = report.breakdown.find(
        (b) => b.variety === vr.key && b.item?.toUpperCase().includes("RICE")
      ) || {
        item: "BOILED RICE",
        variety: vr.key,
        openingWeight: 0,
        openingBags: 0,
        inwardWeight: 0,
        inwardBags: 0,
        inwardCount: 0,
        outwardWeight: 0,
        outwardBags: 0,
        outwardCount: 0,
        closingWeight: 0,
        closingBags: 0,
        paddyEquivalent: 0,
        nbg: 0,
        onb: 0,
        ssg: 0,
        swp: 0,
        usb: 0,
      };

      return {
        ...vr,
        summary,
        paddy,
        rice,
      };
    });
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

    // Sheet 2: Variety Overview
    const varietySheetData = [
      ["VARIETY-WISE STOCK MOVEMENT OVERVIEW"],
      [`Date Range: ${fromDate} to ${toDate}`],
      [],
      [
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

    varietyItemDetails.forEach((grade) => {
      // Raw Paddy
      varietySheetData.push([
        `${grade.label} - RAW PADDY`,
        grade.paddy.openingWeight,
        grade.paddy.openingBags,
        grade.paddy.inwardWeight,
        grade.paddy.inwardBags,
        grade.paddy.inwardCount,
        grade.paddy.outwardWeight,
        grade.paddy.outwardBags,
        grade.paddy.outwardCount,
        grade.paddy.closingWeight,
        grade.paddy.closingBags,
      ]);
      // Boiled Rice
      varietySheetData.push([
        `${grade.label} - BOILED RICE`,
        grade.rice.openingWeight,
        grade.rice.openingBags,
        grade.rice.inwardWeight,
        grade.rice.inwardBags,
        grade.rice.inwardCount,
        grade.rice.outwardWeight,
        grade.rice.outwardBags,
        grade.rice.outwardCount,
        grade.rice.closingWeight,
        grade.rice.closingBags,
      ]);
      // Grade Total
      varietySheetData.push([
        `${grade.label} (Net Balance)`,
        grade.summary.openingWeight,
        grade.summary.openingBags,
        grade.summary.inwardWeight,
        grade.summary.inwardBags,
        grade.summary.inwardCount,
        grade.summary.outwardWeight,
        grade.summary.outwardBags,
        grade.summary.outwardCount,
        grade.summary.closingWeight,
        grade.summary.closingBags,
      ]);
    });

    const wsVariety = XLSX.utils.aoa_to_sheet(varietySheetData);
    XLSX.utils.book_append_sheet(wb, wsVariety, "Variety Overview");

    // Sheet 3: Gunny Bags Summary
    const bagSheetData = [
      ["GUNNY BAGS INVENTORY SUMMARY"],
      [`Date Range: ${fromDate} to ${toDate}`],
      [],
      ["Bag Type", "Description", "Inward Received", "Outward Issued", "Net Movement"],
    ];

    if (report.bagSummary) {
      Object.entries(report.bagSummary).forEach(([key, bag]) => {
        bagSheetData.push([bag.name, bag.label, bag.inward, bag.outward, bag.net]);
      });
    }

    const wsBags = XLSX.utils.aoa_to_sheet(bagSheetData);
    XLSX.utils.book_append_sheet(wb, wsBags, "Gunny Bags Summary");

    // Sheet 4: Transactions Ledger
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
        {/* ==========================================
            PAGE HEADER
        =========================================== */}
        <Paper
          sx={{
            p: { xs: 2.5, sm: 3, md: 4 },
            borderRadius: "20px",
            border: "1px solid #E5E7EB",
            boxShadow: "0px 10px 25px rgba(0,0,0,0.05)",
          }}
        >
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ fontSize: { xs: "1.65rem", sm: "2rem", md: "2.125rem" } }}
          >
            Monthly Inventory Report
          </Typography>
          <Typography sx={{ color: "#6B7280", mt: 1 }}>
            Item & variety-wise stock balances, specific gunny bag counts, inward/outward
            movements, and exportable transaction ledger.
          </Typography>
        </Paper>

        {/* ==========================================
            FILTER SECTION
        =========================================== */}
        <Paper
          sx={{
            mt: 3,
            p: { xs: 2.5, sm: 3, md: 4 },
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
                    height: "100%",
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

                    <Typography color="text.secondary" mt={0.5} fontWeight={600}>
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
                    height: "100%",
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
                      mt={0.5}
                    >
                      <Typography color="#166534" fontWeight={600}>
                        {report.summary?.totalInwardBags ?? 0} Bags
                      </Typography>
                      <Chip
                        label={`${report.summary?.totalInwardCount ?? 0} Inwards`}
                        size="small"
                        sx={{
                          bgcolor: "#DCFCE7",
                          color: "#166534",
                          fontWeight: 600,
                          height: 22,
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
                    height: "100%",
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
                      mt={0.5}
                    >
                      <Typography color="#1E40AF" fontWeight={600}>
                        {report.summary?.totalOutwardBags ?? 0} Bags
                      </Typography>
                      <Chip
                        label={`${report.summary?.totalOutwardCount ?? 0} Outwards`}
                        size="small"
                        sx={{
                          bgcolor: "#DBEAFE",
                          color: "#1E40AF",
                          fontWeight: 600,
                          height: 22,
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
                    height: "100%",
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

                    <Typography color="#10B981" mt={0.5} fontWeight={600}>
                      {report.summary?.closingBags ?? 0} Bags
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* ========================================================
                2. DEDICATED VARIETY SUMMARY SECTION (VARIETY A & VARIETY B)
            ========================================================= */}
            <Box sx={{ mt: 6, mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <AccountBalanceIcon sx={{ color: "#111827", fontSize: 28 }} />
                <Typography variant="h5" fontWeight={700}>
                  Stock Movement & Counts (Grade A & Common B)
                </Typography>
              </Stack>
              <Typography color="text.secondary" mt={0.5}>
                Easily monitor inward/outward transaction counts, gunny bag quantities, and net weights grouped by variety.
              </Typography>
            </Box>

            {/* Variety Cards (Side-by-side with separate RAW PADDY and BOILED RICE counts) */}
            <Grid container spacing={2.5} sx={{ mb: 4 }}>
              {varietyItemDetails.map((grade) => (
                <Grid size={{ xs: 12, lg: 6 }} key={grade.key}>
                  <Card
                    sx={{
                      borderRadius: "20px",
                      border: `2px solid ${grade.border}`,
                      bgcolor: "#FFFFFF",
                      boxShadow: "0px 6px 20px rgba(0,0,0,0.03)",
                      overflow: "hidden",
                    }}
                  >
                    {/* Grade Header */}
                    <Box
                      sx={{
                        p: 2,
                        px: 2.5,
                        bgcolor: grade.bg,
                        borderBottom: "1px solid #E5E7EB",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 1.2,
                      }}
                    >
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <Chip
                          label={grade.label}
                          sx={{
                            fontWeight: 800,
                            fontSize: "0.9rem",
                            bgcolor: grade.color,
                            color: "#FFFFFF",
                            px: 0.5,
                            height: 26,
                          }}
                        />
                        <Typography variant="subtitle1" fontWeight={800} color="#111827" sx={{ fontSize: "0.95rem" }}>
                          {grade.fullLabel}
                        </Typography>
                      </Stack>

                      {/* Header Badges */}
                      <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap">
                        <Chip
                          label={`Inward: ${grade.summary.inwardCount || 0} Load${(grade.summary.inwardCount || 0) === 1 ? "" : "s"}`}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            bgcolor: "#DCFCE7",
                            color: "#166534",
                            border: "1px solid #86EFAC",
                            height: 22,
                            fontSize: "0.72rem",
                          }}
                        />
                        <Chip
                          label={`Outward: ${grade.summary.outwardCount || 0} Issue${(grade.summary.outwardCount || 0) === 1 ? "" : "s"}`}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            bgcolor: "#DBEAFE",
                            color: "#1E40AF",
                            border: "1px solid #93C5FD",
                            height: 22,
                            fontSize: "0.72rem",
                          }}
                        />
                        <Chip
                          label={`Closing: ${(grade.summary.closingWeight || 0).toLocaleString()} Kg · ${(grade.summary.closingBags || 0).toLocaleString()} Bags`}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            bgcolor: "#111827",
                            color: "#34D399",
                            border: "1px solid #374151",
                            height: 22,
                            fontSize: "0.72rem",
                          }}
                        />
                      </Stack>
                    </Box>

                    {/* Card Content: Itemized RAW PADDY & BOILED RICE */}
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                      <Stack spacing={2}>
                        {/* 1. SEPARATE ITEM: RAW PADDY */}
                        <Box
                          sx={{
                            borderRadius: "14px",
                            border: "1.5px solid #86EFAC",
                            bgcolor: "#F0FDF4",
                            p: 1.6,
                          }}
                        >
                          {/* Item Header Strip */}
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.2, flexWrap: "wrap", gap: 0.8 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Box sx={{ p: 0.5, borderRadius: "6px", bgcolor: "#16A34A", color: "#FFFFFF", display: "flex", alignItems: "center" }}>
                                <AgricultureIcon sx={{ fontSize: 16 }} />
                              </Box>
                              <Typography variant="subtitle2" fontWeight={800} color="#166534" sx={{ fontSize: "0.85rem" }}>
                                RAW PADDY · {grade.label} Grain Stock
                              </Typography>
                            </Stack>

                            <Chip
                              icon={<InventoryIcon sx={{ fontSize: 14, color: "#166534 !important" }} />}
                              label={`Available: ${(grade.paddy.closingWeight || 0).toLocaleString()} Kg · ${(grade.paddy.closingBags || 0).toLocaleString()} Bags`}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                bgcolor: "#DCFCE7",
                                color: "#166534",
                                border: "1px solid #86EFAC",
                                height: 22,
                                fontSize: "0.72rem",
                              }}
                            />
                          </Box>

                          {/* 3 Stat Boxes Sized Perfectly to Prevent Clipping & Overlap */}
                          <Grid container spacing={1}>
                            {/* Inward Received */}
                            <Grid size={{ xs: 4 }} sx={{ minWidth: 0 }}>
                              <Box
                                sx={{
                                  p: 1.2,
                                  borderRadius: "10px",
                                  bgcolor: "#FFFFFF",
                                  border: "1px solid #BBF7D0",
                                  boxSizing: "border-box",
                                  height: "100%",
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.4 }}>
                                  <Typography variant="caption" color="#166534" fontWeight={800} letterSpacing="0.3px" sx={{ fontSize: "0.68rem" }}>
                                    INWARD
                                  </Typography>
                                  <Box sx={{ width: 22, height: 22, borderRadius: "5px", bgcolor: "#DCFCE7", color: "#16A34A", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <ArrowDownwardIcon sx={{ fontSize: 14 }} />
                                  </Box>
                                </Box>
                                <Typography variant="h6" fontWeight={800} color="#166534" sx={{ fontSize: { xs: "0.92rem", sm: "1.02rem" }, lineHeight: 1.2, my: 0.2 }}>
                                  +{(grade.paddy.inwardWeight || 0).toLocaleString()}
                                  <Typography component="span" variant="caption" fontWeight={700} ml={0.3} sx={{ fontSize: "0.68rem" }}>Kg</Typography>
                                </Typography>
                                <Typography variant="caption" color="#15803D" fontWeight={700} sx={{ fontSize: "0.68rem", lineHeight: 1.1 }}>
                                  +{(grade.paddy.inwardBags || 0).toLocaleString()} Bags · {grade.paddy.inwardCount || 0} Load
                                </Typography>
                              </Box>
                            </Grid>

                            {/* Outward Issued */}
                            <Grid size={{ xs: 4 }} sx={{ minWidth: 0 }}>
                              <Box
                                sx={{
                                  p: 1.2,
                                  borderRadius: "10px",
                                  bgcolor: "#FFFFFF",
                                  border: "1px solid #E5E7EB",
                                  boxSizing: "border-box",
                                  height: "100%",
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.4 }}>
                                  <Typography variant="caption" color="text.secondary" fontWeight={800} letterSpacing="0.3px" sx={{ fontSize: "0.68rem" }}>
                                    OUTWARD
                                  </Typography>
                                  <Box sx={{ width: 22, height: 22, borderRadius: "5px", bgcolor: "#F3F4F6", color: "#6B7280", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <LocalShippingIcon sx={{ fontSize: 14 }} />
                                  </Box>
                                </Box>
                                <Typography variant="h6" fontWeight={800} color="#4B5563" sx={{ fontSize: { xs: "0.92rem", sm: "1.02rem" }, lineHeight: 1.2, my: 0.2 }}>
                                  -{(grade.paddy.outwardWeight || 0).toLocaleString()}
                                  <Typography component="span" variant="caption" fontWeight={700} ml={0.3} sx={{ fontSize: "0.68rem" }}>Kg</Typography>
                                </Typography>
                                <Typography variant="caption" color="#6B7280" fontWeight={700} sx={{ fontSize: "0.68rem", lineHeight: 1.1 }}>
                                  -{(grade.paddy.outwardBags || 0).toLocaleString()} Bags · {grade.paddy.outwardCount || 0} Issue
                                </Typography>
                              </Box>
                            </Grid>

                            {/* Paddy Balance */}
                            <Grid size={{ xs: 4 }} sx={{ minWidth: 0 }}>
                              <Box
                                sx={{
                                  p: 1.2,
                                  borderRadius: "10px",
                                  bgcolor: "#14532D",
                                  color: "#FFFFFF",
                                  boxSizing: "border-box",
                                  height: "100%",
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.4 }}>
                                  <Typography variant="caption" sx={{ color: "#86EFAC" }} fontWeight={800} letterSpacing="0.3px" sx={{ fontSize: "0.68rem" }}>
                                    BALANCE
                                  </Typography>
                                  <Box sx={{ width: 22, height: 22, borderRadius: "5px", bgcolor: "rgba(255,255,255,0.18)", color: "#86EFAC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <InventoryIcon sx={{ fontSize: 14 }} />
                                  </Box>
                                </Box>
                                <Typography variant="h6" fontWeight={800} color="#FFFFFF" sx={{ fontSize: { xs: "0.92rem", sm: "1.02rem" }, lineHeight: 1.2, my: 0.2 }}>
                                  {(grade.paddy.closingWeight || 0).toLocaleString()}
                                  <Typography component="span" variant="caption" fontWeight={700} ml={0.3} sx={{ color: "#BBF7D0", fontSize: "0.68rem" }}>Kg</Typography>
                                </Typography>
                                <Typography variant="caption" sx={{ color: "#86EFAC" }} fontWeight={700} sx={{ fontSize: "0.68rem", lineHeight: 1.1 }}>
                                  {(grade.paddy.closingBags || 0).toLocaleString()} Bags Avail.
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>

                          {/* Paddy Gunny Bags Bar - Fits Comfortably Without Awkward Wrap */}
                          <Box
                            sx={{
                              p: 1,
                              px: 1.5,
                              mt: 1.2,
                              borderRadius: "10px",
                              bgcolor: "#FFFFFF",
                              border: "1px solid #BBF7D0",
                              display: "flex",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: 0.8,
                            }}
                          >
                            <Stack direction="row" spacing={0.6} alignItems="center" sx={{ mr: 0.5 }}>
                              <ShoppingBagIcon sx={{ fontSize: 16, color: "#166534" }} />
                              <Typography variant="caption" fontWeight={800} color="#166534" sx={{ fontSize: "0.74rem" }}>
                                Gunny Bags:
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.6} alignItems="center" flexWrap="wrap">
                              <Chip label={`NBG: ${grade.paddy.nbg || 0}`} size="small" sx={{ bgcolor: "#F0FDF4", color: "#166534", fontWeight: 700, height: 20, fontSize: "0.72rem", border: "1px solid #BBF7D0", px: 0.3 }} />
                              <Chip label={`ONBG: ${grade.paddy.onb || 0}`} size="small" sx={{ bgcolor: "#F0FDF4", color: "#166534", fontWeight: 700, height: 20, fontSize: "0.72rem", border: "1px solid #BBF7D0", px: 0.3 }} />
                              <Chip label={`SSG: ${grade.paddy.ssg || 0}`} size="small" sx={{ bgcolor: "#F0FDF4", color: "#166534", fontWeight: 700, height: 20, fontSize: "0.72rem", border: "1px solid #BBF7D0", px: 0.3 }} />
                              <Chip label={`SWP: ${grade.paddy.swp || 0}`} size="small" sx={{ bgcolor: "#F0FDF4", color: "#166534", fontWeight: 700, height: 20, fontSize: "0.72rem", border: "1px solid #BBF7D0", px: 0.3 }} />
                              <Chip label={`USB: ${grade.paddy.usb || 0}`} size="small" sx={{ bgcolor: "#F0FDF4", color: "#166534", fontWeight: 700, height: 20, fontSize: "0.72rem", border: "1px solid #BBF7D0", px: 0.3 }} />
                            </Stack>
                          </Box>
                        </Box>

                        {/* 2. SEPARATE ITEM: BOILED RICE */}
                        <Box
                          sx={{
                            borderRadius: "14px",
                            border: "1.5px solid #93C5FD",
                            bgcolor: "#EFF6FF",
                            p: 1.6,
                          }}
                        >
                          {/* Item Header Strip */}
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.2, flexWrap: "wrap", gap: 0.8 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Box sx={{ p: 0.5, borderRadius: "6px", bgcolor: "#2563EB", color: "#FFFFFF", display: "flex", alignItems: "center" }}>
                                <RestaurantIcon sx={{ fontSize: 16 }} />
                              </Box>
                              <Typography variant="subtitle2" fontWeight={800} color="#1E40AF" sx={{ fontSize: "0.85rem" }}>
                                BOILED RICE · {grade.label} Milled Rice (68%)
                              </Typography>
                            </Stack>

                            <Chip
                              icon={<LocalShippingIcon sx={{ fontSize: 14, color: "#1E40AF !important" }} />}
                              label={`Dispatched: ${(grade.rice.outwardWeight || 0).toLocaleString()} Kg · ${(grade.rice.outwardBags || 0).toLocaleString()} Bags`}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                bgcolor: "#DBEAFE",
                                color: "#1E40AF",
                                border: "1px solid #93C5FD",
                                height: 22,
                                fontSize: "0.72rem",
                              }}
                            />
                          </Box>

                          {/* 3 Stat Boxes Sized Perfectly to Prevent Clipping & Overlap */}
                          <Grid container spacing={1}>
                            {/* Inward Received */}
                            <Grid size={{ xs: 4 }} sx={{ minWidth: 0 }}>
                              <Box
                                sx={{
                                  p: 1.2,
                                  borderRadius: "10px",
                                  bgcolor: "#FFFFFF",
                                  border: "1px solid #E5E7EB",
                                  boxSizing: "border-box",
                                  height: "100%",
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.4 }}>
                                  <Typography variant="caption" color="text.secondary" fontWeight={800} letterSpacing="0.3px" sx={{ fontSize: "0.68rem" }}>
                                    INWARD
                                  </Typography>
                                  <Box sx={{ width: 22, height: 22, borderRadius: "5px", bgcolor: "#F3F4F6", color: "#6B7280", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <ArrowDownwardIcon sx={{ fontSize: 14 }} />
                                  </Box>
                                </Box>
                                <Typography variant="h6" fontWeight={800} color="#4B5563" sx={{ fontSize: { xs: "0.92rem", sm: "1.02rem" }, lineHeight: 1.2, my: 0.2 }}>
                                  +{(grade.rice.inwardWeight || 0).toLocaleString()}
                                  <Typography component="span" variant="caption" fontWeight={700} ml={0.3} sx={{ fontSize: "0.68rem" }}>Kg</Typography>
                                </Typography>
                                <Typography variant="caption" color="#6B7280" fontWeight={700} sx={{ fontSize: "0.68rem", lineHeight: 1.1 }}>
                                  +{(grade.rice.inwardBags || 0).toLocaleString()} Bags · {grade.rice.inwardCount || 0} Load
                                </Typography>
                              </Box>
                            </Grid>

                            {/* Actual Rice Outward */}
                            <Grid size={{ xs: 4 }} sx={{ minWidth: 0 }}>
                              <Box
                                sx={{
                                  p: 1.2,
                                  borderRadius: "10px",
                                  bgcolor: "#FFFFFF",
                                  border: "1px solid #BFDBFE",
                                  boxSizing: "border-box",
                                  height: "100%",
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.4 }}>
                                  <Typography variant="caption" color="#1E40AF" fontWeight={800} letterSpacing="0.3px" sx={{ fontSize: "0.68rem" }}>
                                    OUTWARD
                                  </Typography>
                                  <Box sx={{ width: 22, height: 22, borderRadius: "5px", bgcolor: "#DBEAFE", color: "#1E40AF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <LocalShippingIcon sx={{ fontSize: 14 }} />
                                  </Box>
                                </Box>
                                <Typography variant="h6" fontWeight={800} color="#1E40AF" sx={{ fontSize: { xs: "0.92rem", sm: "1.02rem" }, lineHeight: 1.2, my: 0.2 }}>
                                  -{(grade.rice.outwardWeight || 0).toLocaleString()}
                                  <Typography component="span" variant="caption" fontWeight={700} ml={0.3} sx={{ fontSize: "0.68rem" }}>Kg</Typography>
                                </Typography>
                                <Typography variant="caption" color="#1D4ED8" fontWeight={700} sx={{ fontSize: "0.68rem", lineHeight: 1.1 }}>
                                  -{(grade.rice.outwardBags || 0).toLocaleString()} Bags · {grade.rice.outwardCount || 0} Issues
                                </Typography>
                              </Box>
                            </Grid>

                            {/* Paddy Deducted */}
                            <Grid size={{ xs: 4 }} sx={{ minWidth: 0 }}>
                              <Box
                                sx={{
                                  p: 1.2,
                                  borderRadius: "10px",
                                  bgcolor: "#1E3A8A",
                                  color: "#FFFFFF",
                                  boxSizing: "border-box",
                                  height: "100%",
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.4 }}>
                                  <Typography variant="caption" sx={{ color: "#93C5FD" }} fontWeight={800} letterSpacing="0.3px" sx={{ fontSize: "0.68rem" }}>
                                    DEDUCTION
                                  </Typography>
                                  <Box sx={{ width: 22, height: 22, borderRadius: "5px", bgcolor: "rgba(255,255,255,0.18)", color: "#93C5FD", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <ScaleIcon sx={{ fontSize: 14 }} />
                                  </Box>
                                </Box>
                                <Typography variant="h6" fontWeight={800} color="#FFFFFF" sx={{ fontSize: { xs: "0.92rem", sm: "1.02rem" }, lineHeight: 1.2, my: 0.2 }}>
                                  -{(grade.rice.paddyEquivalent || 0).toLocaleString()}
                                  <Typography component="span" variant="caption" fontWeight={700} ml={0.3} sx={{ color: "#BFDBFE", fontSize: "0.68rem" }}>Kg</Typography>
                                </Typography>
                                <Typography variant="caption" sx={{ color: "#93C5FD" }} fontWeight={700} sx={{ fontSize: "0.68rem", lineHeight: 1.1 }}>
                                  Paddy Eqv. (68%)
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>

                          {/* Rice Gunny Bags Bar - Fits Comfortably Without Awkward Wrap */}
                          <Box
                            sx={{
                              p: 1,
                              px: 1.5,
                              mt: 1.2,
                              borderRadius: "10px",
                              bgcolor: "#FFFFFF",
                              border: "1px solid #BFDBFE",
                              display: "flex",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: 0.8,
                            }}
                          >
                            <Stack direction="row" spacing={0.6} alignItems="center" sx={{ mr: 0.5 }}>
                              <ShoppingBagIcon sx={{ fontSize: 16, color: "#1E40AF" }} />
                              <Typography variant="caption" fontWeight={800} color="#1E40AF" sx={{ fontSize: "0.74rem" }}>
                                Gunny Bags:
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.6} alignItems="center" flexWrap="wrap">
                              <Chip label={`SSG: ${Math.abs(grade.rice.ssg || 0)}`} size="small" sx={{ bgcolor: "#EFF6FF", color: "#1E40AF", fontWeight: 700, height: 20, fontSize: "0.72rem", border: "1px solid #BFDBFE", px: 0.3 }} />
                              <Chip label={`ONBG: ${Math.abs(grade.rice.onb || 0)}`} size="small" sx={{ bgcolor: "#EFF6FF", color: "#1E40AF", fontWeight: 700, height: 20, fontSize: "0.72rem", border: "1px solid #BFDBFE", px: 0.3 }} />
                              <Chip label={`SWP: ${Math.abs(grade.rice.swp || 0)}`} size="small" sx={{ bgcolor: "#EFF6FF", color: "#1E40AF", fontWeight: 700, height: 20, fontSize: "0.72rem", border: "1px solid #BFDBFE", px: 0.3 }} />
                              <Chip label={`USB: ${Math.abs(grade.rice.usb || 0)}`} size="small" sx={{ bgcolor: "#EFF6FF", color: "#1E40AF", fontWeight: 700, height: 20, fontSize: "0.72rem", border: "1px solid #BFDBFE", px: 0.3 }} />
                            </Stack>
                          </Box>
                        </Box>

                        {/* 3. CONSOLIDATED GRADE NET STOCK FOOTER */}
                        <Box
                          sx={{
                            borderRadius: "12px",
                            bgcolor: "#111827",
                            color: "#FFFFFF",
                            p: 1.8,
                            px: 2.2,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 1.2,
                          }}
                        >
                          <Stack direction="row" spacing={1.2} alignItems="center">
                            <Box sx={{ p: 0.8, borderRadius: "8px", bgcolor: "rgba(255,255,255,0.1)", color: "#34D399", display: "flex", alignItems: "center" }}>
                              <AccountBalanceIcon sx={{ fontSize: 20 }} />
                            </Box>
                            <Box>
                              <Typography variant="caption" sx={{ color: "#9CA3AF" }} fontWeight={800} letterSpacing="0.3px" sx={{ fontSize: "0.72rem" }}>
                                {grade.label} CONSOLIDATED NET BALANCE
                              </Typography>
                              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.85)" }} fontWeight={600} mt={0.2} sx={{ fontSize: "0.75rem" }}>
                                In: +{(grade.summary.inwardWeight || 0).toLocaleString()} Kg ({grade.summary.inwardBags || 0} Bags) · Out: -{(grade.summary.outwardWeight || 0).toLocaleString()} Kg ({grade.summary.outwardBags || 0} Bags)
                              </Typography>
                            </Box>
                          </Stack>

                          <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                            <Typography variant="h6" fontWeight={800} color="#34D399" sx={{ lineHeight: 1.2, fontSize: "1.15rem" }}>
                              {(grade.summary.closingWeight || 0).toLocaleString()}
                              <Typography component="span" variant="caption" fontWeight={700} ml={0.3} sx={{ color: "#A7F3D0" }}>
                                Kg
                              </Typography>
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#FFFFFF" }} fontWeight={700} display="block">
                              {(grade.summary.closingBags || 0).toLocaleString()} Total Bags Remaining
                            </Typography>
                          </Box>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Quick Variety Comparison Table for Instant At-a-Glance Count Review */}
            <Paper
              sx={{
                mb: 4,
                borderRadius: "18px",
                border: "1px solid #E5E7EB",
                boxShadow: "0px 6px 20px rgba(0,0,0,0.03)",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  p: 2,
                  px: 3,
                  bgcolor: "#F8FAFC",
                  borderBottom: "1px solid #E5E7EB",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="subtitle1" fontWeight={700} color="#111827">
                  Counts & Movements Table (Grade A & Common B)
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Itemized comparison of RAW PADDY vs BOILED RICE across Grade A & Common B
                </Typography>
              </Box>

              <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                <Table size="small" sx={{ minWidth: 1100 }}>
                  <TableHead sx={{ bgcolor: "#F1F5F9" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, whiteSpace: "nowrap", py: 1.8, px: 2, minWidth: 230 }}>Item & Variety</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: "#166534", whiteSpace: "nowrap", py: 1.8, px: 1.5 }}>Inward Entries</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: "#166534", whiteSpace: "nowrap", py: 1.8, px: 1.5 }}>Inward Bags</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "#166534", whiteSpace: "nowrap", py: 1.8, px: 2 }}>Inward Weight (Kg)</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: "#1E40AF", whiteSpace: "nowrap", py: 1.8, px: 1.5 }}>Outward Entries</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: "#1E40AF", whiteSpace: "nowrap", py: 1.8, px: 1.5 }}>Outward Bags</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "#1E40AF", whiteSpace: "nowrap", py: 1.8, px: 2 }}>Outward Weight (Kg)</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, whiteSpace: "nowrap", py: 1.8, px: 1.5 }}>Opening Bags</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, whiteSpace: "nowrap", py: 1.8, px: 2 }}>Opening Wt (Kg)</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800, color: "#111827", whiteSpace: "nowrap", py: 1.8, px: 1.5 }}>Closing Bags</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: "#111827", whiteSpace: "nowrap", py: 1.8, px: 2 }}>Closing Wt (Kg)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {varietyItemDetails.map((grade) => (
                      <React.Fragment key={grade.key}>
                        {/* 1. Raw Paddy Row */}
                        <TableRow hover sx={{ "&:hover": { bgcolor: "#F8FAFC" } }}>
                          <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap", py: 1.6, px: 2 }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ whiteSpace: "nowrap" }}>
                              <Chip
                                label={grade.label}
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  bgcolor: grade.key === "A" ? "#EFF6FF" : "#F5F3FF",
                                  color: grade.key === "A" ? "#1D4ED8" : "#6D28D9",
                                  border: `1px solid ${grade.key === "A" ? "#BFDBFE" : "#DDD6FE"}`,
                                  height: 22,
                                  fontSize: "0.75rem",
                                }}
                              />
                              <Typography variant="body2" fontWeight={800} color="#166534" sx={{ whiteSpace: "nowrap" }}>
                                RAW PADDY
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="center" sx={{ whiteSpace: "nowrap", py: 1.6, px: 1.5 }}>
                            <Chip
                              label={`${grade.paddy.inwardCount || 0} Inward${(grade.paddy.inwardCount || 0) === 1 ? "" : "s"}`}
                              size="small"
                              sx={{
                                height: 22,
                                fontWeight: 700,
                                bgcolor: (grade.paddy.inwardCount || 0) > 0 ? "#DCFCE7" : "#F3F4F6",
                                color: (grade.paddy.inwardCount || 0) > 0 ? "#166534" : "#9CA3AF",
                              }}
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, color: "#166534", fontSize: "0.95rem", whiteSpace: "nowrap", py: 1.6, px: 1.5 }}>
                            +{(grade.paddy.inwardBags || 0).toLocaleString()}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: "#166534", whiteSpace: "nowrap", py: 1.6, px: 2 }}>
                            +{(grade.paddy.inwardWeight || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell align="center" sx={{ whiteSpace: "nowrap", py: 1.6, px: 1.5 }}>
                            <Chip
                              label={`${grade.paddy.outwardCount || 0} Outward${(grade.paddy.outwardCount || 0) === 1 ? "" : "s"}`}
                              size="small"
                              sx={{
                                height: 22,
                                fontWeight: 700,
                                bgcolor: (grade.paddy.outwardCount || 0) > 0 ? "#DBEAFE" : "#F3F4F6",
                                color: (grade.paddy.outwardCount || 0) > 0 ? "#1E40AF" : "#9CA3AF",
                              }}
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, color: "#4B5563", fontSize: "0.95rem", whiteSpace: "nowrap", py: 1.6, px: 1.5 }}>
                            -{(grade.paddy.outwardBags || 0).toLocaleString()}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: "#4B5563", whiteSpace: "nowrap", py: 1.6, px: 2 }}>
                            -{(grade.paddy.outwardWeight || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, whiteSpace: "nowrap", py: 1.6, px: 1.5 }}>
                            {(grade.paddy.openingBags || 0).toLocaleString()}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500, whiteSpace: "nowrap", py: 1.6, px: 2 }}>
                            {(grade.paddy.openingWeight || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 800, color: "#166534", fontSize: "1rem", whiteSpace: "nowrap", py: 1.6, px: 1.5 }}>
                            {(grade.paddy.closingBags || 0).toLocaleString()}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800, color: "#111827", fontSize: "0.95rem", whiteSpace: "nowrap", py: 1.6, px: 2 }}>
                            {(grade.paddy.closingWeight || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>

                        {/* 2. Boiled Rice Row */}
                        <TableRow hover sx={{ "&:hover": { bgcolor: "#F8FAFC" } }}>
                          <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap", py: 1.6, px: 2 }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ whiteSpace: "nowrap" }}>
                              <Chip
                                label={grade.label}
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  bgcolor: grade.key === "A" ? "#EFF6FF" : "#F5F3FF",
                                  color: grade.key === "A" ? "#1D4ED8" : "#6D28D9",
                                  border: `1px solid ${grade.key === "A" ? "#BFDBFE" : "#DDD6FE"}`,
                                  height: 22,
                                  fontSize: "0.75rem",
                                }}
                              />
                              <Typography variant="body2" fontWeight={800} color="#1E40AF" sx={{ whiteSpace: "nowrap" }}>
                                BOILED RICE
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="center" sx={{ whiteSpace: "nowrap", py: 1.6, px: 1.5 }}>
                            <Chip
                              label={`${grade.rice.inwardCount || 0} Inward${(grade.rice.inwardCount || 0) === 1 ? "" : "s"}`}
                              size="small"
                              sx={{
                                height: 22,
                                fontWeight: 700,
                                bgcolor: (grade.rice.inwardCount || 0) > 0 ? "#DCFCE7" : "#F3F4F6",
                                color: (grade.rice.inwardCount || 0) > 0 ? "#166534" : "#9CA3AF",
                              }}
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, color: "#166534", fontSize: "0.95rem", whiteSpace: "nowrap", py: 1.6, px: 1.5 }}>
                            +{(grade.rice.inwardBags || 0).toLocaleString()}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: "#166534", whiteSpace: "nowrap", py: 1.6, px: 2 }}>
                            +{(grade.rice.inwardWeight || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell align="center" sx={{ whiteSpace: "nowrap", py: 1.6, px: 1.5 }}>
                            <Chip
                              label={`${grade.rice.outwardCount || 0} Outward${(grade.rice.outwardCount || 0) === 1 ? "" : "s"}`}
                              size="small"
                              sx={{
                                height: 22,
                                fontWeight: 700,
                                bgcolor: (grade.rice.outwardCount || 0) > 0 ? "#DBEAFE" : "#F3F4F6",
                                color: (grade.rice.outwardCount || 0) > 0 ? "#1E40AF" : "#9CA3AF",
                              }}
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, color: "#1E40AF", fontSize: "0.95rem", whiteSpace: "nowrap", py: 1.6, px: 1.5 }}>
                            -{(grade.rice.outwardBags || 0).toLocaleString()}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: "#1E40AF", whiteSpace: "nowrap", py: 1.6, px: 2 }}>
                            -{(grade.rice.outwardWeight || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, whiteSpace: "nowrap", py: 1.6, px: 1.5 }}>
                            {(grade.rice.openingBags || 0).toLocaleString()}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500, whiteSpace: "nowrap", py: 1.6, px: 2 }}>
                            {(grade.rice.openingWeight || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 800, color: "#DC2626", fontSize: "1rem", whiteSpace: "nowrap", py: 1.6, px: 1.5 }}>
                            {(grade.rice.closingBags || 0).toLocaleString()}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800, color: "#DC2626", fontSize: "0.95rem", whiteSpace: "nowrap", py: 1.6, px: 2 }}>
                            {(grade.rice.closingWeight || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>

                        {/* 3. Subtotal Row */}
                        <TableRow sx={{ bgcolor: grade.key === "A" ? "#F0F7FF" : "#FAF5FF", borderBottom: "2px solid #CBD5E1" }}>
                          <TableCell sx={{ fontWeight: 800, color: grade.color, whiteSpace: "nowrap", py: 1.6, px: 2 }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ whiteSpace: "nowrap" }}>
                              <AccountBalanceIcon sx={{ fontSize: 18, color: grade.color }} />
                              <Typography variant="body2" fontWeight={800} color={grade.color} sx={{ whiteSpace: "nowrap" }}>
                                {grade.label} (Net Balance)
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="center" sx={{ whiteSpace: "nowrap", py: 1.6, px: 1.5 }}>
                            <Chip
                              label={`${grade.summary.inwardCount || 0} Inward${(grade.summary.inwardCount || 0) === 1 ? "" : "s"}`}
                              size="small"
                              sx={{ height: 22, fontWeight: 700, bgcolor: "#BBF7D0", color: "#14532D" }}
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 800, color: "#166534", whiteSpace: "nowrap", py: 1.6, px: 1.5 }}>
                            +{(grade.summary.inwardBags || 0).toLocaleString()}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800, color: "#166534", whiteSpace: "nowrap", py: 1.6, px: 2 }}>
                            +{(grade.summary.inwardWeight || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell align="center" sx={{ whiteSpace: "nowrap", py: 1.6, px: 1.5 }}>
                            <Chip
                              label={`${grade.summary.outwardCount || 0} Outward${(grade.summary.outwardCount || 0) === 1 ? "" : "s"}`}
                              size="small"
                              sx={{ height: 22, fontWeight: 700, bgcolor: "#BFDBFE", color: "#1E3A8A" }}
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 800, color: "#1E40AF", whiteSpace: "nowrap", py: 1.6, px: 1.5 }}>
                            -{(grade.summary.outwardBags || 0).toLocaleString()}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800, color: "#1E40AF", whiteSpace: "nowrap", py: 1.6, px: 2 }}>
                            -{(grade.summary.outwardWeight || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, whiteSpace: "nowrap", py: 1.6, px: 1.5 }}>
                            {(grade.summary.openingBags || 0).toLocaleString()}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, whiteSpace: "nowrap", py: 1.6, px: 2 }}>
                            {(grade.summary.openingWeight || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 800, color: "#166534", fontSize: "1rem", whiteSpace: "nowrap", py: 1.6, px: 1.5 }}>
                            {(grade.summary.closingBags || 0).toLocaleString()}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800, color: "#111827", fontSize: "1rem", whiteSpace: "nowrap", py: 1.6, px: 2 }}>
                            {(grade.summary.closingWeight || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}

                    {/* Total Row */}
                    {report.varietySummary && report.varietySummary.length > 0 && (
                      <TableRow sx={{ bgcolor: "#F8FAFC", borderTop: "2px solid #E2E8F0" }}>
                        <TableCell sx={{ fontWeight: 800, color: "#111827", whiteSpace: "nowrap", py: 1.8, px: 2 }}>
                          TOTAL
                        </TableCell>
                        <TableCell align="center" sx={{ whiteSpace: "nowrap", py: 1.8, px: 1.5 }}>
                          <Chip
                            label={`${report.varietySummary.reduce((sum, v) => sum + (v.inwardCount || 0), 0)} Total Inwards`}
                            size="small"
                            sx={{ fontWeight: 800, bgcolor: "#BBF7D0", color: "#14532D" }}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800, color: "#166534", fontSize: "1rem", whiteSpace: "nowrap", py: 1.8, px: 1.5 }}>
                          +{report.varietySummary.reduce((sum, v) => sum + (v.inwardBags || 0), 0).toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: "#166534", whiteSpace: "nowrap", py: 1.8, px: 2 }}>
                          +{report.varietySummary.reduce((sum, v) => sum + (v.inwardWeight || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell align="center" sx={{ whiteSpace: "nowrap", py: 1.8, px: 1.5 }}>
                          <Chip
                            label={`${report.varietySummary.reduce((sum, v) => sum + (v.outwardCount || 0), 0)} Total Outwards`}
                            size="small"
                            sx={{ fontWeight: 800, bgcolor: "#BFDBFE", color: "#1E3A8A" }}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800, color: "#1E40AF", fontSize: "1rem", whiteSpace: "nowrap", py: 1.8, px: 1.5 }}>
                          -{report.varietySummary.reduce((sum, v) => sum + (v.outwardBags || 0), 0).toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: "#1E40AF", whiteSpace: "nowrap", py: 1.8, px: 2 }}>
                          -{report.varietySummary.reduce((sum, v) => sum + (v.outwardWeight || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800, whiteSpace: "nowrap", py: 1.8, px: 1.5 }}>
                          {report.varietySummary.reduce((sum, v) => sum + (v.openingBags || 0), 0).toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, whiteSpace: "nowrap", py: 1.8, px: 2 }}>
                          {report.varietySummary.reduce((sum, v) => sum + (v.openingWeight || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 900, color: "#166534", fontSize: "1.05rem", whiteSpace: "nowrap", py: 1.8, px: 1.5 }}>
                          {report.varietySummary.reduce((sum, v) => sum + (v.closingBags || 0), 0).toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 900, color: "#111827", fontSize: "1rem", whiteSpace: "nowrap", py: 1.8, px: 2 }}>
                          {report.varietySummary.reduce((sum, v) => sum + (v.closingWeight || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* ========================================================
                2. DEDICATED GUNNY BAGS INVENTORY & COUNTS SECTION
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
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <ShoppingBagIcon sx={{ color: "#111827", fontSize: 28 }} />
                  <Typography variant="h5" fontWeight={700}>
                    Gunny Bags & Bag Details Summary
                  </Typography>
                </Stack>
                <Typography color="text.secondary" mt={0.5}>
                  Specific bag counts (NBG, ONB/ONBG, SSG, SWP, USB) and overall
                  total bag counts across inward received, outward issued, and
                  net balance.
                </Typography>
              </Box>
            </Box>

            {/* Bag Specific Mini KPI Cards */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              {report.bagSummary &&
                Object.entries(report.bagSummary).map(([key, bag]) => (
                  <Grid
                    size={{ xs: 12, sm: 6, md: key === "total" ? 12 : 2.4 }}
                    key={key}
                  >
                    <Card
                      sx={{
                        borderRadius: "18px",
                        border:
                          key === "total"
                            ? "2px solid #111827"
                            : "1px solid #E5E7EB",
                        bgcolor: key === "total" ? "#F8FAFC" : "#FFFFFF",
                        boxShadow: "0px 6px 20px rgba(0,0,0,0.04)",
                      }}
                    >
                      <CardContent sx={{ p: 2.5 }}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography
                            fontWeight={700}
                            fontSize="1rem"
                            color={key === "total" ? "#111827" : "text.primary"}
                          >
                            {bag.name}
                          </Typography>
                          <Chip
                            label={key === "total" ? "All Bags" : bag.label}
                            size="small"
                            sx={{
                              fontSize: "0.7rem",
                              height: 20,
                              fontWeight: 600,
                              bgcolor: key === "total" ? "#111827" : "#F3F4F6",
                              color: key === "total" ? "#FFFFFF" : "text.secondary",
                            }}
                          />
                        </Stack>

                        <Divider sx={{ my: 1.5 }} />

                        <Grid container spacing={1} textAlign="center">
                          <Grid size={{ xs: 4 }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Inward
                            </Typography>
                            <Typography fontWeight={700} color="#166534" fontSize="1.05rem">
                              +{bag.inward}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 4 }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Outward
                            </Typography>
                            <Typography fontWeight={700} color="#1E40AF" fontSize="1.05rem">
                              -{bag.outward}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 4 }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Net
                            </Typography>
                            <Typography
                              fontWeight={800}
                              fontSize="1.05rem"
                              color={bag.net >= 0 ? "#111827" : "#DC2626"}
                            >
                              {bag.net >= 0 ? `+${bag.net}` : bag.net}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>

            {/* Bag Details Structured Table */}
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
                <Table sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                      <TableCell sx={{ fontWeight: 700, py: 2 }}>Bag Category</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 2 }}>Description</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, py: 2 }}>
                        Inward Bags Received
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, py: 2 }}>
                        Outward Bags Issued
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, py: 2 }}>
                        Net Balance Movement
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {report.bagSummary &&
                      Object.entries(report.bagSummary)
                        .filter(([key]) => key !== "total")
                        .map(([key, bag]) => (
                          <TableRow key={key} hover>
                            <TableCell sx={{ fontWeight: 700 }}>
                              <Chip
                                label={bag.name}
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  bgcolor: "#EEF2F6",
                                  color: "#1E293B",
                                }}
                              />
                            </TableCell>
                            <TableCell color="text.secondary">
                              {bag.label}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ color: "#166534", fontWeight: 700 }}
                            >
                              +{bag.inward}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ color: "#1E40AF", fontWeight: 700 }}
                            >
                              -{bag.outward}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{
                                fontWeight: 800,
                                color: bag.net >= 0 ? "#111827" : "#DC2626",
                              }}
                            >
                              {bag.net >= 0 ? `+${bag.net}` : bag.net}
                            </TableCell>
                          </TableRow>
                        ))}

                    {/* Total Bag Row */}
                    {report.bagSummary?.total && (
                      <TableRow
                        sx={{
                          bgcolor: "#F1F5F9",
                          borderTop: "2px solid #CBD5E1",
                        }}
                      >
                        <TableCell sx={{ fontWeight: 800 }}>
                          TOTAL BAGS
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>
                          All Bag Categories Combined
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: 800, color: "#166534", fontSize: "1rem" }}
                        >
                          +{report.bagSummary.total.inward}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: 800, color: "#1E40AF", fontSize: "1rem" }}
                        >
                          -{report.bagSummary.total.outward}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 800,
                            color:
                              report.bagSummary.total.net >= 0
                                ? "#0F172A"
                                : "#DC2626",
                            fontSize: "1.05rem",
                          }}
                        >
                          {report.bagSummary.total.net >= 0
                            ? `+${report.bagSummary.total.net}`
                            : report.bagSummary.total.net}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* ========================================================
                3. ITEM & VARIETY-WISE BREAKDOWN TABLE
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
                            label={row.variety === "A" ? "Grade A" : row.variety === "B" ? "Common B" : `Variety ${row.variety || "A"}`}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor:
                                row.variety === "C"
                                  ? "#F59E0B"
                                  : row.variety === "B"
                                  ? "#8B5CF6"
                                  : "#3B82F6",
                              color:
                                row.variety === "C"
                                  ? "#B45309"
                                  : row.variety === "B"
                                  ? "#6D28D9"
                                  : "#1D4ED8",
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
                4. TRANSACTION LEDGER WITH FILTERS & EXPORT
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
                      <MenuItem value="A">Grade A</MenuItem>
                      <MenuItem value="B">Common B</MenuItem>
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
                              label={row.variety === "A" ? "Grade A" : row.variety === "B" ? "Common B" : `Variety ${row.variety || "A"}`}
                              size="small"
                              variant="outlined"
                              sx={{
                                borderColor:
                                  row.variety === "C"
                                    ? "#F59E0B"
                                    : row.variety === "B"
                                    ? "#8B5CF6"
                                    : "#94A3B8",
                                color:
                                  row.variety === "C"
                                    ? "#B45309"
                                    : row.variety === "B"
                                    ? "#6D28D9"
                                    : "#475569",
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
                5. CLOSE MONTH SECTION
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
