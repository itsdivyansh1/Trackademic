"use client";
import useStore from "@/lib/store";
import { Button } from "@workspace/ui/components/button";
import { PlusIcon } from "lucide-react";

const TestPage = () => {
  const { count, increment } = useStore();

  return (
    <div>
      <p>Count: {count}</p>
      <Button variant={"ghost"} size={"icon"} onClick={increment}>
        <PlusIcon />
      </Button>
    </div>
  );
};

export default TestPage;
