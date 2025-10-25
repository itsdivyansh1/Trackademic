"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  EyeIcon,
  EyeOffIcon,
  ImagePlus,
  Loader,
  UserRound,
} from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { registerUser } from "@/lib/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import * as RPNInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { toast } from "sonner";
import { z } from "zod";
import TrackademicLogo from "../logo";
import { CountrySelect, FlagComponent, PhoneInput } from "../phone-input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

// Conditional schema: stdId required only if role is STUDENT
const formSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email({ message: "Invalid email" }),
    password: z.string().min(6, { message: "Min 6 characters required" }),
    phone: z
      .string()
      .regex(/^(\+91[\-\s]?)?[6-9]\d{9}$/, "Invalid Indian phone number"),
    department: z.string().min(1, { message: "Required" }),
    role: z.enum(["STUDENT", "FACULTY"], { message: "Required" }),
    stdId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "STUDENT") {
      if (!data.stdId) {
        ctx.addIssue({
          path: ["stdId"],
          message: "StdId is required for students",
          code: z.ZodIssueCode.custom,
        });
      } else if (!/^\d{4}[A-Z]{4}\d{3}$/.test(data.stdId)) {
        ctx.addIssue({
          path: ["stdId"],
          message: "Invalid StdId format",
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });

const Square = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <span
    data-square
    className={cn(
      "bg-muted text-muted-foreground flex size-5 items-center justify-center rounded text-xs font-medium",
      className,
    )}
    aria-hidden="true"
  >
    {children}
  </span>
);

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const id = useId();
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible((prev) => !prev);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      department: "",
      stdId: "",
      role: "STUDENT",
    },
  });

  const selectedRole = form.watch("role");

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      setLoading(false);
      toast.success("Registered successfully");
      router.push("/login");
    },
    onError: (error) => {
      setLoading(false);
      if (error instanceof AxiosError && error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error(error.message || "Registration failed");
      }
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("Submitting:", values); // Debug
    setLoading(true);
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("password", values.password);
    formData.append("phone", values.phone);
    formData.append("department", values.department);
    formData.append("role", values.role);
    if (values.stdId) formData.append("stdId", values.stdId);
    if (profileImage) formData.append("profileImage", profileImage);
    mutation.mutate(formData);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex flex-col gap-6">
            {/* Logo & Header */}
            <div className="flex flex-col items-center gap-2">
              <a
                href="#"
                className="flex flex-col items-center gap-2 font-medium"
              >
                <div className="flex size-8 items-center justify-center rounded-md">
                  <TrackademicLogo />
                </div>
                <span className="sr-only">Trackademic</span>
              </a>
              <h1 className="text-xl font-bold">Welcome to Trackademic.</h1>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline underline-offset-4">
                  Login
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {/* Profile Image */}
              <div className="grid place-items-center">
                <div className="flex w-full max-w-sm flex-col items-center gap-3">
                  <Avatar className="size-20 border-2 border-blue-200 bg-blue-50">
                    {previewUrl ? (
                      <AvatarImage src={previewUrl} alt="Profile image" />
                    ) : (
                      <AvatarFallback className="text-[10px] text-blue-700">
                        <UserRound className="mr-1 size-3" /> Profile image
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div
                    className={cn(
                      "w-full cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition",
                      dragActive
                        ? "border-blue-500 bg-blue-50"
                        : "border-muted-foreground/30 hover:border-muted-foreground/60",
                    )}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type.startsWith("image/")) {
                        setProfileImage(file);
                        setPreviewUrl(URL.createObjectURL(file));
                      }
                    }}
                    onClick={() =>
                      document.getElementById("profileImageInput")?.click()
                    }
                  >
                    <div className="flex flex-col items-center gap-2">
                      <ImagePlus className="size-5 text-blue-600" />
                      <div className="text-xs font-medium">Profile image</div>
                      <div className="text-muted-foreground text-xs">
                        Drag & drop or click to upload
                      </div>
                    </div>
                    <input
                      id="profileImageInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setProfileImage(file);
                        setPreviewUrl(file ? URL.createObjectURL(file) : null);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="example@gmail.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id={id}
                          type={isVisible ? "text" : "password"}
                          placeholder="*********"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={toggleVisibility}
                          className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center"
                        >
                          {isVisible ? (
                            <EyeOffIcon size={16} />
                          ) : (
                            <EyeIcon size={16} />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone No.</FormLabel>
                    <FormControl>
                      <RPNInput.default
                        className="flex rounded-md shadow-xs"
                        international
                        flagComponent={FlagComponent}
                        countrySelectComponent={CountrySelect}
                        inputComponent={PhoneInput}
                        defaultCountry="IN"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Department + StdId */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full ps-2">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Available Departments</SelectLabel>
                              <SelectItem value="it">
                                <Square className="bg-blue-400/20 text-blue-500">
                                  IT
                                </Square>
                                Information Technology
                              </SelectItem>
                              <SelectItem value="cs">
                                <Square className="bg-green-400/20 text-green-500">
                                  CS
                                </Square>
                                Computer Science
                              </SelectItem>
                              <SelectItem value="aids">
                                <Square className="bg-purple-400/20 text-purple-500">
                                  AI
                                </Square>
                                Artificial Intelligence & Data Science
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedRole === "STUDENT" && (
                  <FormField
                    control={form.control}
                    name="stdId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Std Id</FormLabel>
                        <FormControl>
                          <Input placeholder="2023DSIT010" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Role */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Role</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="grid grid-cols-2 gap-3"
                      >
                        <div className="rounded-md border p-3">
                          <RadioGroupItem id="role-student" value="STUDENT" />
                          <FormLabel htmlFor="role-student">STUDENT</FormLabel>
                        </div>
                        <div className="rounded-md border p-3">
                          <RadioGroupItem id="role-faculty" value="FACULTY" />
                          <FormLabel htmlFor="role-faculty">FACULTY</FormLabel>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader className="size-4" /> : "Register"}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      <div className="text-muted-foreground text-center text-xs">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
