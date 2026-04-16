import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import CustomTooltip from "./CustomTooltip";
import "./Charts.css";

const SalesChart = ({ sales }) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart
        data={sales}
        margin={{ top: 10, right: 15, left: -20, bottom: 10 }}
      >
        <defs>
          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1A73E8" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#1A73E8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="0" vertical={false} />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          angle={-16}
          textAnchor="end"
          dy={7}
        />
        <YAxis axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="sales"
          stroke="#1A73E8"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorSales)"
          dot={{ r: 4, fill: "#1A73E8", strokeWidth: 2, stroke: "#ffffff" }}
          activeDot={{ r: 6 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default SalesChart;
