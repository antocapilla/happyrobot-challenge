"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked);
      props.onChange?.(e);
    };

    return (
      <label className="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={handleChange}
          className="sr-only peer"
          {...props}
        />
        <div
          className={cn(
            "relative w-11 h-6 bg-input rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring peer-focus:ring-offset-2 peer-focus:ring-offset-background peer-disabled:cursor-not-allowed peer-disabled:opacity-50 transition-colors",
            checked && "bg-primary",
            className
          )}
        >
          <div
            className={cn(
              "absolute top-0.5 left-0.5 bg-background w-5 h-5 rounded-full shadow-lg transition-transform",
              checked ? "translate-x-5" : "translate-x-0"
            )}
          />
        </div>
      </label>
    );
  }
);
Switch.displayName = "Switch";

export { Switch };

