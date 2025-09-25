import type { LucideProps } from "lucide-react";
import * as React from "react";

export const Award = React.forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <svg
      {...props}
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        d="M9.643,12.133l.777-.652c.18-.151,.408-.234,.643-.234h1.014c.485,0,.901-.348,.985-.826l.176-.999c.041-.232,.162-.441,.342-.592l.777-.652c.372-.312,.466-.846,.223-1.266l-.507-.879c-.118-.204-.16-.442-.119-.674l.176-.999c.084-.478-.187-.947-.643-1.113l-.953-.347c-.221-.08-.406-.236-.524-.44l-.507-.879c-.243-.42-.752-.606-1.208-.44l-.953,.347c-.221,.08-.463,.08-.684,0l-.953-.347c-.456-.166-.965,.019-1.208,.44l-.507,.879c-.118,.204-.303,.359-.524,.44l-.953,.347c-.456,.166-.727,.635-.643,1.113l.176,.999c.041,.232-.001,.47-.119,.674l-.507,.879c-.243,.42-.149,.954,.223,1.266l.777,.652c.18,.151,.301,.361,.342,.592l.176,.999c.084,.478,.5,.826,.985,.826h1.014c.235,0,.463,.083,.643,.234l.777,.652c.372,.312,.914,.312,1.286,0Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="12.25 13.75 12.25 17.25 9 14.75 5.75 17.25 5.75 13.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="9"
        cy="6.724"
        r="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
);

Award.displayName = "Award";
