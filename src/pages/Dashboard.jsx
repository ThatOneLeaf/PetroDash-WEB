import { useState, useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import api from "../services/api";
import {
  Box,
  Button,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  CircularProgress,
} from "@mui/material";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import EnviOverview from "../components/DashboardComponents/EnviOverview";
import DashboardHeader from "../components/DashboardComponents/DashboardHeader";
import { format } from "date-fns";
import HELPINvestments from "./CSR/Charts/InvestmentKPI";
import EnergyTable from "../components/EnergyOverallTable";

import HROverview from "../pages/HR/OverviewHR";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function Dashboard() {
  const { logout } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Economic data state
  const [economicData, setEconomicData] = useState([]);
  const [economicLoading, setEconomicLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Ref for export
  const dashboardRef = useRef();

  // Utils
  const formatDateTime = (date) => format(date, "PPPpp");

  // Calculate growth percentage
  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  // Fetch economic data
  useEffect(() => {
    const fetchEconomicData = async () => {
      try {
        setEconomicLoading(true);
        const response = await api.get("/economic/dashboard/summary");
        setEconomicData(response.data);
        setEconomicLoading(false);
        setLastUpdated(new Date());
      } catch (err) {
        console.error("Error fetching economic data:", err);
        setEconomicLoading(false);
      }
    };
    fetchEconomicData();
  }, []);

  // Calculate current and previous year metrics for economic data
  const currentYearMetrics =
    economicData.length > 0 ? economicData[economicData.length - 1] : null;
  const previousYearMetrics =
    economicData.length > 1 ? economicData[economicData.length - 2] : null;

  // Prepare chart data for Economic Analysis chart
  const flowData = economicData.map((item) => ({
    year: item.year,
    economic_value_generated: item.totalGenerated,
    economic_value_distributed: item.totalDistributed,
    economic_value_retained: item.valueRetained,
  }));

  useEffect(() => {
    // Simulate loading for demonstration; replace with real API call
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Export handler (PDF)
  const handleExportData = async () => {
    const input = dashboardRef.current;
    if (!input) return;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("dashboard_export.pdf");
  };

  // Show header/sidebar, and loading spinner in content area (like HELPDash)
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box
        sx={{
          flexGrow: 1,
          height: "100vh",
          overflow: "hidden",
          bgcolor: "#f5f5f5",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            px: 2,
            pt: 2,
            flexShrink: 0,
          }}
        >
          <DashboardHeader
            title="Overview"
            lastUpdated={lastUpdated}
            formatDateTime={formatDateTime}
          />
          <Box sx={{ display: "flex", gap: 1, mt: "15px" }}>
            <Button
              variant="contained"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportData}
              sx={{
                backgroundColor: "#182959",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: 13,
                px: 2,
                py: 0.5,
                minHeight: "32px",
                height: "32px",
                "&:hover": { backgroundColor: "#0f1a3c" },
              }}
            >
              Export Data
            </Button>
          </Box>
        </Box>

        {/* Main Content */}
        <Box
          ref={dashboardRef}
          sx={{
            flex: 1,
            p: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {loading ? (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                minHeight: 0,
              }}
            >
              <CircularProgress size={48} thickness={5} />
              <Typography
                sx={{ mt: 2, fontWeight: 600, color: "#666", fontSize: 18 }}
              >
                Loading The Overview Dashboard
              </Typography>
            </Box>
          ) : (
            <>
              {/* Dashboard Grid Layout - 2 Rows */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  flex: 1,
                  minHeight: 0,
                }}
              >
                {/* First Row - Energy Section (Full Width) */}
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    border: "2px solid #333",
                    borderRadius: 2,
                    backgroundColor: "white",
                    position: "relative",
                    flex: "0 0 auto",
                    minHeight: "200px",
                  }}
                >
                  {/* Floating label */}
                  <Typography
                    variant="h6"
                    sx={{
                      position: "absolute",
                      top: -14,
                      left: 16,
                      backgroundColor: "white",
                      px: 1,
                      fontWeight: "bold",
                      color: "#333",
                      zIndex: 2,
                    }}
                  >
                    ENERGY
                  </Typography>

                  {/* Padding top so ENERGY label doesn't overlap table */}
                  <Box
                    sx={{
                      pt: 0.3,
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <EnergyTable />
                  </Box>
                </Paper>

                {/* Second Row - 2 Columns */}
                <Box sx={{ display: "flex", gap: 2, flex: 1, minHeight: 0 }}>
                  {/* Left Column - Economics */}
                  <Paper
                    elevation={1}
                    sx={{
                      flex: 1,
                      p: 2,
                      border: "2px solid #333",
                      borderRadius: 2,
                      backgroundColor: "white",
                      position: "relative",
                      minHeight: 0,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        position: "absolute",
                        top: -12,
                        left: 16,
                        backgroundColor: "white",
                        px: 1,
                        fontWeight: "bold",
                        color: "#333",
                      }}
                    >
                      ECONOMIC
                    </Typography>
                    <Box sx={{ pt: 2, height: "100%" }}>
                      {economicLoading ? (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Loading economic data...
                          </Typography>
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          {/* KPI Cards Row - Compact fit-content height */}
                          <Box
                            sx={{ height: "fit-content", mb: 1, flexShrink: 0 }}
                          >
                            <Grid container spacing={1}>
                              {/* Value Generated Card */}
                              <Grid size={4}>
                                <Card
                                  sx={{
                                    borderRadius: 2,
                                    boxShadow: 1,
                                    bgcolor: "#2B8C37",
                                    height: "fit-content",
                                  }}
                                >
                                  <CardContent
                                    sx={{
                                      textAlign: "center",
                                      py: 1,
                                      px: 1,
                                      "&:last-child": { pb: 1 },
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      minHeight: "unset",
                                    }}
                                  >
                                    <Typography
                                      variant="h5"
                                      sx={{
                                        color: "white",
                                        fontWeight: "bold",
                                        fontSize: "1.1rem",
                                        mb: 0.2,
                                        lineHeight: 1.2,
                                      }}
                                    >
                                      {currentYearMetrics
                                        ? currentYearMetrics.totalGenerated.toLocaleString()
                                        : "0"}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: "white",
                                        fontSize: "0.7rem",
                                        mb: 0.2,
                                        lineHeight: 1.1,
                                      }}
                                    >
                                      Value Generated
                                    </Typography>
                                                                      {previousYearMetrics && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "white",
                                        fontSize: "0.6rem",
                                        lineHeight: 1,
                                      }}
                                    >
                                      <span style={{ color: calculateGrowth(currentYearMetrics?.totalGenerated, previousYearMetrics?.totalGenerated) >= 0 ? '#4CAF50' : '#F44336' }}>
                                        {calculateGrowth(currentYearMetrics?.totalGenerated, previousYearMetrics?.totalGenerated) >= 0 ? '▲' : '▼'}
                                      </span>
                                      {Math.abs(calculateGrowth(
                                        currentYearMetrics?.totalGenerated,
                                        previousYearMetrics?.totalGenerated
                                      ))}
                                      % from last year
                                    </Typography>
                                  )}
                                  </CardContent>
                                </Card>
                              </Grid>

                              {/* Value Distributed Card */}
                              <Grid size={4}>
                                <Card
                                  sx={{
                                    borderRadius: 2,
                                    boxShadow: 1,
                                    bgcolor: "#FF8042",
                                    height: "fit-content",
                                  }}
                                >
                                  <CardContent
                                    sx={{
                                      textAlign: "center",
                                      py: 1,
                                      px: 1,
                                      "&:last-child": { pb: 1 },
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      minHeight: "unset",
                                    }}
                                  >
                                    <Typography
                                      variant="h5"
                                      sx={{
                                        color: "white",
                                        fontWeight: "bold",
                                        fontSize: "1.1rem",
                                        mb: 0.2,
                                        lineHeight: 1.2,
                                      }}
                                    >
                                      {currentYearMetrics
                                        ? currentYearMetrics.totalDistributed.toLocaleString()
                                        : "0"}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: "white",
                                        fontSize: "0.7rem",
                                        mb: 0.2,
                                        lineHeight: 1.1,
                                      }}
                                    >
                                      Value Distributed
                                    </Typography>
                                                                      {previousYearMetrics && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "white",
                                        fontSize: "0.6rem",
                                        lineHeight: 1,
                                      }}
                                    >
                                      ▲{calculateGrowth(
                                        currentYearMetrics?.totalDistributed,
                                        previousYearMetrics?.totalDistributed
                                      )}% from last year
                                    </Typography>
                                  )}
                                  </CardContent>
                                </Card>
                              </Grid>

                              {/* Value Retained Card */}
                              <Grid size={4}>
                                <Card
                                  sx={{
                                    borderRadius: 2,
                                    boxShadow: 1,
                                    bgcolor: "#182959",
                                    height: "fit-content",
                                  }}
                                >
                                  <CardContent
                                    sx={{
                                      textAlign: "center",
                                      py: 1,
                                      px: 1,
                                      "&:last-child": { pb: 1 },
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      minHeight: "unset",
                                    }}
                                  >
                                    <Typography
                                      variant="h5"
                                      sx={{
                                        color: "white",
                                        fontWeight: "bold",
                                        fontSize: "1.1rem",
                                        mb: 0.2,
                                        lineHeight: 1.2,
                                      }}
                                    >
                                      {currentYearMetrics
                                        ? currentYearMetrics.valueRetained.toLocaleString()
                                        : "0"}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: "white",
                                        fontSize: "0.7rem",
                                        mb: 0.2,
                                        lineHeight: 1.1,
                                      }}
                                    >
                                      Value Retained
                                    </Typography>
                                                                      {previousYearMetrics && (() => {
                                    const currentValue = currentYearMetrics?.valueRetained || 0;
                                    const previousValue = previousYearMetrics?.valueRetained || 0;
                                    const growthRate = calculateGrowth(currentValue, previousValue);
                                    
                                    // For Value Retained, we need to consider the context:
                                    // - If current is better than previous (higher retention), show green up
                                    // - If current is worse than previous (lower retention), show red down
                                    const isImprovement = currentValue > previousValue;
                                    
                                    return (
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          color: "white",
                                          fontSize: "0.6rem",
                                          lineHeight: 1,
                                        }}
                                      >
                                        <span style={{ color: isImprovement ? '#4CAF50' : '#F44336' }}>
                                          {isImprovement ? '▲' : '▼'}
                                        </span>
                                        {Math.abs(growthRate)}% from last year
                                      </Typography>
                                    );
                                  })()}
                                  </CardContent>
                                </Card>
                              </Grid>
                            </Grid>
                          </Box>

                          {/* Chart Area - 2/3 of height */}
                          <Box sx={{ flex: 1, minHeight: 0 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 4,
                                  height: 20,
                                  bgcolor: "#2B8C37",
                                  mr: 1,
                                }}
                              />
                              <Typography
                                variant="h6"
                                sx={{ fontWeight: "bold", fontSize: "0.9rem" }}
                              >
                                Annual Economic Value Analysis
                              </Typography>
                            </Box>
                            <Box sx={{ height: "calc(100% - 40px)" }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={flowData}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="year" tick={{ fontSize: 9 }} />
                                  <YAxis tick={{ fontSize: 9 }} />
                                  <Tooltip
                                    formatter={(value) => [
                                      value.toLocaleString(),
                                      "",
                                    ]}
                                  />
                                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                                  <Bar
                                    dataKey="economic_value_generated"
                                    fill="#2B8C37"
                                    name="Value Generated"
                                  />
                                  <Bar
                                    dataKey="economic_value_distributed"
                                    fill="#FF8042"
                                    name="Value Distributed"
                                  />
                                  <Bar
                                    dataKey="economic_value_retained"
                                    fill="#182959"
                                    name="Value Retained"
                                  />
                                </ComposedChart>
                              </ResponsiveContainer>
                            </Box>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Paper>

                  {/* Right Column - Environment and Social stacked */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      flex: 1,
                      minHeight: 0,
                    }}
                  >
                    {/* Environment Section */}
                    <Paper
                      elevation={1}
                      sx={{
                        flex: 1,
                        p: 0,
                        border: "2px solid #333",
                        borderRadius: 2,
                        backgroundColor: "white",
                        position: "relative",
                        minHeight: 0,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          position: "absolute",
                          top: -12,
                          left: 16,
                          backgroundColor: "white",
                          px: 1,
                          fontWeight: "bold",
                          color: "#333",
                          zIndex: 1,
                        }}
                      >
                        ENVIRONMENT
                      </Typography>
                      <Box
                        sx={{
                          pt: 3,
                          height: "100%",
                          width: "100%",
                          px: 2,
                          pb: 1,
                          display: "flex",
                          alignItems: "stretch",
                          justifyContent: "center",
                        }}
                      >
                        <EnviOverview />
                      </Box>
                    </Paper>

                    {/* Social Section */}
                    <Paper
                      elevation={1}
                      sx={{
                        flex: 1,
                        p: 2,
                        border: "2px solid #333",
                        borderRadius: 2,
                        backgroundColor: "white",
                        position: "relative",
                        minHeight: 0,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          position: "absolute",
                          top: -12,
                          left: 16,
                          backgroundColor: "white",
                          px: 1,
                          fontWeight: "bold",
                          color: "#333",
                        }}
                      >
                        SOCIAL
                      </Typography>
                      <Box
                        sx={{
                          pt: 2,
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <HELPINvestments />
                        <HROverview />
                      </Box>
                    </Paper>
                  </Box>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default Dashboard;
