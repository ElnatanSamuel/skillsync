import React from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "../../../context/ThemeContext";

const SkillRadarChart = ({ data, title }) => {
  const { isDark } = useTheme();

  // Default colors for different themes
  const colors = {
    dark: {
      text: "#ffffff",
      background: "rgba(30, 30, 30, 0.8)",
      gridLines: "rgba(255, 255, 255, 0.1)",
      radarColors: ["#6366f1", "#10b981", "#f59e0b", "#ef4444"],
    },
    light: {
      text: "#333333",
      background: "rgba(255, 255, 255, 0.8)",
      gridLines: "rgba(0, 0, 0, 0.1)",
      radarColors: ["#4f46e5", "#059669", "#d97706", "#dc2626"],
    }
  };

  const theme = isDark ? colors.dark : colors.light;

  if (!data || data.length === 0) {
    return (
      <div className={`rounded-lg border ${isDark ? "border-zinc-700 bg-zinc-900" : "border-gray-200 bg-white"} p-4 h-64 flex items-center justify-center`}>
        <p className={`text-${isDark ? "gray-400" : "gray-500"}`}>No skill distribution data available</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border ${isDark ? "border-zinc-700 bg-zinc-900/70" : "border-gray-200 bg-white"} p-4`}>
      <h3 className={`font-semibold mb-4 ${isDark ? "text-white" : "text-gray-800"}`}>{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke={theme.gridLines} />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: theme.text }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={{ fill: theme.text }}
            />
            <Radar
              name="Current Level"
              dataKey="value"
              stroke={theme.radarColors[0]}
              fill={theme.radarColors[0]}
              fillOpacity={0.6}
            />
            <Radar
              name="Goal Level"
              dataKey="target"
              stroke={theme.radarColors[1]}
              fill={theme.radarColors[1]}
              fillOpacity={0.4}
            />
            <Legend 
              wrapperStyle={{
                color: theme.text
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SkillRadarChart;
