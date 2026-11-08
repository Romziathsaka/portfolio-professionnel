
import { Router } from "express";
import { pool } from "../db.js";

const profileRouter = Router();

// Vérifier si l'utilisateur est connecté
profileRouter.get("/me", async (req, res) => {
  try {
    // Vérifier la session
    if (!req.session.userId) {
      return res.status(401).json({
        message: "Vous devez être connecté pour accéder à votre profil.",
      });
    }

    // Récupérer le profil de l'utilisateur connecté
    const resultat = await pool.query(
      `SELECT
users.id,
    users.email,
    users.slug,
    users.is_public,
    profiles.full_name,
    profiles.headline,
    profiles.bio,
    profiles.phone,
    profiles.city,
    profiles.linkedin_url,
    profiles.github_url,
    profiles.website_url,
    profiles.photo_url
FROM users
LEFT JOIN profiles ON profiles.user_id = users.id
WHERE users.id = $1`,
      [req.session.userId]
    );

    if (resultat.rows.length === 0) {
      return res.status(404).json({
        message: "Utilisateur introuvable.",
      });
    }

    return res.json({
      message: "Profil récupéré avec succès.",
      user: resultat.rows[0],
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du profil :", error);

    return res.status(500).json({
      message: "Une erreur est survenue lors de la récupération du profil.",
    });
  }
});

// MODIFIER LE PROFIL
profileRouter.put("/me", async (req, res) => {
  try {
    // Vérifier si l'utilisateur est connecté
    if (!req.session.userId) {
      return res.status(401).json({
        message: "Vous devez être connecté pour modifier votre profil.",
      });
    }

    // Récupérer les informations envoyées
    const {
      full_name,
      headline,
      bio,
      phone,
      city,
      linkedin_url,
      github_url,
      website_url,
      photo_url,
    } = req.body;

    // Vérifier le nom
    if (typeof full_name !== "string" || !full_name.trim()) {
      return res.status(400).json({
        message: "Le nom complet est obligatoire.",
      });
    }

    // Enregistrer les modifications dans la base de données
    const resultat = await pool.query(
      `UPDATE profiles
SET full_name = $1,
    headline = $2,
    bio = $3,
    phone = $4,
    city = $5,
    linkedin_url = $6,
    github_url = $7,
    website_url = $8,
    photo_url = $9
WHERE user_id = $10
RETURNING *`,
      [
        full_name.trim(),
        headline ?? null,
        bio ?? null,
        phone ?? null,
        city ?? null,
        linkedin_url ?? null,
        github_url ?? null,
        website_url ?? null,
        photo_url ?? null,
        req.session.userId,
      ]
    );

    // Vérifier si le profil existe
    if (resultat.rows.length === 0) {
      return res.status(404).json({
        message: "Profil introuvable.",
      });
    }

    return res.json({
      message: "Profil modifié avec succès.",
      profile: resultat.rows[0],
    });
  } catch (error) {
    console.error("Erreur lors de la modification du profil :", error);

    return res.status(500).json({
      message: "Une erreur est survenue lors de la modification du profil.",
    });
  }
});

// MODIFIER LA VISIBILITÉ DU PORTFOLIO
profileRouter.put("/visibility", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        message: "Vous devez être connecté.",
      });
    }

    const { is_public } = req.body;

    if (typeof is_public !== "boolean") {
      return res.status(400).json({
        message: "La visibilité doit être vraie ou fausse.",
      });
    }

    await pool.query(
        "UPDATE users SET is_public = $1 WHERE id = $2",
        [is_public, req.session.userId]
    );

    return res.json({
      message: "Visibilité du portfolio modifiée avec succès.",
      is_public,
    });
  } catch (error) {
    console.error("Erreur lors de la modification de la visibilité :", error);

    return res.status(500).json({
      message: "Impossible de modifier la visibilité.",
    });
  }
});

export { profileRouter };

