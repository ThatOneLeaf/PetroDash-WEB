import { useState, useEffect, useMemo } from "react";
import { Button, Box, IconButton } from "@mui/material";

import LaunchIcon from "@mui/icons-material/Launch";
import ClearIcon from "@mui/icons-material/Clear";
import api from "../../services/api";

import { useFilteredData } from "../../components/hr_components/filtering";

import Table from "../../components/Table/Table";
import Filter from "../../components/Filter/Filter";
import Search from "../../components/Filter/Search";
import Pagination from "../../components/Pagination/pagination";
import Overlay from "../../components/modal";
import StatusChip from "../../components/StatusChip";

import KPIIndicatorCard from "../../components/KPIIndicatorCard";

function DemographicsDash({}) {
  //INITIALIZE

  const [filters, setFilters] = useState({
    company_name: "",
    gender: "",
    position_id: "",
    p_np: "",
    employment_status: "",
    status_id: "",
  });

  const companyOptions = [];
  const genderOptions = [];
  const positionOptions = [];
  const employementCategoryOptions = [];
  const employementStatusOptions = [];

  const isFiltering = useMemo(() => {
    return Object.values(filters).some((v) => v !== null && v !== "");
  }, [filters]);

  return (
    <Box sx={{ display: "flex" }}>
      <Box sx={{ flexGrow: 1, height: "100%", overflow: "auto" }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
          <Filter
            label="Company"
            options={[{ label: "All Companies", value: "" }, ...companyOptions]}
            value={filters.company_name}
            onChange={(val) => {
              setFilters((prev) => ({ ...prev, company_name: val }));
              setPage(1);
            }}
            placeholder="Company"
          />

          <Filter
            label="Gender"
            options={[{ label: "All Genders", value: "" }, ...genderOptions]}
            value={filters.gender}
            onChange={(val) => {
              setFilters((prev) => ({ ...prev, gender: val }));
              setPage(1);
            }}
            placeholder="Gender"
          />

          <Filter
            label="Position"
            options={[{ label: "All Position", value: "" }, ...positionOptions]}
            value={filters.position_id}
            onChange={(val) => {
              setFilters((prev) => ({ ...prev, position_id: val }));
              setPage(1);
            }}
            placeholder="Position"
          />

          <Filter
            label="Employement Category"
            options={[
              { label: "All Employement Category", value: "" },
              ...employementCategoryOptions,
            ]}
            value={filters.p_np}
            onChange={(val) => {
              setFilters((prev) => ({ ...prev, p_np: val }));
              setPage(1);
            }}
            placeholder="Employement Category"
          />

          <Filter
            label="Employement Status"
            options={[
              { label: "All Employement Status", value: "" },
              ...employementStatusOptions,
            ]}
            value={filters.employment_status}
            onChange={(val) => {
              setFilters((prev) => ({ ...prev, employment_status: val }));
              setPage(1);
            }}
            placeholder="Employement Status"
          />

          {isFiltering && (
            <Button
              variant="outline"
              startIcon={<ClearIcon />}
              sx={{
                color: "#182959",
                borderRadius: "999px",
                padding: "9px 18px",
                fontSize: "0.85rem",
                fontWeight: "bold",
              }}
              onClick={() => {
                setFilters({
                  company_name: "",
                  gender: "",
                  position_id: "",
                  p_np: "",
                  employment_status: "",
                  status_id: "",
                });
                setPage(1);
              }}
            >
              Clear Filters
            </Button>
          )}
        </Box>
        <Box sx={{ display: "flex", height: "120px", gap: 2 }}>
          <KPIIndicatorCard
            value="1234"
            label="TOTAL ACTIVE WORKFORCE"
            variant="outlined"
          />
          <KPIIndicatorCard
            value="1234"
            label="AVERAGE TENURE RATE"
            variant="filled"
          />
          <KPIIndicatorCard
            value="1234"
            label="ATTRITION RATE"
            variant="outlined"
          />
        </Box>
      </Box>
    </Box>
  );
}

export default DemographicsDash;
