
import express from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import RedisStore from "connect-redis";

import { connectRedis, redis } from "./redis.js";
import { healthRouter } from "./routes/health.js";
import { publicRouter } from "./routes/public.js";
import { cvRouter } from "./routes/cv.js";
import { authRouter } from "./routes/auth.js";
import { profileRouter } from "./routes/profile.js";
import { experiencesRouter } from "./routes/experiences.js";
import { educationRouter } from "./routes/education.js";
import { skillsRouter } from "./routes/skills.js";
import { projectsRouter } from "./routes/projects.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// Configuration des sessions stockées dans Redis
app.use(
  session({
    name: "portfolio.sid",
    store: new RedisStore({
      client: redis,
      prefix: "portfolio:session:",
    }),
    secret:
      process.env.SESSION_SECRET ?? "secret-temporaire-pour-developpement",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Routes de l'application
app.use("/api/health", healthRouter);
app.use("/api/public", publicRouter);
app.use("/api/cv", cvRouter);
app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/experiences", experiencesRouter);
app.use("/api/education", educationRouter);
app.use("/api/skills", skillsRouter);
app.use("/api/projects", projectsRouter);

// Démarrage du serveur
async function start() {
  await connectRedis();

  app.listen(port, () => {
    console.log(`API démarrée sur le port ${port}`);
  });
}

start().catch((err) => {
  console.error("Erreur au démarrage du serveur :", err);
  process.exit(1);
});

