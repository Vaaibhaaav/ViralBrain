"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface ChartDataPoint {
  date: string;
  predicted: number;
  actual: number;
  title: string;
}

const MOCK_CHART_DATA: ChartDataPoint[] = [
  { date: "Jun 20", predicted: 78, actual: 82, title: "Why B2B writing is boring" },
  { date: "Jun 21", predicted: 85, actual: 80, title: "How to edit captions" },
  { date: "Jun 22", predicted: 92, actual: 95, title: "The 3-step hook value" },
  { date: "Jun 23", predicted: 74, actual: 78, title: "Stop editing videos like 2022" },
  { date: "Jun 24", predicted: 87, actual: 89, title: "Why creators quit at 10k" },
  { date: "Jun 25", predicted: 83, actual: 84, title: "8 secrets about LinkedIn" },
];

export const ScoreChart: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[280px] w-full bg-parchment/30 rounded-lg flex items-center justify-center animate-pulse">
        <span className="text-xs text-ink-ghost font-sans">Preparing performance charts...</span>
      </div>
    );
  }

  // Custom chart tooltip renderer matching Apple style shadows
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataPoint;
      return (
        <div className="bg-white border-[0.5px] border-sand p-3.5 rounded-lg shadow-premium text-left max-w-xs space-y-1">
          <p className="text-[10px] font-mono text-ink-ghost uppercase tracking-wide">
            {data.date}
          </p>
          <h5 className="text-xs font-serif font-bold text-ink leading-tight">
            {data.title}
          </h5>
          <div className="flex items-center gap-3 pt-1 text-[11px] font-mono font-medium">
            <span className="text-sage-deep">Predicted: {data.predicted}</span>
            <span className="text-[#D4820A]">Actual: {data.actual}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[280px] w-full text-left select-none">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={MOCK_CHART_DATA}
          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#C8B89A" strokeOpacity={0.35} vertical={false} />
          
          <XAxis
            dataKey="date"
            stroke="#9C9C94"
            fontSize={10}
            fontFamily="JetBrains Mono"
            tickLine={false}
            axisLine={false}
            dy={8}
          />
          
          <YAxis
            stroke="#9C9C94"
            fontSize={10}
            fontFamily="JetBrains Mono"
            tickLine={false}
            axisLine={false}
            dx={-8}
            domain={[60, 100]}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Legend
            verticalAlign="top"
            height={36}
            iconSize={8}
            iconType="circle"
            wrapperStyle={{
              fontSize: "11px",
              fontFamily: "Inter",
              fontWeight: 500,
              color: "#5C5C58"
            }}
          />
          
          <Line
            name="Predicted Virality"
            type="monotone"
            dataKey="predicted"
            stroke="#3E6B47"
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 1 }}
            activeDot={{ r: 5 }}
          />
          
          <Line
            name="Actual Performance"
            type="monotone"
            dataKey="actual"
            stroke="#D4820A"
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 1 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreChart;
