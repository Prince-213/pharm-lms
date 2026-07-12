"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "group/input-group relative flex h-12 w-full items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm outline-none transition-[color,box-shadow]",
        "has-[[data-slot=input-group-control]:focus-visible]:border-[var(--primary)] has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:ring-[var(--primary-soft)]",
        "has-[[data-slot=input-group-control][aria-invalid=true]]:border-[var(--live)]",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & { align?: "inline-start" | "inline-end" }) {
  return (
    <div
      data-slot="input-group-addon"
      data-align={align}
      className={cn(
        "flex h-auto cursor-text select-none items-center justify-center gap-2 text-sm text-[var(--muted-soft)]",
        align === "inline-start" && "order-first pl-3",
        align === "inline-end" && "order-last pr-3",
        "[&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) return;
        e.currentTarget.parentElement?.querySelector("input")?.focus();
      }}
      {...props}
    />
  );
}

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        "h-11 flex-1 rounded-none border-0 bg-transparent px-3 shadow-none focus-visible:ring-0",
        className,
      )}
      {...props}
    />
  );
}

export { InputGroup, InputGroupAddon, InputGroupInput };
