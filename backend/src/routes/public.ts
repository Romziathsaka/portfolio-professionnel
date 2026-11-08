import { Router } from "express";
import { pool } from "../db.js";
import { redis } from "../redis.js";

export const publicRouter = Router();

const CACHE_TTL_SECONDS = 60 * 5;

publicRouter.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const cacheKey = `portfolio:${slug}`;

    // 1. Vérifier si le portfolio existe déjà dans Redis
    const cached = await redis.get(cacheKey);

    if (cached) {
      return res.json({
        source: "cache",
        ...JSON.parse(cached),
      });
    }

    // 2. Récupérer le profil de l'utilisateur
    const profileResult = await pool.query(
        `SELECT
          u.slug,
          p.full_name,
          p.headline,
          p.bio,
          p.phone,
          p.city,
          p.linkedin_url,
          p.github_url,
          p.website_url,
          p.photo_url
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.slug = $1
         AND u.is_public = TRUE`,
        [slug]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({
        error: "Portfolio introuvable",
      });
    }

    const profile = profileResult.rows[0];

    // 3. Récupérer les expériences professionnelles
    const experiencesResult = await pool.query(
        `SELECT id, position, company, start_date, end_date,
              description
       FROM experiences
       WHERE user_id = (
         SELECT id FROM users WHERE slug = $1
       )
       ORDER BY sort_order ASC, start_date DESC`,
        [slug]
    );

    // 4. Récupérer les formations
    const educationResult = await pool.query(
        `SELECT id, degree, school, start_date, end_date,
              description
       FROM education
       WHERE user_id = (
         SELECT id FROM users WHERE slug = $1
       )
       ORDER BY sort_order ASC, start_date DESC`,
        [slug]
    );

    // 5. Récupérer les compétences
    const skillsResult = await pool.query(
        `SELECT id, name, category, level
       FROM skills
       WHERE user_id = (
         SELECT id FROM users WHERE slug = $1
       )
       ORDER BY sort_order ASC, name ASC`,
        [slug]
    );

    // 6. Récupérer les projets
    const projectsResult = await pool.query(
        `SELECT id, title, description, technologies,
              repo_url, demo_url, image_url
       FROM projects
       WHERE user_id = (
         SELECT id FROM users WHERE slug = $1
       )
       ORDER BY sort_order ASC, title ASC`,
        [slug]
    );

    // 7. Regrouper toutes les données du portfolio
    const portfolio = {
      ...profile,
      experiences: experiencesResult.rows,
      education: educationResult.rows,
      skills: skillsResult.rows,
      projects: projectsResult.rows,
    };

    // 8. Enregistrer le résultat dans Redis pendant 5 minutes
    await redis.set(
        cacheKey,
        JSON.stringify(portfolio),
        { EX: CACHE_TTL_SECONDS }
    );

    // 9. Envoyer le portfolio au frontend
    return res.json({
      source: "db",
      ...portfolio,
    });
  } catch (error) {
    console.error("Erreur lors du chargement du portfolio :", error);

    return res.status(500).json({
      error: "Une erreur est survenue lors du chargement du portfolio.",
    });
  }
});