"use client";

import React from "react";
import ScoreChart from "@/components/analytics/ScoreChart";
import ApprovalRateWidget from "@/components/analytics/ApprovalRateWidget";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function AnalyticsPage() {
  const stats = [
    { label: "Avg Virality Score", value: "82.4" },
    { label: "Total Approved", value: "47" },
    { label: "Approval Rate", value: "89%" },
    { label: "Best Platform", value: "YouTube" },
  ];

  const tableData = [
    {
      title: "Why most creators quit at 10k followers — and the mindset shift that changes everything",
      platforms: ["tiktok", "instagram", "youtube", "twitter"],
      predicted: 87,
      ctr: "—",
      status: "Scheduled",
    },
    {
      title: "The 3-step Hooks framework that generated $150k in pipeline value",
      platforms: ["linkedin", "twitter"],
      predicted: 92,
      ctr: "8.2%",
      status: "Published",
    },
    {
      title: "Stop editing your videos like it's 2022. Do this instead.",
      platforms: ["tiktok", "instagram", "youtube"],
      predicted: 74,
      ctr: "3.1%",
      status: "Published",
    },
    {
      title: "8 secrets about the LinkedIn algorithm they won't tell you",
      platforms: ["linkedin"],
      predicted: 83,
      ctr: "5.4%",
      status: "Published",
    },
  ];

  return (
    <div className="space-y-8 select-none">
      {/* Title Header */}
      <div className="text-left border-b-[0.5px] border-sand/40 pb-4">
        <h1 className="font-serif text-3xl font-bold text-ink leading-tight">
          Analytics
        </h1>
        <p className="text-[13px] text-ink-light font-sans mt-0.5">
          Track predicted virality scores against real audience click-through rates.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="bg-white p-4 text-left border-[0.5px] border-sand/60 rounded-md">
            <span className="font-mono text-2xl font-bold text-sage-deep block">
              {stat.value}
            </span>
            <span className="text-[11px] font-sans font-medium text-ink-ghost uppercase tracking-wider block mt-1">
              {stat.label}
            </span>
          </Card>
        ))}
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Score over time (Left 2 cols) */}
        <Card className="lg:col-span-2 bg-white border-[0.5px] border-sand shadow-sm rounded-lg flex flex-col justify-between">
          <CardHeader className="text-left">
            <CardTitle>Virality Index Over Time</CardTitle>
            <CardDescription>Predicted AI scores compared against actual creator audience performance.</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ScoreChart />
          </CardContent>
        </Card>

        {/* Approval rate donut chart (Right 1 col) */}
        <Card className="lg:col-span-1 bg-white border-[0.5px] border-sand shadow-sm rounded-lg flex flex-col justify-between">
          <CardHeader className="text-left">
            <CardTitle>Workflows & Edits</CardTitle>
            <CardDescription>Ratio of content drafts approved, edited, or discarded.</CardDescription>
          </CardHeader>
          <CardContent>
            <ApprovalRateWidget />
          </CardContent>
        </Card>
      </div>

      {/* Performance detailed tables */}
      <div className="space-y-4">
        <div className="text-left border-b-[0.5px] border-sand/30 pb-2">
          <h3 className="text-[11px] font-sans font-bold text-ink-ghost tracking-wider uppercase">
            Recent Post Performance
          </h3>
        </div>

        <Card className="bg-white border-[0.5px] border-sand rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto select-none">
            <table className="w-full text-sm text-ink font-sans text-left">
              <thead>
                <tr className="border-b-[0.5px] border-sand/30 text-ink-ghost text-xs uppercase tracking-wide bg-cream/15">
                  <th className="p-4 font-bold">Pack Title</th>
                  <th className="p-4 font-bold">Platforms</th>
                  <th className="p-4 font-bold">Predicted Index</th>
                  <th className="p-4 font-bold">Actual CTR</th>
                  <th className="p-4 font-bold">Publish Status</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, idx) => (
                  <tr key={idx} className="border-b-[0.5px] border-sand/20 last:border-b-0 hover:bg-blush/30 transition-colors">
                    <td className="p-4 font-serif font-bold text-sm max-w-sm truncate leading-tight">
                      {row.title}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {row.platforms.map((plat) => (
                          <Badge key={plat} variant="platform" platform={plat as any} className="text-[8px] font-mono leading-none px-1 py-0.5">
                            {plat.substring(0, 2)}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-sage-deep">
                      {row.predicted}
                    </td>
                    <td className="p-4 font-mono font-medium text-ink-light">
                      {row.ctr}
                    </td>
                    <td className="p-4">
                      <Badge variant={row.status === "Published" ? "sage" : "amber"}>
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
