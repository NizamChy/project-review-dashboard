import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();
const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  password: z
    .string()
    .min(10)
    .max(72)
    .regex(/[A-Za-z]/, "Password must contain a letter.")
    .regex(/[0-9]/, "Password must contain a number."),
});
const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(72),
});

function issueToken(user: {
  id: string;
  email: string;
  role: Role;
  name: string;
}) {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32)
    throw new Error(
      "JWT_SECRET must be configured with at least 32 characters.",
    );
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    secret,
    {
      expiresIn: (process.env.JWT_EXPIRES_IN ??
        "1d") as jwt.SignOptions["expiresIn"],
    },
  );
}

router.post("/signup", async (req, res, next) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        message: "Please check the form fields.",
        errors: parsed.error.flatten().fieldErrors,
      });
    const email = parsed.data.email.toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing)
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await prisma.user.create({
      data: { name: parsed.data.name, email, passwordHash, role: Role.STUDENT },
      select: { id: true, name: true, email: true, role: true },
    });
    return res.status(201).json({ token: issueToken(user), user });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({ message: "Enter a valid email and password." });
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });
    if (
      !user ||
      !(await bcrypt.compare(parsed.data.password, user.passwordHash))
    )
      return res.status(401).json({ message: "Invalid email or password." });
    const publicUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    return res.json({ token: issueToken(publicUser), user: publicUser });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, async (req, res) => {
  res.json({ user: req.user });
});
export default router;
