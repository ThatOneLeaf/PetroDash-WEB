// components/StatCard.js
import React from "react";

const KPIIndicatorCard = ({ value, label, variant = "outlined" }) => {
  const isFilled = variant === "filled";

  return (
    <div
      style={{
        flex: 1,
        border: isFilled ? "none" : "2px solid #182959",
        backgroundColor: isFilled ? "#182959" : "transparent",
        height: "100%",
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: isFilled ? "white" : "#182959",
        fontWeight: "bold",
        textAlign: "center",
        padding: "0 0.5rem",
      }}
    >
      <div style={{ fontSize: "2.5rem" }}>{value}</div>
      <div
        style={{
          fontSize: "1rem",
          marginBottom: "0.25rem",
          wordBreak: "break-word",
        }}
      >
        {label}
      </div>
    </div>
  );
};

export default KPIIndicatorCard;
