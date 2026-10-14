import React, {
  useState,
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
} from "@mui/material";

import Sidebar from "../components/Sidebar";

import {
  getMonthlyReport,
  closeMonth,
} from "../services/monthlyReportService";

export default function MonthlyReportPage() {

  // ===========================
  // STATES
  // ===========================

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  const [report, setReport] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [closing, setClosing] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [message, setMessage] =
    useState("");

  // ===========================
  // GENERATE REPORT
  // ===========================

  const handleGenerate =
    async () => {

      if (!fromDate || !toDate) {
        alert(
          "Please select both From Date and To Date."
        );
        return;
      }

      try {

        setLoading(true);

        const data =
          await getMonthlyReport(
            fromDate,
            toDate
          );

        setReport(data);

      } catch (error) {

        console.log(error);

        alert(
          "Unable to generate report."
        );

      } finally {

        setLoading(false);

      }

    };

  // ===========================
  // CLOSE MONTH
  // ===========================

  const handleCloseMonth =
    async () => {

      if (!report) return;

      const confirmClose =
        window.confirm(
          "Do you want to close this month?\n\nThe Closing Balance will become the Opening Balance for the next month."
        );

      if (!confirmClose) return;

      try {

        setClosing(true);

        await closeMonth({

  month: report.month,

  year: report.year,

  closingWeight:
    report.summary.closingWeight,

  closingBags:
    report.summary.closingBags,

});

        setMessage(
          "Month Closed Successfully."
        );

        setSuccess(true);

      } catch (error) {

        console.log(error);

        alert(
          "Unable to close month."
        );

      } finally {

        setClosing(false);

      }

    };

  // ===========================
  // RUNNING BALANCE
  // ===========================

  let runningWeight =
    report
      ? report.opening.weight
      : 0;

  let runningBags =
    report
      ? report.opening.bags
      : 0;

  // ===========================
  // RETURN STARTS HERE
  // ===========================

  return (

    <Box
      sx={{
        display: "flex",
      }}
    >

      <Sidebar />

      <Box
        sx={{
          flex: 1,
          p: 4,
          bgcolor: "#F8FAFC",
          minHeight: "100vh",
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
            boxShadow:
              "0px 10px 25px rgba(0,0,0,0.05)",
          }}
        >
          <Typography
            variant="h4"
            fontWeight={700}
          >
            Monthly Inventory Report
          </Typography>

          <Typography
            sx={{
              color: "#6B7280",
              mt: 1,
            }}
          >
            Generate inventory movement and stock
            balance report for any date range.
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
            boxShadow:
              "0px 10px 25px rgba(0,0,0,0.05)",
          }}
        >
          <Typography
            variant="h6"
            fontWeight={600}
            mb={3}
          >
            Report Filters
          </Typography>

          <Grid
            container
            spacing={3}
            alignItems="center"
          >
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                type="date"
                label="From Date"
                slotProps={{ inputLabel: { shrink: true } }}
                value={fromDate}
                onChange={(e) =>
                  setFromDate(
                    e.target.value
                  )
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                type="date"
                label="To Date"
                slotProps={{ inputLabel: { shrink: true } }}
                value={toDate}
                onChange={(e) =>
                  setToDate(
                    e.target.value
                  )
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Button
                fullWidth
                variant="contained"
                disabled={loading}
                onClick={
                  handleGenerate
                }
                sx={{
                  height: 56,
                  bgcolor: "#111827",
                  borderRadius: "12px",
                  textTransform:
                    "none",
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor:
                      "#1F2937",
                  },
                }}
              >
                {loading
                  ? "Generating..."
                  : "Generate Report"}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* ==========================================
                REPORT SECTION
        =========================================== */}

        {report && (
          <>

            {/* ==========================
                  OPENING BALANCE
            =========================== */}

            <Typography
              variant="h5"
              fontWeight={700}
              sx={{
                mt: 5,
                mb: 3,
              }}
            >
              Opening Balance
            </Typography>

            <Grid
              container
              spacing={3}
            >
              {/* Opening Weight */}

              <Grid size={{ xs: 12, md: 4 }}>
                <Card
                  sx={{
                    borderRadius:
                      "20px",
                    boxShadow:
                      "0px 8px 24px rgba(0,0,0,0.05)",
                  }}
                >
                  <CardContent>

                    <Typography
                      color="text.secondary"
                    >
                      Opening Weight
                    </Typography>

                    <Typography
                      variant="h4"
                      fontWeight={700}
                      mt={2}
                    >
                      {
                        report
                          .opening
                          .weight
                      }
                    </Typography>

                    <Typography
                      color="text.secondary"
                    >
                      Kg
                    </Typography>

                  </CardContent>
                </Card>
              </Grid>


              {/* Opening Bags */}

              <Grid size={{ xs: 12, md: 4 }}>
                <Card
                  sx={{
                    borderRadius:
                      "20px",
                    boxShadow:
                      "0px 8px 24px rgba(0,0,0,0.05)",
                  }}
                >
                  <CardContent>

                    <Typography
                      color="text.secondary"
                    >
                      Opening Bags
                    </Typography>

                    <Typography
                      variant="h4"
                      fontWeight={700}
                      mt={2}
                    >
                      {
                        report
                          .opening
                          .bags
                      }
                    </Typography>

                    <Typography
                      color="text.secondary"
                    >
                      Bags
                    </Typography>

                  </CardContent>
                </Card>
              </Grid>

            </Grid>
                        {/* ==========================
                TRANSACTION SUMMARY
            =========================== */}

            <Typography
              variant="h5"
              fontWeight={700}
              sx={{
                mt: 5,
                mb: 3,
              }}
            >
              Transaction Summary
            </Typography>

            <Grid
              container
              spacing={3}
            >
              {/* Total Inward */}

              <Grid size={{ xs: 12, md: 6 }}>
                <Card
                  sx={{
                    borderRadius: "20px",
                    boxShadow:
                      "0px 8px 24px rgba(0,0,0,0.05)",
                  }}
                >
                  <CardContent>

                    <Typography color="text.secondary">
                      Total Inward Weight
                    </Typography>

                    <Typography
                      variant="h4"
                      fontWeight={700}
                      mt={2}
                    >
                      {report.summary.totalInwardWeight}
                    </Typography>

                    <Typography color="text.secondary">
                      Kg
                    </Typography>

                  </CardContent>
                </Card>
              </Grid>

              {/* Total Outward */}

              <Grid size={{ xs: 12, md: 6 }}>
                <Card
                  sx={{
                    borderRadius: "20px",
                    boxShadow:
                      "0px 8px 24px rgba(0,0,0,0.05)",
                  }}
                >
                  <CardContent>

                    <Typography color="text.secondary">
                      Total Outward Weight
                    </Typography>

                    <Typography
                      variant="h4"
                      fontWeight={700}
                      mt={2}
                    >
                      {report.summary.totalOutwardWeight}
                    </Typography>

                    <Typography color="text.secondary">
                      Kg
                    </Typography>

                  </CardContent>
                </Card>
              </Grid>

              {/* Closing Weight */}

              <Grid size={{ xs: 12, md: 4 }}>
                <Card
                  sx={{
                    borderRadius: "20px",
                    bgcolor: "#111827",
                    color: "#fff",
                  }}
                >
                  <CardContent>

                    <Typography>
                      Closing Weight
                    </Typography>

                    <Typography
                      variant="h4"
                      fontWeight={700}
                      mt={2}
                    >
                      {report.summary.closingWeight}
                    </Typography>

                    <Typography>
                      Kg
                    </Typography>

                  </CardContent>
                </Card>
              </Grid>

              {/* Total Inward Bags */}

              <Grid size={{ xs: 12, md: 4 }}>
                <Card
                  sx={{
                    borderRadius: "20px",
                    boxShadow:
                      "0px 8px 24px rgba(0,0,0,0.05)",
                  }}
                >
                  <CardContent>

                    <Typography color="text.secondary">
                      Total Inward Bags
                    </Typography>

                    <Typography
                      variant="h4"
                      fontWeight={700}
                      mt={2}
                    >
                      {report.summary.totalInwardBags}
                    </Typography>

                    <Typography color="text.secondary">
                      Bags
                    </Typography>

                  </CardContent>
                </Card>
              </Grid>

              {/* Total Outward Bags */}

              <Grid size={{ xs: 12, md: 6 }}>
                <Card
                  sx={{
                    borderRadius: "20px",
                    boxShadow:
                      "0px 8px 24px rgba(0,0,0,0.05)",
                  }}
                >
                  <CardContent>

                    <Typography color="text.secondary">
                      Total Outward Bags
                    </Typography>

                    <Typography
                      variant="h4"
                      fontWeight={700}
                      mt={2}
                    >
                      {report.summary.totalOutwardBags}
                    </Typography>

                    <Typography color="text.secondary">
                      Bags
                    </Typography>

                  </CardContent>
                </Card>
              </Grid>

              {/* Closing Bags */}

              <Grid size={{ xs: 12, md: 6 }}>
                <Card
                  sx={{
                    borderRadius: "20px",
                    bgcolor: "#059669",
                    color: "#fff",
                  }}
                >
                  <CardContent>

                    <Typography>
                      Closing Bags
                    </Typography>

                    <Typography
                      variant="h4"
                      fontWeight={700}
                      mt={2}
                    >
                      {report.summary.closingBags}
                    </Typography>

                    <Typography>
                      Bags
                    </Typography>

                  </CardContent>
                </Card>
              </Grid>

            </Grid>

            {/* ==========================
                 INVENTORY LEDGER
            =========================== */}

            <Typography
              variant="h5"
              fontWeight={700}
              sx={{
                mt: 6,
                mb: 3,
              }}
            >
              Inventory Ledger
            </Typography>

            <TableContainer
              component={Paper}
              sx={{
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow:
                  "0px 10px 30px rgba(0,0,0,0.05)",
              }}
            >

              <Table stickyHeader>

                <TableHead>

                  <TableRow>

                    <TableCell>Date</TableCell>

                    <TableCell>Type</TableCell>

                    <TableCell>Issue No</TableCell>

                    <TableCell>Ack No</TableCell>

                    <TableCell>Item</TableCell>

                    <TableCell align="right">
                      Inward Weight
                    </TableCell>

                    <TableCell align="right">
                      Outward Weight
                    </TableCell>

                    <TableCell align="right">
                      Balance Weight
                    </TableCell>

                    <TableCell align="right">
                      Inward Bags
                    </TableCell>

                    <TableCell align="right">
                      Outward Bags
                    </TableCell>

                    <TableCell align="right">
                      Balance Bags
                    </TableCell>

                  </TableRow>

                </TableHead>

                <TableBody>

                  {report.transactions.map(
                    (row, index) => {

                      runningWeight +=
                        Number(
                          row.inwardWeight || 0
                        ) -
                        Number(
                          row.outwardWeight || 0
                        );

                      runningBags +=
                        Number(
                          row.inwardBags || 0
                        ) -
                        Number(
                          row.outwardBags || 0
                        );

                      return (

                        <TableRow
                          key={index}
                          hover
                        >

                          <TableCell>
                            {new Date(
                              row.issueDate
                            ).toLocaleDateString(
                              "en-GB"
                            )}
                          </TableCell>

                          <TableCell>
                            {row.type}
                          </TableCell>

                          <TableCell>
                            {row.issueNumber}
                          </TableCell>

                          <TableCell>
                            {row.acknowledgeNumber}
                          </TableCell>

                          <TableCell>
                            {row.item}
                          </TableCell>

                          <TableCell align="right">
                            {row.inwardWeight}
                          </TableCell>

                          <TableCell align="right">
                            {row.outwardWeight}
                          </TableCell>

                          <TableCell
                            align="right"
                            sx={{
                              fontWeight: 700,
                            }}
                          >
                            {runningWeight}
                          </TableCell>

                          <TableCell align="right">
                            {row.inwardBags}
                          </TableCell>

                          <TableCell align="right">
                            {row.outwardBags}
                          </TableCell>

                          <TableCell
                            align="right"
                            sx={{
                              fontWeight: 700,
                            }}
                          >
                            {runningBags}
                          </TableCell>

                        </TableRow>

                      );

                    }
                  )}

                </TableBody>

              </Table>

            </TableContainer>
                        {/* ==========================================
                    CLOSE MONTH SECTION
            =========================================== */}

            <Paper
              sx={{
                mt: 5,
                p: 4,
                borderRadius: "20px",
                border: "1px solid #E5E7EB",
                boxShadow:
                  "0px 10px 25px rgba(0,0,0,0.05)",
              }}
            >
              <Typography
                variant="h5"
                fontWeight={700}
              >
                Month Closing
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: "#6B7280",
                }}
              >
                Review the closing balance before
                closing this month.
              </Typography>

              <Grid
                container
                spacing={3}
                sx={{
                  mt: 2,
                }}
              >
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card
                    sx={{
                      borderRadius: "18px",
                    }}
                  >
                    <CardContent>

                      <Typography
                        color="text.secondary"
                      >
                        Closing Weight
                      </Typography>

                      <Typography
                        variant="h4"
                        fontWeight={700}
                        mt={2}
                      >
                        {
                          report.summary
                            .closingWeight
                        }
                      </Typography>

                      <Typography>
                        Kg
                      </Typography>

                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Card
                    sx={{
                      borderRadius: "18px",
                    }}
                  >
                    <CardContent>

                      <Typography
                        color="text.secondary"
                      >
                        Closing Bags
                      </Typography>

                      <Typography
                        variant="h4"
                        fontWeight={700}
                        mt={2}
                      >
                        {
                          report.summary
                            .closingBags
                        }
                      </Typography>

                      <Typography>
                        Bags
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
                <Typography
                  fontWeight={700}
                >
                  Month End Confirmation
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    color: "#6B7280",
                  }}
                >
                  Do you want to use this Closing
                  Balance as the Opening Balance
                  for the next month?
                </Typography>

                <Box
                  sx={{
                    mt: 3,
                    display: "flex",
                    justifyContent:
                      "flex-end",
                  }}
                >
                  <Button
                    variant="contained"
                    disabled={closing}
                    onClick={
                      handleCloseMonth
                    }
                    sx={{
                      bgcolor: "#111827",
                      px: 5,
                      py: 1.5,
                      borderRadius: "12px",
                      textTransform:
                        "none",
                      fontWeight: 600,
                      "&:hover": {
                        bgcolor:
                          "#1F2937",
                      },
                    }}
                  >
                    {closing
                      ? "Closing..."
                      : "Close Month"}
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

      </Box>

    </Box>

  );

}
     