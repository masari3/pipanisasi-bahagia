"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "rounded";
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "rectangular", ...props }, ref) => {
    const variantClasses = {
      text: "h-4 w-full rounded",
      circular: "h-12 w-12 rounded-full",
      rectangular: "h-12 w-full rounded-md",
      rounded: "h-12 w-full rounded-lg",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "animate-pulse bg-muted",
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Skeleton.displayName = "Skeleton";

export { Skeleton };
