import type { LucideProps } from "lucide-react";
import * as React from "react";

export const House2 = React.forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <svg
      {...props}
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor" // Important: makes stroke color controllable
      strokeWidth={1.5} // Optional, adjust if needed
    >
      <path
        d="M15.309,5.603L10.059,1.613c-.624-.475-1.495-.474-2.118,0L2.691,5.603s0,0,0,0c-.433,.329-.691,.85-.691,1.393v7.254c0,1.517,1.233,2.75,2.75,2.75h3.5v-3.75c0-.414,.336-.75,.75-.75s.75,.336,.75,.75v3.75h3.5c1.517,0,2.75-1.233,2.75-2.75V6.996c0-.543-.258-1.064-.691-1.394Z"
        stroke="currentColor" // makes path color controllable
        fill="none" // ensures color is controlled by stroke
      />
    </svg>
  ),
);

House2.displayName = "House2";
