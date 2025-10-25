"use client";

import { TrackademicLogo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart2,
  ChevronsRight,
  Cpu,
  FileText,
} from "lucide-react";
import Link from "next/link";
import type React from "react";

const TerminalWindow = ({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`flex flex-col border border-gray-700/50 bg-[#0D1117]/50 font-mono text-sm shadow-2xl shadow-black/50 backdrop-blur-sm ${className}`}
  >
    <div className="flex flex-shrink-0 items-center gap-1.5 border-b border-gray-700/50 px-3 py-2">
      <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
      <div className="h-2.5 w-2.5 rounded-full bg-yellow-500"></div>
      <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
    </div>
    <div className="flex-shrink-0 border-b border-gray-700/50 px-3 py-1.5 text-center">
      <p className="text-gray-400">{title}</p>
    </div>
    <div className="flex-grow overflow-y-auto p-4 text-gray-200">
      {children}
    </div>
  </div>
);

export default function HomePage() {
  return (
    <div className="bg-background text-foreground flex min-h-screen w-full flex-col">
      <div className="bg-background absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] bg-[size:36px_36px]"></div>

      <header className="bg-background/80 border-border sticky top-0 z-50 container mx-auto flex items-center justify-between border-b p-4 backdrop-blur-sm">
        <TrackademicLogo />
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/register">Register</Link>
          </Button>
          <Button asChild>
            <Link href={"/login"}>Login</Link>
          </Button>
        </div>
      </header>

      <section className="z-10 container mx-auto flex flex-grow flex-col items-center justify-center px-4">
        <section className="py-24 text-center md:py-32">
          <h2 className="text-4xl leading-tight font-bold tracking-tighter md:text-6xl md:leading-tight">
            The Operating System for
            <br />
            <span className="from-primary animate-gradient bg-gradient-to-r via-purple-400 to-pink-500 bg-clip-text text-transparent">
              Academic Intelligence
            </span>
          </h2>
          <p className="text-muted-foreground mx-auto mt-6 max-w-xl text-lg">
            Automate data collection, streamline accreditation, and unlock
            real-time insights into your institution's research and
            achievements.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="/login">
                Login
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        <section
          id="how-it-works"
          className="relative grid grid-cols-1 items-stretch gap-8 lg:grid-cols-5"
        >
          <TerminalWindow
            title="STEP 1: INPUT"
            className="h-full lg:col-span-1"
          >
            <div className="flex h-full flex-col items-center justify-center text-center">
              <FileText className="text-primary mb-4 h-16 w-16" />
              <h3 className="font-semibold text-gray-200">Upload Documents</h3>
              <p className="mt-1 text-xs text-gray-500">
                CVs, Certificates, Reports
              </p>
            </div>
          </TerminalWindow>

          <div className="hidden flex-col items-center justify-center lg:flex">
            <ChevronsRight className="h-12 w-12 text-gray-600" />
          </div>

          <TerminalWindow
            title="STEP 2: PROCESSING"
            className="h-full lg:col-span-1"
          >
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Cpu className="text-primary mb-4 h-16 w-16" />
              <h3 className="font-semibold text-gray-200">AI Extracts Data</h3>
              <p className="mt-1 text-xs text-gray-500">NLP & OCR Engine</p>
            </div>
          </TerminalWindow>

          <div className="hidden flex-col items-center justify-center lg:flex">
            <ChevronsRight className="h-12 w-12 text-gray-600" />
          </div>

          <TerminalWindow
            title="STEP 3: OUTPUT"
            className="h-full lg:col-span-1"
          >
            <div className="flex h-full flex-col items-center justify-center text-center">
              <BarChart2 className="text-primary mb-4 h-16 w-16" />
              <h3 className="font-semibold text-gray-200">Generate Reports</h3>
              <p className="mt-1 text-xs text-gray-500">NBA, NAAC, & CVs</p>
            </div>
          </TerminalWindow>
        </section>

        <section className="py-24 text-center md:py-32">
          <h3 className="text-3xl font-bold tracking-tighter md:text-4xl">
            Eliminate Manual Work. Focus on Excellence.
          </h3>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg">
            Ready to see Trackademic in action? Get a personalized demo for your
            institution.
          </p>
          <div className="mt-8">
            <Button size="lg">
              <Link href={"/register"}>Get Started</Link>
            </Button>
          </div>
        </section>
      </section>

      <footer className="z-10 container mx-auto p-4">
        <div className="text-muted-foreground text-center text-sm">
          &copy; {new Date().getFullYear()} Trackademic. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
