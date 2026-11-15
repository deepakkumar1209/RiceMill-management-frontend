import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
  CircularProgress,
  Divider,
} from "@mui/material";

import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import Sidebar from "../components/Sidebar";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers } from "../services/userService";
import { getMonthlyReport } from "../services/monthlyReportService";

export default function DashboardPage() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(true);

  // Month label for current period
  const monthName = useMemo(() => {
    return new Date().toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
  }, []);

  useEffect(() => {
    const role = localStorage.getItem("role");

    if (role !== "SUPER_ADMIN") {
      navigate("/user-home");
      return;
    }

    let isMounted = true;

    // Load users
    getUsers()
      .then((data) => {
        if (!isMounted || !Array.isArray(data)) return;
        const total = data.length;
        const active = data.filter(
          (u) => (u.status || "").toLowerCase() === "active"
        ).length;
        const inactive = total - active;

        setStats({
          total,
          active,
          inactive,
        });
      })
      .catch((error) => {
        console.log("Error loading users:", error);
      });

    // Load current month inventory stats
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    const fromDate = `${year}-${month}-01`;
    const toDate = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;

    getMonthlyReport(fromDate, toDate)
      .then((data) => {
        if (!isMounted) return;
        setReport(data);
      })
      .catch((err) => {
        console.log("Error loading inventory stats:", err);
      })
      .finally(() => {
        if (isMounted) setLoadingReport(false);
      });

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // Totals for the Item & Bag Breakdown Table
  const tableTotals = useMemo(() => {
    if (!report || !Array.isArray(report.breakdown)) {
      return {
        closingWeight: 0,
        nbg: 0,
        onb: 0,
        ssg: 0,
        swp: 0,
        usb: 0,
        totalBags: 0,
      };
    }

    return report.breakdown.reduce(
      (acc, row) => ({
        closingWeight: acc.closingWeight + (Number(row.closingWeight) || 0),
        nbg: acc.nbg + (Number(row.nbg) || 0),
        onb: acc.onb + (Number(row.onb) || 0),
        ssg: acc.ssg + (Number(row.ssg) || 0),
        swp: acc.swp + (Number(row.swp) || 0),
        usb: acc.usb + (Number(row.usb) || 0),
        totalBags: acc.totalBags + (Number(row.totalBags ?? row.closingBags) || 0),
      }),
      {
        closingWeight: 0,
        nbg: 0,
        onb: 0,
        ssg: 0,
        swp: 0,
        usb: 0,
        totalBags: 0,
      }
    );
  }, [report]);

  return (
    <Box sx={{ display: "flex", bgcolor: "#F9FAFB", minHeight: "100vh" }}>
      <Sidebar />

      <Box
        sx={{
          flex: 1,
          p: { xs: 2.5, md: 4 },
          maxWidth: "1600px",
          margin: "0 auto",
        }}
      >
        {/* ========================================================
            HEADER & LIVE PERIOD BADGE
        ========================================================= */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight={800} color="#111827">
              Dashboard
            </Typography>
            <Typography color="text.secondary" mt={0.5} fontSize="0.95rem">
              Real-time mill inventory overview, live stock weights, and gunny bag movements.
            </Typography>
          </Box>

          <Chip
            icon={<CalendarMonthIcon sx={{ fontSize: 20, color: "#1E40AF !important" }} />}
            label={`Current Period: ${monthName}`}
            sx={{
              fontWeight: 700,
              fontSize: "0.9rem",
              bgcolor: "#EFF6FF",
              color: "#1E40AF",
              border: "1px solid #BFDBFE",
              px: 1,
              py: 2.2,
              borderRadius: "12px",
            }}
          />
        </Box>

        {/* ========================================================
            1. USER STATS (Compact & Elegant Top Row)
        ========================================================= */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card
              sx={{
                borderRadius: "16px",
                border: "1px solid #E5E7EB",
                boxShadow: "0px 4px 14px rgba(0,0,0,0.02)",
                bgcolor: "#FFFFFF",
              }}
            >
              <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" fontSize="0.85rem" fontWeight={600}>
                      Total Users
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="#111827" mt={0.5}>
                      {stats.total}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: "12px",
                      bgcolor: "#F3F4F6",
                      color: "#4B5563",
                    }}
                  >
                    <PeopleIcon fontSize="medium" />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Card
              sx={{
                borderRadius: "16px",
                border: "1px solid #E5E7EB",
                boxShadow: "0px 4px 14px rgba(0,0,0,0.02)",
                bgcolor: "#FFFFFF",
              }}
            >
              <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="#166534" fontSize="0.85rem" fontWeight={600}>
                      Active Users
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="#166534" mt={0.5}>
                      {stats.active}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: "12px",
                      bgcolor: "#F0FDF4",
                      color: "#16A34A",
                    }}
                  >
                    <CheckCircleIcon fontSize="medium" />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Card
              sx={{
                borderRadius: "16px",
                border: "1px solid #E5E7EB",
                boxShadow: "0px 4px 14px rgba(0,0,0,0.02)",
                bgcolor: "#FFFFFF",
              }}
            >
              <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="#DC2626" fontSize="0.85rem" fontWeight={600}>
                      Inactive Users
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="#DC2626" mt={0.5}>
                      {stats.inactive}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: "12px",
                      bgcolor: "#FEF2F2",
                      color: "#EF4444",
                    }}
                  >
                    <CancelIcon fontSize="medium" />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Loading state for inventory */}
        {loadingReport && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#111827" }} />
          </Box>
        )}

        {!loadingReport && report && (
          <>
            {/* ========================================================
                2. OVERALL STOCK MOVEMENT (4 CARDS - EXACTLY LIKE IMAGE 1)
            ========================================================= */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" fontWeight={800} color="#111827">
                Overall Stock Movement
              </Typography>
              <Typography color="text.secondary" fontSize="0.9rem" mt={0.3}>
                Month-to-date summary of opening, inward received, outward dispatched, and closing balances.
              </Typography>
            </Box>

            <Grid container spacing={3} sx={{ mb: 5 }}>
              {/* Card 1: Opening Balance */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  sx={{
                    borderRadius: "20px",
                    boxShadow: "0px 8px 24px rgba(0,0,0,0.04)",
                    border: "1px solid #E5E7EB",
                    bgcolor: "#FFFFFF",
                    height: "100%",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography color="text.secondary" fontWeight={600} fontSize="0.95rem">
                        Opening Balance
                      </Typography>
                      <AccountBalanceIcon sx={{ color: "#6B7280", fontSize: 24 }} />
                    </Stack>

                    <Typography variant="h4" fontWeight={800} mt={2} color="#111827">
                      {(report.opening?.weight ?? 0).toLocaleString()}
                      <Typography component="span" variant="body2" color="text.secondary" ml={0.75} fontWeight={600}>
                        Kg
                      </Typography>
                    </Typography>

                    <Typography color="text.secondary" mt={0.75} fontWeight={600} fontSize="0.95rem">
                      {(report.opening?.bags ?? 0).toLocaleString()} Bags
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Card 2: Total Inward Stock */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  sx={{
                    borderRadius: "20px",
                    boxShadow: "0px 8px 24px rgba(0,0,0,0.04)",
                    border: "1px solid #BBF7D0",
                    bgcolor: "#F0FDF4",
                    height: "100%",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography color="#166534" fontWeight={700} fontSize="0.95rem">
                        Total Inward Stock
                      </Typography>
                      <ArrowDownwardIcon sx={{ color: "#16A34A", fontSize: 24 }} />
                    </Stack>

                    <Typography variant="h4" fontWeight={800} mt={2} color="#166534">
                      +{(report.summary?.totalInwardWeight ?? 0).toLocaleString()}
                      <Typography component="span" variant="body2" color="#166534" ml={0.75} fontWeight={700}>
                        Kg
                      </Typography>
                    </Typography>

                    <Stack direction="row" justifyContent="space-between" alignItems="center" mt={0.75}>
                      <Typography color="#166534" fontWeight={700} fontSize="0.95rem">
                        +{(report.summary?.totalInwardBags ?? 0).toLocaleString()} Bags
                      </Typography>
                      <Chip
                        label={`${report.summary?.totalInwardCount ?? 0} Inward${(report.summary?.totalInwardCount ?? 0) === 1 ? "" : "s"}`}
                        size="small"
                        sx={{
                          bgcolor: "#DCFCE7",
                          color: "#166534",
                          fontWeight: 700,
                          height: 22,
                          border: "1px solid #86EFAC",
                        }}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Card 3: Total Outward Stock */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  sx={{
                    borderRadius: "20px",
                    boxShadow: "0px 8px 24px rgba(0,0,0,0.04)",
                    border: "1px solid #BFDBFE",
                    bgcolor: "#EFF6FF",
                    height: "100%",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography color="#1E40AF" fontWeight={700} fontSize="0.95rem">
                        Total Outward Stock
                      </Typography>
                      <ArrowUpwardIcon sx={{ color: "#2563EB", fontSize: 24 }} />
                    </Stack>

                    <Typography variant="h4" fontWeight={800} mt={2} color="#1E40AF">
                      -{(report.summary?.totalOutwardWeight ?? 0).toLocaleString()}
                      <Typography component="span" variant="body2" color="#1E40AF" ml={0.75} fontWeight={700}>
                        Kg
                      </Typography>
                    </Typography>

                    <Stack direction="row" justifyContent="space-between" alignItems="center" mt={0.75}>
                      <Typography color="#1E40AF" fontWeight={700} fontSize="0.95rem">
                        -{(report.summary?.totalOutwardBags ?? 0).toLocaleString()} Bags
                      </Typography>
                      <Chip
                        label={`${report.summary?.totalOutwardCount ?? 0} Outward${(report.summary?.totalOutwardCount ?? 0) === 1 ? "" : "s"}`}
                        size="small"
                        sx={{
                          bgcolor: "#DBEAFE",
                          color: "#1E40AF",
                          fontWeight: 700,
                          height: 22,
                          border: "1px solid #93C5FD",
                        }}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Card 4: Closing Balance */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  sx={{
                    borderRadius: "20px",
                    boxShadow: "0px 10px 30px rgba(0,0,0,0.12)",
                    bgcolor: "#111827",
                    color: "#FFFFFF",
                    height: "100%",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography color="#9CA3AF" fontWeight={600} fontSize="0.95rem">
                        Closing Balance
                      </Typography>
                      <InventoryIcon sx={{ color: "#10B981", fontSize: 24 }} />
                    </Stack>

                    <Typography variant="h4" fontWeight={800} mt={2} color="#FFFFFF">
                      {(report.summary?.closingWeight ?? 0).toLocaleString()}
                      <Typography component="span" variant="body2" color="#9CA3AF" ml={0.75} fontWeight={600}>
                        Kg
                      </Typography>
                    </Typography>

                    <Typography color="#10B981" mt={0.75} fontWeight={700} fontSize="0.95rem">
                      {(report.summary?.closingBags ?? 0).toLocaleString()} Bags
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* ========================================================
                3. ITEM & VARIETY STOCK TABLE (WITH SEPARATE KG & BAG COUNTS)
                User Request: item name variety then kg and each bag count and total bag count
            ========================================================= */}
            <Paper
              sx={{
                mb: 5,
                borderRadius: "20px",
                border: "1px solid #E5E7EB",
                boxShadow: "0px 6px 24px rgba(0,0,0,0.03)",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  p: 2.5,
                  px: 3,
                  bgcolor: "#FFFFFF",
                  borderBottom: "1px solid #E5E7EB",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 1.5,
                }}
              >
                <Box>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <InventoryIcon sx={{ color: "#111827", fontSize: 24 }} />
                    <Typography variant="h6" fontWeight={800} color="#111827">
                      Live Stock Balance by Item, Variety & Bags
                    </Typography>
                  </Stack>
                  <Typography color="text.secondary" fontSize="0.85rem" mt={0.3}>
                    Item name, variety, net available weight (Kg), individual gunny bag counts, and total bag count.
                  </Typography>
                </Box>

                <Chip
                  label="Live Inventory Balance"
                  size="small"
                  sx={{
                    fontWeight: 700,
                    bgcolor: "#F3F4F6",
                    color: "#374151",
                    border: "1px solid #E5E7EB",
                  }}
                />
              </Box>

              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, color: "#374151", py: 2 }}>
                        Item Name
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "#374151" }}>
                        Variety
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: "#111827" }}>
                        Net Weight (Kg)
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: "#4B5563" }}>
                        NBG
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: "#4B5563" }}>
                        ONB / ONBG
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: "#4B5563" }}>
                        SSG
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: "#4B5563" }}>
                        SWP
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: "#4B5563" }}>
                        USB
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: "#166534" }}>
                        Total Bag Count
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {report.breakdown && report.breakdown.length > 0 ? (
                      report.breakdown.map((row) => (
                        <TableRow
                          key={`${row.item}__${row.variety}`}
                          hover
                          sx={{
                            "&:hover": { bgcolor: "#F8FAFC" },
                            transition: "background-color 0.15s ease",
                          }}
                        >
                          {/* Item Name */}
                          <TableCell sx={{ fontWeight: 700, color: "#111827", py: 2 }}>
                            {row.item}
                          </TableCell>

                          {/* Variety */}
                          <TableCell>
                            <Chip
                              label={row.variety === "A" ? "Grade A" : row.variety === "B" ? "Common B" : `Variety ${row.variety || "A"}`}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                fontSize: "0.78rem",
                                bgcolor: row.variety === "A" ? "#EFF6FF" : "#F5F3FF",
                                color: row.variety === "A" ? "#1D4ED8" : "#6D28D9",
                                border: `1px solid ${
                                  row.variety === "A" ? "#BFDBFE" : "#DDD6FE"
                                }`,
                              }}
                            />
                          </TableCell>

                          {/* Net Weight (Kg) */}
                          <TableCell
                            align="right"
                            sx={{
                              fontWeight: 800,
                              color: row.closingWeight >= 0 ? "#111827" : "#DC2626",
                              fontSize: "0.95rem",
                            }}
                          >
                            {(row.closingWeight || 0).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{" "}
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.secondary"
                              fontWeight={600}
                            >
                              Kg
                            </Typography>
                          </TableCell>

                          {/* NBG */}
                          <TableCell align="center" sx={{ fontWeight: 600, color: "#374151" }}>
                            {(row.nbg || 0).toLocaleString()}
                          </TableCell>

                          {/* ONB / ONBG */}
                          <TableCell align="center" sx={{ fontWeight: 600, color: "#374151" }}>
                            {(row.onb || 0).toLocaleString()}
                          </TableCell>

                          {/* SSG */}
                          <TableCell align="center" sx={{ fontWeight: 600, color: "#374151" }}>
                            {(row.ssg || 0).toLocaleString()}
                          </TableCell>

                          {/* SWP */}
                          <TableCell align="center" sx={{ fontWeight: 600, color: "#374151" }}>
                            {(row.swp || 0).toLocaleString()}
                          </TableCell>

                          {/* USB */}
                          <TableCell align="center" sx={{ fontWeight: 600, color: "#374151" }}>
                            {(row.usb || 0).toLocaleString()}
                          </TableCell>

                          {/* Total Bag Count */}
                          <TableCell
                            align="right"
                            sx={{
                              fontWeight: 800,
                              color:
                                (row.totalBags ?? row.closingBags) >= 0
                                  ? "#166534"
                                  : "#DC2626",
                              fontSize: "1rem",
                            }}
                          >
                            {(row.totalBags ?? row.closingBags ?? 0).toLocaleString()}{" "}
                            <Typography
                              component="span"
                              variant="caption"
                              fontWeight={600}
                              color="inherit"
                            >
                              Bags
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            No inventory items found.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}

                    {/* TOTAL ROW */}
                    {report.breakdown && report.breakdown.length > 0 && (
                      <TableRow
                        sx={{
                          bgcolor: "#F8FAFC",
                          borderTop: "2px solid #E2E8F0",
                        }}
                      >
                        <TableCell sx={{ fontWeight: 900, color: "#111827", py: 2.2 }}>
                          TOTAL
                        </TableCell>
                        <TableCell sx={{ color: "text.secondary", fontWeight: 700 }}>
                          -
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 900,
                            color: tableTotals.closingWeight >= 0 ? "#111827" : "#DC2626",
                            fontSize: "1.05rem",
                          }}
                        >
                          {tableTotals.closingWeight.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          <Typography component="span" variant="caption" fontWeight={700}>
                            Kg
                          </Typography>
                        </TableCell>

                        <TableCell align="center" sx={{ fontWeight: 800, color: "#111827" }}>
                          {tableTotals.nbg.toLocaleString()}
                        </TableCell>

                        <TableCell align="center" sx={{ fontWeight: 800, color: "#111827" }}>
                          {tableTotals.onb.toLocaleString()}
                        </TableCell>

                        <TableCell align="center" sx={{ fontWeight: 800, color: "#111827" }}>
                          {tableTotals.ssg.toLocaleString()}
                        </TableCell>

                        <TableCell align="center" sx={{ fontWeight: 800, color: "#111827" }}>
                          {tableTotals.swp.toLocaleString()}
                        </TableCell>

                        <TableCell align="center" sx={{ fontWeight: 800, color: "#111827" }}>
                          {tableTotals.usb.toLocaleString()}
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 900,
                            color: tableTotals.totalBags >= 0 ? "#166534" : "#DC2626",
                            fontSize: "1.05rem",
                          }}
                        >
                          {tableTotals.totalBags.toLocaleString()}{" "}
                          <Typography component="span" variant="caption" fontWeight={800} color="inherit">
                            Bags
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* ========================================================
                4. GUNNY BAGS QUICK GLANCE SUMMARY SECTION
            ========================================================= */}
            <Box
              sx={{
                mb: 2.5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1.5,
              }}
            >
              <Box>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <ShoppingBagIcon sx={{ color: "#111827", fontSize: 24 }} />
                  <Typography variant="h6" fontWeight={800} color="#111827">
                    Gunny Bags Inventory Overview
                  </Typography>
                </Stack>
                <Typography color="text.secondary" fontSize="0.85rem" mt={0.3}>
                  Detailed bag movement (inward received, outward issued, and net balance) by gunny type.
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2.5} sx={{ mb: 2 }}>
              {report.bagSummary &&
                Object.entries(report.bagSummary).map(([key, bag]) => (
                  <Grid
                    size={{ xs: 12, sm: 6, md: key === "total" ? 12 : 2.4 }}
                    key={key}
                  >
                    <Card
                      sx={{
                        borderRadius: "16px",
                        border:
                          key === "total"
                            ? "2px solid #111827"
                            : "1px solid #E5E7EB",
                        bgcolor: key === "total" ? "#F8FAFC" : "#FFFFFF",
                        boxShadow: "0px 4px 16px rgba(0,0,0,0.03)",
                      }}
                    >
                      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={1}
                        >
                          <Typography
                            variant="subtitle2"
                            fontWeight={800}
                            color={key === "total" ? "#111827" : "text.primary"}
                          >
                            {bag.name}
                          </Typography>
                          <Chip
                            label={key === "total" ? "All Bags" : key.toUpperCase()}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: "0.65rem",
                              fontWeight: 800,
                              bgcolor: key === "total" ? "#111827" : "#F3F4F6",
                              color: key === "total" ? "#FFFFFF" : "#4B5563",
                            }}
                          />
                        </Stack>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ minHeight: 18 }}
                        >
                          {bag.label}
                        </Typography>

                        <Divider sx={{ my: 1 }} />

                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="caption" color="#166534" fontWeight={700}>
                            In: +{bag.inward}
                          </Typography>
                          <Typography variant="caption" color="#1E40AF" fontWeight={700}>
                            Out: -{bag.outward}
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={800}
                            color={bag.net >= 0 ? "#111827" : "#DC2626"}
                          >
                            Net: {bag.net >= 0 ? `+${bag.net}` : bag.net}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </>
        )}
      </Box>
    </Box>
  );
}
