import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const AppPage = () => {
  return (
    <div className="grid h-full w-full place-content-center space-y-6">
      <h1>Welcome to Trackademic</h1>
      <Button asChild>
        <Link href={"/app/home"}>
          Go to Home Page <ArrowRight />
        </Link>
      </Button>
    </div>
  );
};

export default AppPage;
