"use client";

import Container from "@/components/container";
import useStore from "@/lib/store";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { ArrowRight, PlusIcon } from "lucide-react";
import { motion } from "motion/react";

const Page = () => {
  const { count, increment } = useStore();

  return (
    <Container className="h-[200vh]">
      <motion.h1
        initial={{
          opacity: 0,
          filter: "blur(10px)",
          y: 10,
        }}
        animate={{
          opacity: 1,
          filter: "blur(0)",
          y: 0,
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
      >
        Home page
      </motion.h1>

      <Button>
        Click Me
        <ArrowRight />
      </Button>

      <Input
        className="max-w-1/3 mt-4"
        placeholder="John Doe"
        type="password"
      />

      <p>Count: {count}</p>
      <Button variant={"ghost"} size={"icon"} onClick={increment}>
        <PlusIcon />
      </Button>
    </Container>
  );
};

export default Page;
