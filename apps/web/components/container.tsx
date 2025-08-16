import { cn } from "@workspace/ui/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

const Container = ({ children, className }: ContainerProps) => {
  return (
    <div className={cn("max-w-screen-lg mx-auto container px-4", className)}>
      {children}
    </div>
  );
};

export default Container;
