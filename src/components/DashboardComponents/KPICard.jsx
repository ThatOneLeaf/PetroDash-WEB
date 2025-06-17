function KPICard({
  loading,
  value,
  unit,
  title,
  label,
  icon: IconComponent,
  style = {},
  colorScheme = {
    backgroundColor: '#10B981',
    textColor: 'white',
    iconColor: 'white',
  },
}) {
  const hasIcon = Boolean(IconComponent);

  return (
    <div
      style={{
        backgroundColor: colorScheme.backgroundColor,
        color: colorScheme.textColor,
        padding: '1em', // relative padding
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5em',
        fontSize: '1.2vw', // 👈 scalable base font size, depends on box
        width: '100%',
        ...style,
      }}
    >
      {hasIcon && (
        <div style={{ flexShrink: 0, color: colorScheme.iconColor }}>
          <IconComponent />
        </div>
      )}
      <div style={{ flex: 1, textAlign: hasIcon ? 'left' : 'center' }}>
        <div style={{ fontSize: '1em', fontWeight: 'bold', marginBottom: '0.2em' }}>
          {loading ? 'Loading...' : `${value.toLocaleString()} ${unit}`}
        </div>
        <div style={{ fontSize: '0.6em', fontWeight: 'bold', marginBottom: '0.2em', opacity: 0.9 }}>
          {title.toUpperCase()}
        </div>
        {label && (
          <div style={{ fontSize: '0.1em', opacity: 0.8 }}>
            {label}
          </div>
        )}
      </div>
    </div>
  );
}


export default KPICard;
