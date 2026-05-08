"use client";

import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export type StatusPoint = { label: string; count: number };

const STATUS_COLORS: Record<string, string> = {
  Draft: "#6b7280",
  Submitted: "#ca8a04",
  Approved: "#047857",
  Rejected: "#ef4444",
  Published: "#0f5238",
};

type CourseStatusChartProps = {
  data: StatusPoint[];
};

export function CourseStatusChart({ data }: CourseStatusChartProps) {
  const colors = data.map(
    (d) => STATUS_COLORS[d.label] ?? "#10b981",
  );

  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "inherit",
    },
    colors,
    labels: data.map((d) => d.label),
    legend: {
      show: true,
      position: "bottom",
      itemMargin: {
        horizontal: 10,
        vertical: 10
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: "75%",
          background: "transparent",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
              fontWeight: 500,
              offsetY: -10,
            },
            value: {
              show: true,
              fontSize: "24px",
              fontWeight: "bold",
              offsetY: 10,
            },
            total: {
              show: true,
              showAlways: true,
              label: "Courses",
              fontSize: "14px",
              fontWeight: 500,
              formatter: (w) =>
                w.globals.seriesTotals
                  .reduce((a: number, b: number) => a + b, 0)
                  .toString(),
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 2600,
        options: {
          chart: {
            width: 380,
          },
        },
      },
      {
        breakpoint: 640,
        options: {
          chart: {
            width: 250,
          },
        },
      },
    ],
  };

  return (
    <div className="flex justify-center">
      <Chart
        options={options}
        series={data.map((d) => d.count)}
        type="donut"
        height={320}
      />
    </div>
  );
}
