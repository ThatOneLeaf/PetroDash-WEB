import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

// Helper to generate page numbers with ellipsis for large page counts
function getPages(page, count) {
  const pages = [];
  if (count <= 7) {
    for (let i = 1; i <= count; i++) pages.push(i);
    return pages;
  }
  if (page <= 3) {
    pages.push(1, 2, 3, 4, "...", count);
  } else if (page >= count - 2) {
    pages.push(1, "...", count - 3, count - 2, count - 1, count);
  } else {
    pages.push(1, "...", page - 1, page, page + 1, "...", count);
  }
  return pages;
}

/**
 * Pagination component
 * Props:
 * - page: current page number (1-based)
 * - count: total number of pages
 * - onChange: function to call with new page number
 */
export default function Pagination({ page, count, onChange }) {
  // Get the array of page numbers and ellipsis to display
  const pages = getPages(page, count);

  // Style for navigation icons (arrows)
  const iconStyle = {
    fontSize: 22,
    color: "#231815",
    verticalAlign: "middle",
    pointerEvents: "none",
    transition: "color 0.2s",
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        alignItems: "center",
        userSelect: "none",
        py: 1,
      }}
    >
      {/* First page button */}
      <Button
        variant="outlined"
        sx={{
          minWidth: 40,
          p: 0,
          borderRadius: 2,
          transition: "background 0.2s, border-color 0.2s, box-shadow 0.2s",
          "&:hover": {
            bgcolor: page === 1 ? "transparent" : "#f0f4ff",
            borderColor: page === 1 ? "transparent" : "#b3c6ff",
            boxShadow: page === 1 ? "none" : "0 2px 8px 0 rgba(24,41,89,0.08)",
          },
        }}
        disabled={page === 1}
        onClick={() => onChange(1)}
      >
        <span style={{ ...iconStyle, color: page === 1 ? "#b0b0b0" : "#231815" }}>
          &laquo;
        </span>
      </Button>
      {/* Previous page button */}
      <Button
        variant="outlined"
        sx={{
          minWidth: 40,
          p: 0,
          borderRadius: 2,
          transition: "background 0.2s, border-color 0.2s, box-shadow 0.2s",
          "&:hover": {
            bgcolor: page === 1 ? "transparent" : "#f0f4ff",
            borderColor: page === 1 ? "transparent" : "#b3c6ff",
            boxShadow: page === 1 ? "none" : "0 2px 8px 0 rgba(24,41,89,0.08)",
          },
        }}
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        <span style={{ ...iconStyle, color: page === 1 ? "#b0b0b0" : "#231815" }}>
          &lsaquo;
        </span>
      </Button>
      {/* Page number buttons and ellipsis */}
      {pages.map((p, idx) =>
        p === "..." ? (
          // Ellipsis display (not clickable)
          <Box
            key={idx}
            sx={{
              minWidth: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#b0b0b0",
              fontWeight: 500,
              borderRadius: 2,
              fontSize: 18,
              border: "1px solid transparent",
              background: "transparent",
              pointerEvents: "none",
              opacity: 0.7,
              transition: "opacity 0.2s",
            }}
          >
            ...
          </Box>
        ) : (
          // Page number button
          <Button
            key={p}
            variant={p === page ? "contained" : "outlined"}
            sx={{
              minWidth: 40,
              height: 40,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: 18,
              color: p === page ? "#fff" : "#182959",
              bgcolor: p === page ? "#2B8C37" : "#fff",
              borderColor: "#e5e5e5",
              boxShadow: p === page ? "0 2px 8px 0 rgba(43,140,55,0.10)" : "none",
              transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
              "&:hover": {
                bgcolor: p === page ? "#267A31" : "#f3f3f3",
                color: p === page ? "#fff" : "#182959",
                borderColor: "#b3c6ff",
                boxShadow: "0 2px 8px 0 rgba(24,41,89,0.08)",
              },
              "&.Mui-disabled": {
                opacity: 1,
                color: "#b0b0b0",
                bgcolor: "#f5f5f5",
              },
            }}
            onClick={() => onChange(p)}
            disabled={p === page}
            disableElevation
          >
            {p}
          </Button>
        )
      )}
      {/* Next page button */}
      <Button
        variant="outlined"
        sx={{
          minWidth: 40,
          p: 0,
          borderRadius: 2,
          transition: "background 0.2s, border-color 0.2s, box-shadow 0.2s",
          "&:hover": {
            bgcolor: page === count ? "transparent" : "#f0f4ff",
            borderColor: page === count ? "transparent" : "#b3c6ff",
            boxShadow: page === count ? "none" : "0 2px 8px 0 rgba(24,41,89,0.08)",
          },
        }}
        disabled={page === count}
        onClick={() => onChange(page + 1)}
      >
        <span style={{ ...iconStyle, color: page === count ? "#b0b0b0" : "#231815" }}>
          &rsaquo;
        </span>
      </Button>
      {/* Last page button */}
      <Button
        variant="outlined"
        sx={{
          minWidth: 40,
          p: 0,
          borderRadius: 2,
          transition: "background 0.2s, border-color 0.2s, box-shadow 0.2s",
          "&:hover": {
            bgcolor: page === count ? "transparent" : "#f0f4ff",
            borderColor: page === count ? "transparent" : "#b3c6ff",
            boxShadow: page === count ? "none" : "0 2px 8px 0 rgba(24,41,89,0.08)",
          },
        }}
        disabled={page === count}
        onClick={() => onChange(count)}
      >
        <span style={{ ...iconStyle, color: page === count ? "#b0b0b0" : "#231815" }}>
          &raquo;
        </span>
      </Button>
    </Box>
  );
}
