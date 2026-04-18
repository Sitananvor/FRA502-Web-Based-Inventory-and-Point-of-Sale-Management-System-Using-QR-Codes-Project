import "./ChartContainer.css";

const ChartContainer = ({
  title,
  filterValue,
  onFilterChange,
  filterOptions,
  children,
}) => {
  return (
    <div className="chart">
      <div className="chart-header">
        {title && <h2 className="chart-title">{title}</h2>}

        {filterOptions && filterOptions.length > 0 && (
          <select
            className="chart-filter"
            value={filterValue}
            onChange={(e) => onFilterChange?.(e.target.value)}
          >
            {filterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="chart-body">{children}</div>
    </div>
  );
};

export default ChartContainer;
