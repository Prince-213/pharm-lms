"use client";

import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LoadingButtonProps = ComponentProps<typeof Button> & {
  loading?: boolean;
  loadingLabel?: string;
};

export function LoadingButton({
  loading = false,
  loadingLabel,
  disabled,
  children,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={disabled || loading}
      className={cn(className)}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {loadingLabel ?? children}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
