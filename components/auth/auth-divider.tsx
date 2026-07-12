import type React from "react";

export function AuthDivider({
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className="relative flex w-full items-center" {...props}>
      <div className="w-full border-t border-[var(--border)]" />
      <div className="flex w-max shrink-0 justify-center text-nowrap px-2 text-xs text-[var(--muted-soft)]">
        {children}
      </div>
      <div className="w-full border-t border-[var(--border)]" />
    </div>
  );
}
