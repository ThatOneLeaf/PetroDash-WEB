export const renderGenericLegend = ({
  getColor = (item) => item.color,
  getLabel = (item) => item.value,
  containerStyle = {},
  itemStyle = {},
  indicatorStyle = {},
  labelStyle = {},
} = {}) => {
  return (props) => {
    const { payload } = props;
    if (!payload || !payload.length) return null;

    return (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          fontSize: '0.7rem',
          paddingLeft: 10,
          ...containerStyle,
        }}
      >
        {payload.map((entry, index) => (
          <div
            key={`legend-item-${index}`}
            style={{ display: 'flex', alignItems: 'center', gap: 4, ...itemStyle }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                backgroundColor: getColor(entry),
                borderRadius: 2,
                ...indicatorStyle,
              }}
            />
            <span style={{ ...labelStyle }}>{getLabel(entry)}</span>
          </div>
        ))}
      </div>
    );
  };
};
