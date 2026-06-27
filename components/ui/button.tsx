import * as React from "react";
import { Slot } from "@/components/ui/slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium tracking-tight transition-colors duration-150 ease-[var(--ease-industrial)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Birincil eylem — çelik mavisi
        primary:
          "bg-steel-500 text-primary-foreground hover:bg-steel-600 active:bg-steel-700",
        // Güçlü CTA — endüstriyel turuncu (ölçülü kullan)
        accent:
          "bg-accent text-accent-foreground hover:bg-orange-600 active:bg-orange-700",
        // Koyu nötr
        solid:
          "bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-950",
        // 1px hairline çerçeveli
        outline:
          "border border-ink-300 bg-white text-ink-800 hover:bg-ink-50 hover:border-ink-400",
        ghost: "text-ink-700 hover:bg-ink-100 hover:text-ink-900",
        link: "text-steel-500 underline-offset-4 hover:underline rounded-none",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
