import { Router } from "express";
import { pool } from "../db.js";

const skillsRouter = Router();

// Afficher les compétences
skillsRouter.get("/", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            message: "Vous devez être connecté pour consulter vos compétences."
        });
    }

    try {
        const result = await pool.query(
            `SELECT id, name, category, level, sort_order
             FROM skills
             WHERE user_id = $1
             ORDER BY sort_order ASC, name ASC`,
            [req.session.userId]
        );

        return res.json({
            message: "Compétences récupérées avec succès.",
            skills: result.rows
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des compétences :", error);
        return res.status(500).json({
            message: "Erreur lors de la récupération des compétences."
        });
    }
});

// Ajouter une compétence
skillsRouter.post("/", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            message: "Vous devez être connecté pour ajouter une compétence."
        });
    }

    const { name, category, level, sort_order } = req.body;

    if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
            message: "Le nom de la compétence est obligatoire."
        });
    }

    if (category !== undefined && category !== null && typeof category !== "string") {
        return res.status(400).json({
            message: "La catégorie doit être un texte."
        });
    }

    if (level !== undefined && level !== null &&
        (!Number.isInteger(level) || level < 1 || level > 5)) {
        return res.status(400).json({
            message: "Le niveau doit être un nombre entre 1 et 5."
        });
    }

    if (sort_order !== undefined && !Number.isInteger(sort_order)) {
        return res.status(400).json({
            message: "L'ordre doit être un nombre entier."
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO skills (user_id, name, category, level, sort_order)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, name, category, level, sort_order`,
            [
                req.session.userId,
                name.trim(),
                category || null,
                level ?? null,
                sort_order ?? 0
            ]
        );

        return res.status(201).json({
            message: "Compétence ajoutée avec succès.",
            skill: result.rows[0]
        });
    } catch (error) {
        console.error("Erreur lors de l'ajout de la compétence :", error);
        return res.status(500).json({
            message: "Erreur lors de l'ajout de la compétence."
        });
    }
});

// Modifier une compétence
skillsRouter.put("/:id", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            message: "Vous devez être connecté pour modifier une compétence."
        });
    }

    const id = Number(req.params.id);
    const { name, category, level, sort_order } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Identifiant de compétence invalide."
        });
    }

    if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
            message: "Le nom de la compétence est obligatoire."
        });
    }

    if (category !== undefined && category !== null && typeof category !== "string") {
        return res.status(400).json({
            message: "La catégorie doit être un texte."
        });
    }

    if (level !== undefined && level !== null &&
        (!Number.isInteger(level) || level < 1 || level > 5)) {
        return res.status(400).json({
            message: "Le niveau doit être un nombre entre 1 et 5."
        });
    }

    if (sort_order !== undefined && !Number.isInteger(sort_order)) {
        return res.status(400).json({
            message: "L'ordre doit être un nombre entier."
        });
    }

    try {
        const result = await pool.query(
            `UPDATE skills
             SET name = $1,
                 category = $2,
                 level = $3,
                 sort_order = $4
             WHERE id = $5 AND user_id = $6
             RETURNING id, name, category, level, sort_order`,
            [
                name.trim(),
                category || null,
                level ?? null,
                sort_order ?? 0,
                id,
                req.session.userId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Compétence introuvable."
            });
        }

        return res.json({
            message: "Compétence modifiée avec succès.",
            skill: result.rows[0]
        });
    } catch (error) {
        console.error("Erreur lors de la modification de la compétence :", error);
        return res.status(500).json({
            message: "Erreur lors de la modification de la compétence."
        });
    }
});

// Supprimer une compétence
skillsRouter.delete("/:id", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            message: "Vous devez être connecté pour supprimer une compétence."
        });
    }

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Identifiant de compétence invalide."
        });
    }

    try {
        const result = await pool.query(
            `DELETE FROM skills
             WHERE id = $1 AND user_id = $2
             RETURNING id`,
            [id, req.session.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Compétence introuvable."
            });
        }

        return res.json({
            message: "Compétence supprimée avec succès."
        });
    } catch (error) {
        console.error("Erreur lors de la suppression de la compétence :", error);
        return res.status(500).json({
            message: "Erreur lors de la suppression de la compétence."
        });
    }
});

export { skillsRouter };