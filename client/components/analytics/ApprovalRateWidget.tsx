"use client";

import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const DATA = [
  { name: "Approved directly", value: 65, color: "#3E6B47" }, // --sage-deep
  { name: "Edited before approval", value: 24, color: "#D4820A" }, // --amber
  { name: "Discarded / Rejected", value: 11, color: "#C94C3A" }, // --error
];

export const ApprovalRateWidget: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[220px] w-full bg-parchment/30 rounded-lg flex items-center justify-center animate-pulse">
        <span className="text-xs text-ink-ghost font-sans">Preparing donut chart...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center select-none text-left w-full h-[220px]">
      <div className="w-full h-32 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={DATA}
              cx="50%"
              cy="50%"
              innerRadius={38}
              outerRadius={52}
              paddingAngle={4}
              dataKey="value"
            >
              {DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }: any) => {
                if (active && payload && payload.length) {
                  const data = payload[0];
                  return (
                    <div className="bg-white border-[0.5px] border-sand px-3 py-1.5 rounded-md shadow-premium text-xs font-sans font-semibold">
                      <span style={{ color: data.payload.color }}>
                        {data.name}: {data.value}%
                      </span>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Floating Center Badge */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-0">
          <div className="flex flex-col items-center">
            <span className="font-mono text-lg font-bold text-ink leading-none">89%</span>
            <span className="text-[8px] text-ink-ghost uppercase font-sans mt-0.5 tracking-wider">Rate</span>
          </div>
        </div>
      </div>

      {/* Legend below */}
      <div className="w-full grid grid-cols-3 gap-2 mt-4 text-[10px] font-sans font-medium text-ink-light">
        {DATA.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center text-center space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="font-semibold text-ink leading-none">{item.value}%</span>
            </div>
            <span className="text-[9px] text-ink-ghost uppercase tracking-wide leading-tight line-clamp-2">
              {item.name.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApprovalRateWidget;
