import './Charts.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="tooltip-active">
        <p className="tooltip-label">{label}</p>
        <p className="tooltip-payload">{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default CustomTooltip;