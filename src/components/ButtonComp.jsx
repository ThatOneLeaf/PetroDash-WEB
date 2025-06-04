import { Button } from "@mui/material";

function ButtonComp({ label, rounded, onClick, color, startIcon }) {
  const getColor = () => {
    if (color === "green") return "#2B8C37";
    if (color === "blue") return "#182959";
  };

  return (
    <Button
      onClick={onClick}
      startIcon={startIcon}
      sx={{
        backgroundColor: getColor(),
        color: 'white',
        padding: '9px 18px',
        border: 'none',
        borderRadius: rounded ? '999px' : '4px',
        cursor: 'pointer',
        fontFamily: 'Inter',
        fontWeight: 'bold',
        fontSize: '0.85rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        boxSizing: 'border-box',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        '&:hover': {
          backgroundColor: color === 'green' ? '#256d2f' : '#0f1a3c',
        },
      }}
    >
      {label}
    </Button>
  );
}
export default ButtonComp;