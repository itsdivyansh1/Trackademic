import { cn } from "@/lib/utils";
import flags from "react-phone-number-input/flags";
import { Input } from "./ui/input";

import * as RPNInput from "react-phone-number-input";

export const PhoneInput = ({
  className,
  ...props
}: React.ComponentProps<"input">) => {
  return (
    <Input
      data-slot="phone-input"
      className={cn(
        "-ms-px rounded-s-none shadow-none focus-visible:z-10",
        className,
      )}
      {...props}
    />
  );
};

PhoneInput.displayName = "PhoneInput";

export const CountrySelect = () => {
  return (
    <div className="border-input bg-background text-muted-foreground focus-within:border-ring focus-within:ring-ring/50 hover:bg-accent hover:text-foreground has-aria-invalid:border-destructive/60 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40 relative inline-flex items-center self-stretch rounded-s-md border py-2 ps-3 pe-2 transition-[color,box-shadow] outline-none focus-within:z-10 focus-within:ring-[3px] has-disabled:pointer-events-none has-disabled:opacity-50">
      <div className="inline-flex items-center gap-1" aria-hidden="true">
        <FlagComponent
          country={"IN"}
          countryName={"India"}
          aria-hidden="true"
        />
      </div>
    </div>
  );
};

export const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country];

  return (
    <span className="w-5 overflow-hidden rounded-xs">
      {Flag && <Flag title={countryName} />}
    </span>
  );
};
