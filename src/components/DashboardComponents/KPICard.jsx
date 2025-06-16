import React from 'react';

function KPICard({ 
  loading, 
  value, 
  unit, 
  title,  
  label, 
  icon: IconComponent, 
  style = {},
  colorScheme = {
    backgroundColor: '#10B981', // default green
    textColor: 'white',
    iconColor: 'white',
  }
}) {
  const hasIcon = Boolean(IconComponent);

  return (
    <div
      style={{
        backgroundColor: colorScheme.backgroundColor,
        color: colorScheme.textColor,
        padding: '15px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        ...style,
      }}
    >
      {hasIcon && (
        <div style={{ flexShrink: 0, color: colorScheme.iconColor }}>
          <IconComponent />
        </div>
      )}
      <div
        style={{
          textAlign: hasIcon ? 'left' : 'center',
          flex: 1,
        }}
      >
        <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>
          {loading ? 'Loading...' : `${value.toLocaleString()} ${unit}`}
        </div>
        <div style={{ fontSize: '14px', opacity: 0.9, fontWeight:'bold',marginBottom: '4px' }}>
            {title.toUpperCase()}
        </div>
        {label && (
            <div style={{ fontSize: '10px', opacity: 0.9 }}>
                {label}
            </div> 
        )}
        

      </div>
    </div>
  );
}

export default KPICard;
