import { NextFunction, Request, Response } from "express";
import passport, { AuthenticateCallback } from "passport";
import { getUserById, registerUser } from "../services/auth.service";
import { RegisterSchema } from "../types/auth.types";

//  Register
export const register = async (req: Request, res: Response) => {
  try {
    const data = RegisterSchema.parse(req.body);
    const file = req.file as { key?: string } | undefined;
    const profileImageKey = file?.key;

    const user = await registerUser(data, profileImageKey); // Registering user here

    return res.status(201).json({ message: "User registered", user });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

//  Login
export const login = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const done: AuthenticateCallback = (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      const message =
        typeof info === "object" && info !== null && "message" in info
          ? (info as { message: string }).message
          : "Invalid credentials";
      return res.status(401).json({ error: message });
    }

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.json({ message: "Login successful", user });
    });
  };

  passport.authenticate("local", done)(req, res, next);
};

//  Logout
export const logout = (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    return res.json({ message: "Logged out successfully" });
  });
};

//  Get profile
export const profile = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });

    // @ts-ignore
    const user = await getUserById(req.user.id);
    return res.json({ user });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};
