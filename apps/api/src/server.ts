import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth";
import projectRoutes from "./routes/projects";

const app = express();
const port = Number(process.env.PORT ?? 4000);
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: process.env.WEB_ORIGIN ?? "http://localhost:3000" }));
app.use(express.json({ limit: "32kb" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
      message: "Too many authentication attempts. Please try again later.",
    },
  }),
  authRoutes,
);
app.use(
  "/api/projects",
  rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message: "Submission limit reached. Please try again later." },
    skip: (req) => req.method !== "POST",
  }),
  projectRoutes,
);
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  },
);
app.listen(port, () =>
  console.log(`API listening on http://localhost:${port}`),
);
