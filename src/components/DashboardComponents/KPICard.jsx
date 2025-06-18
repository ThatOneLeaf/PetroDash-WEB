function KPICard({
  loading,
  value,
  unit,
  title,
  label,
  icon: IconComponent,
  style = {},
  size = 'md', // 'sm' | 'md' | 'lg'
  colorScheme = {
    backgroundColor: '#10B981',
    textColor: 'white',
    iconColor: 'white',
  },
}) {
  const hasIcon = Boolean(IconComponent);

  // Define font scale by size
  const sizeScale = {
    sm: 0.2, // base: 0.4rem
    md: 0.4,
    lg: 0.6,
  };

  const baseSize = sizeScale[size] || 0.5;

  return (
    <div
      style={{
        backgroundColor: colorScheme.backgroundColor,
        color: colorScheme.textColor,
        padding: '0.5rem',
        borderRadius: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        fontSize: `${baseSize}rem`, // 👈 base font size
        ...style,
      }}
    >
      {hasIcon && (
        <div style={{ flexShrink: 0, fontSize: '2.4rem', color: colorScheme.iconColor }}>
          <IconComponent />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0, textAlign: hasIcon ? 'left' : 'center' }}>
        <div
          style={{
            fontSize: `${baseSize+0.7}rem`, // value
            fontWeight: 'bold',
            marginBottom: '0.2rem',
            whiteSpace: 'wrap',
          }}
        >
          {loading ? 'Loading...' : `${value} ${unit}`}
        </div>
        <div
          style={{
            fontSize: `${baseSize+0.3}rem`, // title
            fontWeight: 600,
            opacity: 0.9,
            marginBottom: '0.15rem',
            whiteSpace: 'wrap',
          }}
        >
          {title?.toUpperCase()}
        </div>
        {label && (
          <div
            style={{
              fontSize: `${baseSize+0.1}rem`, // label
              opacity: 0.75,
              whiteSpace: 'wrap',
            }}
          >
            {label}
          </div>
        )}
      </div>
    </div>
  );
}
export default KPICard;
