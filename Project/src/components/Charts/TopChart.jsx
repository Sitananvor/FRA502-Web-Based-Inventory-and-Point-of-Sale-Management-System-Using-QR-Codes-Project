import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import CustomTooltip from "./CustomTooltip";
import "./Charts.css";

const TopChart = ({ salesItems }) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={salesItems}
        margin={{ top: 10, right: 15, left: -20, bottom: 10 }}
        barSize={32}
      >
        <CartesianGrid strokeDasharray="0" vertical={false} />
        <XAxis
          dataKey="name"
          tickFormatter={(v) =>
            v.length > 10 ? v.substring(0, 10) + "..." : v
          }
          axisLine={false}
          tickLine={false}
          angle={-16}
          textAnchor="end"
          dy={1}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => (Number.isInteger(v) ? v : "")}
        />{" "}
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F0F7FF" }} />
        <Bar dataKey="value" fill="#1A73E8" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TopChart;
