function ButtonComp({ label, rounded, onClick, color }) {
    return (
            <button 
              onClick={onClick}
              // className="navbar-center-btn"
              style={{
                backgroundColor: color,
                color: 'white',
                padding: '12px 32px',
                border: 'none',
                borderRadius: '100px',
                cursor: 'pointer',
                fontFamily: 'Inter',
                fontWeight: '500',
                fontSize: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                boxSizing: 'border-box',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
            >{label}</button>
    )
}

export default ButtonComp;