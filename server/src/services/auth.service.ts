import bcrypt from "bcrypt";
import z from "zod";
import { prisma } from "../config/db.conf";
import { RegisterSchema } from "../types/auth.types";

export const registerUser = async (
  input: z.infer<typeof RegisterSchema>,
  profileImageKey?: string
) => {
  const { email, password, role, stdId, ...rest } = input;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error("User with this email already exists");

  if (role === "STUDENT") {
    const stdIdRegex = /^\d{4}[A-Z]{4}\d{3}$/; // Example: 2023DSIT010
    if (!stdId || !stdIdRegex.test(stdId)) {
      throw new Error("Invalid student ID format");
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role,
      stdId: role === "STUDENT" ? stdId! : null,
      ...rest,
      isApproved: true,
      profileImage: profileImageKey ?? null,
    },
  });

  const { password: _password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) throw new Error("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const { password: _password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("User not found");

  const { password: _password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
