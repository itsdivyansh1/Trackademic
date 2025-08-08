"use client";
import { Button } from "@workspace/ui/components/button";
import { useState } from "react";

const HomePage = () => {
  const [count, setCount] = useState(0); // starting from 0

  return (
    <div className="w-full h-screen flex items-center justify-center flex-col gap-4">
      <div className="flex gap-2">
        <Button onClick={() => setCount(count + 1)}>Increment</Button>
        <Button
          variant={"destructive"}
          onClick={() => setCount(count <= 0 ? 0 : count - 1)}
        >
          Decrement
        </Button>
      </div>
      <p className="font-medium">Count: {count}</p>
    </div>
  );
};

export default HomePage;
