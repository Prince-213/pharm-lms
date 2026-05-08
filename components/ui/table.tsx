import clsx from "clsx";
import * as React from "react";

function Table({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={clsx("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={clsx(
        "[&_tr]:border-b [&_tr]:border-[var(--border)]",
        className,
      )}
      {...props}
    />
  );
}

function TableBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={clsx("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableRow({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={clsx(
        "border-b border-[var(--border)] transition-colors hover:bg-[var(--surface-muted)]/50",
        className,
      )}
      {...props}
    />
  );
}

function TableHead({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={clsx(
        "h-10 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wide text-[var(--muted)]",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={clsx(
        "px-4 py-3 align-middle text-sm text-[var(--foreground)]",
        className,
      )}
      {...props}
    />
  );
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
