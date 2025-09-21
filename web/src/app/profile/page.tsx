"use client";

import { Button } from "@/components/ui/button";
import { getProfile, logoutUser } from "@/lib/auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Profile() {
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      toast.success("Logged out succesfully");
      router.push("/login");
    },
  });

  useEffect(() => {
    if (isError) {
      router.replace("/login");
    }
  }, [isError, router]);

  if (isLoading)
    return (
      <div className="grid h-screen w-full place-items-center">
        <Loader className="size-4 animate-spin" />
      </div>
    );
  if (isError) return null;

  return (
    <div>
      <h1>Welcome, {data.user.name}</h1>
      <p>Email: {data.user.email}</p>
      <p>Role: {data.user.role}</p>
      <Button
        variant={"destructive"}
        onClick={() => logoutMutation.mutate()}
        disabled={isLoading}
      >
        {isLoading ? <Loader className="size-4" /> : "Logout"}
      </Button>
    </div>
  );
}
