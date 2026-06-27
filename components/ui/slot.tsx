"use client";

import * as React from "react";

/**
 * Minimal Slot — `asChild` deseni için. Tek çocuğa kendi prop'larını
 * (className birleştirilerek, ref iletilerek) aktarır. shadcn'in Radix Slot
 * davranışının hafif bir alt kümesi; bizim kullanımımız (Link sarmalama) için
 * yeterli.
 */
export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

export const Slot = React.forwardRef<HTMLElement, SlotProps>(
  ({ children, className, ...slotProps }, ref) => {
    if (!React.isValidElement(children)) {
      return null;
    }

    const child = children as React.ReactElement<
      Record<string, unknown> & { className?: string }
    >;

    return React.cloneElement(child, {
      ...slotProps,
      ...child.props,
      className: [className, child.props.className].filter(Boolean).join(" "),
      ref,
    } as Record<string, unknown>);
  },
);
Slot.displayName = "Slot";
