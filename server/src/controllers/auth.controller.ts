import { NextFunction, Request, Response } from "express";
import passport, { AuthenticateCallback } from "passport";
import { getUserById, registerUser, updateUserProfile } from "../services/auth.service";
import { RegisterSchema } from "../types/auth.types";
import { User as PrismaUser } from "@prisma/client";
import { z } from "zod";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3 from "../config/s3.config";
import { S3_BUCKET_NAME } from "../config/index.conf";

//  Register
export const register = async (req: Request, res: Response) => {
  try {
    const data = RegisterSchema.parse(req.body);
    const file = req.file as { key?: string } | undefined;
    const profileImageKey = file?.key;

    const user = await registerUser(data, profileImageKey); // Registering user here
    const userWithSignedUrl = await getSignedProfileImageUrl(user);

    return res.status(201).json({ message: "User registered", user: userWithSignedUrl });
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
  const done: AuthenticateCallback = async (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      const message =
        typeof info === "object" && info !== null && "message" in info
          ? (info as { message: string }).message
          : "Invalid credentials";
      return res.status(401).json({ error: message });
    }

    req.logIn(user, async (err) => {
      if (err) return next(err);
      const userWithSignedUrl = await getSignedProfileImageUrl(user);
      return res.json({ message: "Login successful", user: userWithSignedUrl });
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

// Helper function to get signed URL for profile image
async function getSignedProfileImageUrl(user: any) {
  if (!user.profileImage) return { ...user };
  
  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: user.profileImage,
    });
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 60 * 24 }); // 24 hours
    return { ...user, profileImage: signedUrl };
  } catch (err) {
    console.error("Failed to get signed URL for profile image:", err);
    return { ...user };
  }
}

//  Get profile
export const profile = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });

    // @ts-ignore
    const user = await getUserById(req.user.id);
    const userWithSignedUrl = await getSignedProfileImageUrl(user);
    return res.json({ user: userWithSignedUrl });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

// Get S3 configuration
export const getS3Config = async (req: Request, res: Response) => {
  try {
    const config = {
      bucketName: process.env.S3_BUCKET_NAME,
      region: process.env.AWS_REGION,
    };
    return res.json({ config });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

// Update profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });

    const userId = (req.user as PrismaUser).id;
    
    // Define update schema
    const UpdateProfileSchema = z.object({
      name: z.string().min(1, "Name is required").optional(),
      phone: z.string().optional(),
      department: z.string().optional(),
      stdId: z.string().optional(),
    });

    const validatedData = UpdateProfileSchema.parse(req.body);
    const file = req.file as { key?: string } | undefined;
    const profileImageKey = file?.key;

    // Filter out undefined values to match the service signature
    const updateData: {
      name?: string;
      phone?: string;
      department?: string;
      stdId?: string;
    } = {};
    
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone;
    if (validatedData.department !== undefined) updateData.department = validatedData.department;
    if (validatedData.stdId !== undefined) updateData.stdId = validatedData.stdId;

    const updatedUser = await updateUserProfile(userId, updateData, profileImageKey);
    const userWithSignedUrl = await getSignedProfileImageUrl(updatedUser);

    return res.json({ message: "Profile updated successfully", user: userWithSignedUrl });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      const formattedErrors = err.errors.map((error: any) => ({
        field: error.path.join('.'),
        message: error.message,
        code: error.code
      }));
      return res.status(400).json({ 
        error: "Validation failed", 
        details: formattedErrors 
      });
    }
    return res.status(400).json({ error: err.message });
  }
};
