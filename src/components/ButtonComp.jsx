import { useState } from 'react'
import Button from '@mui/material/Button';

// label = button name, onclick = button function, color = blue/green
function ButtonComp({ label, rounded, onClick, color }) {
  const [btnColor, setColor] = useState();

  const getColor = () => {
    if (color === "green"){
      return "#2B8C37";
    }
    else if (color === "blue"){
      return "#182959";
    }
  }

  const getSecondColor = () => {
    if (color === "green"){
      return "#2B8C37";
    }
    else if (color === "blue"){
      return "#182959";
    }
  }

  return (
    <Button 
      onClick={onClick}
      // className="navbar-center-btn"
      sx={{
        backgroundColor: getColor(color),
        color: 'white',
        padding: '6px 32px',
        border: 'none',
        borderRadius: '100px',
        cursor: 'pointer',
        fontFamily: 'Inter',
        fontWeight: '500',
        fontSize: '16px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        boxSizing: 'border-box',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        '&:hover': {
          backgroundColor: '#256d2f'
        }
    }}
    >{label}</Button>
  )
}

export default ButtonComp;