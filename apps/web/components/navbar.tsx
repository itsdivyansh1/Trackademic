"use client";

import useStore from "@/lib/store";
import { Button } from "@workspace/ui/components/button";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Container from "./container";

const Navbar = () => {
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    console.log(latest);
  });

  const [hovered, setHovered] = useState<number | null>(null);
  const navItems = ["Home", "About", "Contact us"];

  // Shopping cart
  const { count } = useStore();

  return (
    <Container>
      <nav className="flex justify-between items-center py-4">
        <Image
          src={"/favicon.ico"}
          alt="Logo"
          width={100}
          height={100}
          className="w-10 h-10"
        />

        <div className="flex items-center gap-4">
          <div>
            {navItems.map((item, idx) => (
              <Link
                className="relative px-2 py-1 text-sm"
                key={idx}
                href={item}
                onMouseEnter={() => setHovered(idx)}
                onMouseLeave={() => setHovered(null)}
              >
                {hovered === idx && (
                  <motion.span
                    layoutId="hovered-span"
                    className="absolute inset-0 w-full h-full rounded-md bg-accent"
                  />
                )}
                <span className="relative z-10">{item}</span>
              </Link>
            ))}
          </div>
          <Button size={"sm"}>
            Start Now <ArrowRight className="size-4" />
          </Button>

          <div className="relative inline-block">
            <ShoppingCart className="size-6" />
            <span className="absolute -top-2 -right-3 min-w-5 text-center text-xs font-medium rounded-full bg-red-600 text-white p-0.5">
              {count}
            </span>
          </div>
        </div>
      </nav>
    </Container>
  );
};

export default Navbar;
