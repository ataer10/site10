import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-sm border border-input bg-white px-3 py-2 text-sm text-ink-900 transition-colors duration-150",
        "placeholder:text-ink-400",
        "focus-visible:border-steel-500 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:outline-danger",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-24 w-full rounded-sm border border-input bg-white px-3 py-2 text-sm text-ink-900 transition-colors duration-150",
        "placeholder:text-ink-400",
        "focus-visible:border-steel-500 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-[invalid=true]:border-danger",
        className,
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-600",
      className,
    )}
    {...props}
  />
));
Label.displayName = "Label";

export { Input, Textarea, Label };
