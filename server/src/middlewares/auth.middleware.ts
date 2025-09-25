import { NextFunction, Request, Response } from "express";

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  res.status(401).json({ error: "Unauthorized" });
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && (req.user as any).role === "ADMIN") {
    return next();
  }

  res.status(403).json({ error: "Forbidden: Admins only" });
};

export const isFaculty = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && (req.user as any).role === "FACULTY") {
    return next();
  }

  res.status(403).json({ error: "Frobidden: Faculty only" });
};
