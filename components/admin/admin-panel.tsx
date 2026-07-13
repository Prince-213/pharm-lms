"use client";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AdminPanelProps = {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
};

export function AdminPanel({
  title,
  description,
  children,
  className,
  headerAction,
}: AdminPanelProps) {
  return (
    <Card className={cn(className)}>
      {title ? (
        <CardHeader className="border-b">
          <div className="min-w-0 flex-1">
            <CardTitle className="font-display text-lg">{title}</CardTitle>
            {description ? (
              <CardDescription>{description}</CardDescription>
            ) : null}
          </div>
          {headerAction ? <CardAction>{headerAction}</CardAction> : null}
        </CardHeader>
      ) : null}
      <CardContent className={title ? "pt-6" : "p-6"}>{children}</CardContent>
    </Card>
  );
}
