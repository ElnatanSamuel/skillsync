import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "../../../context/ThemeContext";

const ProgressChart = ({ data, title }) => {
  const { isDark } = useTheme();
  
  // Default colors for different themes
  const colors = {
    dark: {
      text: "#ffffff",
      background: "rgba(30, 30, 30, 0.8)",
      gridLines: "rgba(255, 255, 255, 0.1)",
      barColors: ["#6366f1", "#10b981", "#f59e0b", "#ef4444"],
    },
    light: {
      text: "#333333",
      background: "rgba(255, 255, 255, 0.8)",
      gridLines: "rgba(0, 0, 0, 0.1)",
      barColors: ["#4f46e5", "#059669", "#d97706", "#dc2626"],
    }
  };
  
  const theme = isDark ? colors.dark : colors.light;

  if (!data || data.length === 0) {
    return (
      <div className={`rounded-lg border ${isDark ? "border-zinc-700 bg-zinc-900" : "border-gray-200 bg-white"} p-4 h-64 flex items-center justify-center`}>
        <p className={`text-${isDark ? "gray-400" : "gray-500"}`}>No data available</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border ${isDark ? "border-zinc-700 bg-zinc-900/70" : "border-gray-200 bg-white"} p-4`}>
      <h3 className={`font-semibold mb-4 ${isDark ? "text-white" : "text-gray-800"}`}>{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={theme.gridLines} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: theme.text }} 
              tickLine={{ stroke: theme.text }}
            />
            <YAxis 
              tick={{ fill: theme.text }} 
              tickLine={{ stroke: theme.text }}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: theme.background,
                border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.1)",
                borderRadius: "4px",
                color: theme.text
              }}
            />
            <Legend 
              wrapperStyle={{
                color: theme.text
              }}
            />
            <Bar dataKey="completed" name="Completed" fill={theme.barColors[0]} />
            <Bar dataKey="target" name="Target" fill={theme.barColors[1]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProgressChart;
