"use client";

import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export type TrendPoint = { x: string; y: number };

type MentorEnrollmentChartProps = {
  data: TrendPoint[];
};

export function MentorEnrollmentChart({ data }: MentorEnrollmentChartProps) {
  const options: ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      fontFamily: "inherit",
      background: "transparent",
      animations: { enabled: true, speed: 500 },
    },
    colors: ["#0f5238", "#10b981"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.3,
        opacityTo: 0.02,
        stops: [0, 100],
      },
    },
    stroke: { curve: "smooth", width: 2 },
    grid: {
      strokeDashArray: 4,
      borderColor: "rgba(191,201,193,0.35)",
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: "#404943", fontSize: "11px", fontWeight: 500 },
      },
    },
    yaxis: {
      min: 0,
      labels: {
        style: { colors: "#404943", fontSize: "11px" },
        formatter: (v) => Math.round(v).toString(),
      },
    },
    tooltip: {
      theme: "light",
      marker: { show: true },
      y: { formatter: (v) => `${v} enrollment${v !== 1 ? "s" : ""}` },
    },
    legend: { show: false },
  };

  return (
    <div className="-mx-2 px-2">
      <Chart
        options={options}
        series={[{ name: "Enrollments", data }]}
        type="area"
        height={260}
      />
    </div>
  );
}
