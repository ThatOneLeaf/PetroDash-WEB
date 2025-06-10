function PageButtons({ pages = [], selected, setSelected }) {
  /*
<Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              {[
                "Employability",
                "Parental Leave",
                "Safety Work Data",
                "Training",
                "OSH",
              ].map((type) => (
                <Button
                  key={type}
                  onClick={() => setSelected(type)}
                  variant="contained"
                  sx={{
                    backgroundColor: selected === type ? "#2B8C37" : "#9ca3af",
                    borderRadius: "15px",
                    padding: "3px 12px",
                    height: "30px",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "white",
                    whiteSpace: "nowrap",
                    "&:hover": {
                      backgroundColor:
                        selected === type ? "#256d2f" : "#6b7280",
                    },
                  }}
                >
                  {type}
                </Button>
              ))}
            </Box>

  */

  return (
    <div
      style={{
        display: "flex",
        gap: "0.5rem",
        flexWrap: "wrap",
        marginBottom: "1rem",
        justifyContent: "left",
      }}
    >
      {pages.map((type) => (
        <button
          key={type}
          onClick={() => setSelected(type)}
          style={{
            backgroundColor: selected === type ? "#2B8C37" : "#9ca3af",
            borderRadius: "15px",
            padding: "6px 12px",
            height: "30px",
            fontSize: "0.85rem",
            fontWeight: 700,
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          {type}
        </button>
      ))}
    </div>
  );
}

export default PageButtons;
