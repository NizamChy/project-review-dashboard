import { Router } from "express";
import { Prisma, ProjectStatus, Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();
router.use(requireAuth);
const submitSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Project name must be at least 3 characters.")
    .max(120),
  repoUrl: z
    .string()
    .trim()
    .url("Enter a valid repository URL.")
    .max(500)
    .refine((value) => {
      try {
        const u = new URL(value);
        return ["github.com", "gitlab.com", "bitbucket.org"].includes(
          u.hostname.toLowerCase(),
        );
      } catch {
        return false;
      }
    }, "Repository must be hosted on GitHub, GitLab, or Bitbucket."),
  liveUrl: z
    .union([z.string().trim().url().max(500), z.literal("")])
    .optional(),
  description: z
    .string()
    .trim()
    .min(30, "Description must be at least 30 characters.")
    .max(3000),
});
const reviewSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  reviewNote: z.string().trim().max(1000).optional().default(""),
});

router.post("/", requireRole(Role.STUDENT), async (req, res, next) => {
  try {
    const parsed = submitSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        message: "Please correct the submission details.",
        errors: parsed.error.flatten().fieldErrors,
      });
    const repoUrl = parsed.data.repoUrl.replace(/\/$/, "");
    const repoUrlNormalized = repoUrl.toLowerCase();
    const existing = await prisma.project.findUnique({
      where: { repoUrlNormalized },
      select: { id: true },
    });
    if (existing)
      return res
        .status(409)
        .json({ message: "This repository has already been submitted." });
    const project = await prisma.project.create({
      data: {
        name: parsed.data.name,
        repoUrl,
        repoUrlNormalized,
        liveUrl: parsed.data.liveUrl || null,
        description: parsed.data.description,
        studentId: req.user!.id,
      },
      select: {
        id: true,
        name: true,
        repoUrl: true,
        liveUrl: true,
        description: true,
        status: true,
        createdAt: true,
      },
    });
    return res.status(201).json({ project });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
      return res
        .status(409)
        .json({ message: "This repository has already been submitted." });
    next(error);
  }
});

router.get("/mine", requireRole(Role.STUDENT), async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: { studentId: req.user!.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        repoUrl: true,
        liveUrl: true,
        description: true,
        status: true,
        reviewNote: true,
        reviewedAt: true,
        createdAt: true,
      },
    });
    res.json({ projects });
  } catch (error) {
    next(error);
  }
});

router.get("/stats", requireRole(Role.MENTOR), async (_req, res, next) => {
  try {
    const grouped = await prisma.project.groupBy({
      by: ["status"],
      _count: { _all: true },
    });
    const counts = { total: 0, pending: 0, approved: 0, rejected: 0 };
    for (const item of grouped) {
      counts.total += item._count._all;
      if (item.status === ProjectStatus.PENDING)
        counts.pending = item._count._all;
      if (item.status === ProjectStatus.APPROVED)
        counts.approved = item._count._all;
      if (item.status === ProjectStatus.REJECTED)
        counts.rejected = item._count._all;
    }
    res.json({ stats: counts });
  } catch (error) {
    next(error);
  }
});

router.get("/", requireRole(Role.MENTOR), async (req, res, next) => {
  try {
    const page = Math.max(
      1,
      Number.parseInt(String(req.query.page ?? "1"), 10) || 1,
    );
    const limit = Math.min(
      50,
      Math.max(1, Number.parseInt(String(req.query.limit ?? "10"), 10) || 10),
    );
    const rawStatus = String(req.query.status ?? "ALL").toUpperCase();
    if (!["ALL", "PENDING", "APPROVED", "REJECTED"].includes(rawStatus))
      return res.status(400).json({ message: "Invalid status filter." });
    const status =
      rawStatus === "ALL" ? undefined : (rawStatus as ProjectStatus);
    const where: Prisma.ProjectWhereInput = status ? { status } : {};
    const [projects, total] = await prisma.$transaction([
      prisma.project.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { student: { select: { id: true, name: true, email: true } } },
      }),
      prisma.project.count({ where }),
    ]);
    res.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/:id/review",
  requireRole(Role.MENTOR),
  async (req, res, next) => {
    try {
      const parsed = reviewSchema.safeParse(req.body);
      if (!parsed.success)
        return res.status(400).json({
          message:
            "Choose Approved or Rejected and provide a valid review note.",
        });
      const project = await prisma.project.findUnique({
        where: { id: req.params.id },
      });
      if (!project)
        return res.status(404).json({ message: "Project not found." });
      if (project.status !== ProjectStatus.PENDING)
        return res
          .status(409)
          .json({ message: "This project has already been reviewed." });
      const updated = await prisma.project.update({
        where: { id: project.id },
        data: {
          status: parsed.data.status,
          reviewNote: parsed.data.reviewNote || null,
          reviewedAt: new Date(),
        },
        include: { student: { select: { id: true, name: true, email: true } } },
      });
      res.json({ project: updated });
    } catch (error) {
      next(error);
    }
  },
);
export default router;
