import { LucideProps } from "lucide-react";
import * as React from "react";

export const MenuCustom = React.forwardRef<SVGSVGElement, LucideProps>(
  ({ color = "currentColor", size = 24, strokeWidth = 2, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      {...props}
    >
      <line x1="1" y1="12" x2="23" y2="12" />
      <line x1="12" y1="5" x2="23" y2="5" />
      <line x1="1" y1="19" x2="12" y2="19" />
    </svg>
  ),
);

MenuCustom.displayName = "MenuCustom";
