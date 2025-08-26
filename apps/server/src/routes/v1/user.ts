import client from "@repo/db/client";
import { Request, Response, Router } from "express";
import { SigninSchema, SignupSchema } from "../../types";

export const userRouter = Router();

userRouter.post("/signup", async (req: Request, res: Response) => {
  // Check user
  const parsedData = SignupSchema.safeParse(req.body);

  if (!parsedData.success) {
    res.status(400).json({ message: "Validation failed" });
    return;
  }

  try {
    const user = await client.user.create({
      data: {
        username: parsedData.data.username,
        email: parsedData.data.email,
        password: parsedData.data.password,
      },
    });

    res.json({
      userId: user.id,
    });
  } catch (e) {
    res.status(400).json({ message: "User already exists" });
  }
});

userRouter.get("/signin", async (req: Request, res: Response) => {
  const parsedData = SigninSchema.safeParse(req.body);

  if (!parsedData.success) {
    res.status(403).json({ message: "Validation failed" });
    return;
  }

  try {
    // Check if email exists
    const user = await client.user.findUnique({
      where: {
        email: parsedData.data.email,
      },
    });

    res.json({
      username: user?.username,
    });
  } catch (e) {}
});
