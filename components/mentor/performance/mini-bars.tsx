"use client";

export function MiniBars({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-36 items-end gap-2 px-1">
      {values.map((v, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-2">
          <div
            className="w-full min-h-[8px] max-w-[36px] rounded-t-md bg-[var(--primary)]/80 transition-all"
            style={{ height: `${Math.max(10, (v / max) * 100)}%` }}
            title={`${v}%`}
          />
          <span className="text-[11px] font-medium text-[#6a6f73]">
            {["M", "T", "W", "T", "F", "S", "S"][i]}
          </span>
        </div>
      ))}
    </div>
  );
}
