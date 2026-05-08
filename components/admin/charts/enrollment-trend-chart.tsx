"use client";

import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export type TrendPoint = { x: string; y: number };

type EnrollmentTrendChartProps = {
  data: TrendPoint[];
};

export function EnrollmentTrendChart({ data }: EnrollmentTrendChartProps) {
  const options: ApexOptions = {
    legend: {
      show: false,
    },
    colors: ["#0f5238", "#10b981"],
    chart: {
      fontFamily: "inherit",
      height: 335,
      type: "area",
      toolbar: {
        show: false,
      },
    },
    fill: {
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 300,
          },
        },
      },
      {
        breakpoint: 1366,
        options: {
          chart: {
            height: 350,
          },
        },
      },
    ],
    stroke: {
      curve: "smooth",
      width: 2,
    },
    grid: {
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 4,
      colors: "#fff",
      strokeColors: ["#0f5238", "#10b981"],
      strokeWidth: 3,
      strokeOpacity: 0.9,
      strokeDashArray: 0,
      fillOpacity: 1,
      discrete: [],
      hover: {
        size: undefined,
        sizeOffset: 5,
      },
    },
    xaxis: {
      type: "category",
      categories: data.map(d => d.x),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        style: {
          fontSize: "0px",
        },
      },
      min: 0,
      labels: {
        formatter: (v) => Math.round(v).toString(),
      }
    },
  };

  return (
    <div className="-ml-5 -mb-2">
      <Chart
        options={options}
        series={[{ name: "Enrollments", data }]}
        type="area"
        height={310}
      />
    </div>
  );
}
