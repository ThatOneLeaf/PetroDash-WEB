import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography
} from "@mui/material";
import api from "../services/api";

const EnergyTable = () => {
  const [energyData, setEnergyData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/energy/overall_energy");
        const result = response.data;
        setEnergyData(result.data || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <TableContainer
      sx={{
        width: "100%",
        overflowX: "auto",
        border: '1px solid #ccc',
        borderRadius: 1,
      }}
    >
      <Table size="small" sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#111c2e" }}>
            <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
              Company ID
            </TableCell>
            <TableCell align="right" sx={{ color: "#fff", fontWeight: "bold" }}>
              Total Energy Generated (kWh)
            </TableCell>
            <TableCell align="right" sx={{ color: "#fff", fontWeight: "bold" }}>
              CO₂ Avoided (tons)
            </TableCell>
            <TableCell align="right" sx={{ color: "#fff", fontWeight: "bold" }}>
              Estimated Houses Powered
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {energyData.map((row, index) => (
            <TableRow
              key={row.company_id}
              sx={{
                backgroundColor: index % 2 === 0 ? "#f5f5f5" : "#ffffff",
                "&:hover": {
                  backgroundColor: "#e3f2fd",
                },
              }}
            >
              <TableCell>{row.company_id}</TableCell>
              <TableCell align="right">
                {row.total_energy_generated.toLocaleString()}
              </TableCell>
              <TableCell align="right">
                {row.total_co2_avoided.toFixed(2)}
              </TableCell>
              <TableCell align="right">
                {row.total_est_house_powered.toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default EnergyTable;
