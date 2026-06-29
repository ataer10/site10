import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-xs font-medium tracking-tight",
  {
    variants: {
      variant: {
        default: "border-ink-200 bg-ink-50 text-ink-700",
        steel: "border-steel-200 bg-steel-50 text-steel-700",
        accent: "border-steel-200 bg-steel-50 text-steel-700",
        success: "border-emerald-200 bg-emerald-50 text-success",
        warning: "border-amber-200 bg-amber-50 text-warning",
        outline: "border-ink-300 bg-transparent text-ink-600",
        solid: "border-transparent bg-ink-900 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
