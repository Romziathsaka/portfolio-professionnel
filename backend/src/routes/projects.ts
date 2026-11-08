import { Router } from "express";
import { pool } from "../db.js";

const projectsRouter = Router();

// Afficher les projets
projectsRouter.get("/", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            message: "Vous devez être connecté pour consulter vos projets."
        });
    }

    try {
        const result = await pool.query(
            `SELECT id, title, description, technologies,
                    repo_url, demo_url, image_url, sort_order
             FROM projects
             WHERE user_id = $1
             ORDER BY sort_order ASC, title ASC`,
            [req.session.userId]
        );

        return res.json({
            message: "Projets récupérés avec succès.",
            projects: result.rows
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des projets :", error);

        return res.status(500).json({
            message: "Erreur lors de la récupération des projets."
        });
    }
});

// Ajouter un projet
projectsRouter.post("/", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            message: "Vous devez être connecté pour ajouter un projet."
        });
    }

    const {
        title,
        description,
        technologies,
        repo_url,
        demo_url,
        image_url,
        sort_order
    } = req.body;

    if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
            message: "Le titre du projet est obligatoire."
        });
    }

    if (description !== undefined && description !== null &&
        typeof description !== "string") {
        return res.status(400).json({
            message: "La description doit être un texte."
        });
    }

    if (technologies !== undefined &&
        (!Array.isArray(technologies) ||
            !technologies.every((tech: unknown) => typeof tech === "string"))) {
        return res.status(400).json({
            message: "Les technologies doivent être une liste de textes."
        });
    }

    if (repo_url !== undefined && repo_url !== null &&
        typeof repo_url !== "string") {
        return res.status(400).json({
            message: "Le lien du dépôt doit être un texte."
        });
    }

    if (demo_url !== undefined && demo_url !== null &&
        typeof demo_url !== "string") {
        return res.status(400).json({
            message: "Le lien de démonstration doit être un texte."
        });
    }

    if (image_url !== undefined && image_url !== null &&
        typeof image_url !== "string") {
        return res.status(400).json({
            message: "Le lien de l'image doit être un texte."
        });
    }

    if (sort_order !== undefined && !Number.isInteger(sort_order)) {
        return res.status(400).json({
            message: "L'ordre doit être un nombre entier."
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO projects
             (user_id, title, description, technologies,
              repo_url, demo_url, image_url, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id, title, description, technologies,
                       repo_url, demo_url, image_url, sort_order`,
            [
                req.session.userId,
                title.trim(),
                description || null,
                technologies ?? [],
                repo_url || null,
                demo_url || null,
                image_url || null,
                sort_order ?? 0
            ]
        );

        return res.status(201).json({
            message: "Projet ajouté avec succès.",
            project: result.rows[0]
        });
    } catch (error) {
        console.error("Erreur lors de l'ajout du projet :", error);

        return res.status(500).json({
            message: "Erreur lors de l'ajout du projet."
        });
    }
});

// Modifier un projet
projectsRouter.put("/:id", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            message: "Vous devez être connecté pour modifier un projet."
        });
    }

    const id = Number(req.params.id);

    const {
        title,
        description,
        technologies,
        repo_url,
        demo_url,
        image_url,
        sort_order
    } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Identifiant de projet invalide."
        });
    }

    if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
            message: "Le titre du projet est obligatoire."
        });
    }

    if (description !== undefined && description !== null &&
        typeof description !== "string") {
        return res.status(400).json({
            message: "La description doit être un texte."
        });
    }

    if (technologies !== undefined &&
        (!Array.isArray(technologies) ||
            !technologies.every((tech: unknown) => typeof tech === "string"))) {
        return res.status(400).json({
            message: "Les technologies doivent être une liste de textes."
        });
    }

    if (repo_url !== undefined && repo_url !== null &&
        typeof repo_url !== "string") {
        return res.status(400).json({
            message: "Le lien du dépôt doit être un texte."
        });
    }

    if (demo_url !== undefined && demo_url !== null &&
        typeof demo_url !== "string") {
        return res.status(400).json({
            message: "Le lien de démonstration doit être un texte."
        });
    }

    if (image_url !== undefined && image_url !== null &&
        typeof image_url !== "string") {
        return res.status(400).json({
            message: "Le lien de l'image doit être un texte."
        });
    }

    if (sort_order !== undefined && !Number.isInteger(sort_order)) {
        return res.status(400).json({
            message: "L'ordre doit être un nombre entier."
        });
    }

    try {
        const result = await pool.query(
            `UPDATE projects
             SET title = $1,
                 description = $2,
                 technologies = $3,
                 repo_url = $4,
                 demo_url = $5,
                 image_url = $6,
                 sort_order = $7
             WHERE id = $8 AND user_id = $9
             RETURNING id, title, description, technologies,
                       repo_url, demo_url, image_url, sort_order`,
            [
                title.trim(),
                description || null,
                technologies ?? [],
                repo_url || null,
                demo_url || null,
                image_url || null,
                sort_order ?? 0,
                id,
                req.session.userId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Projet introuvable."
            });
        }

        return res.json({
            message: "Projet modifié avec succès.",
            project: result.rows[0]
        });
    } catch (error) {
        console.error("Erreur lors de la modification du projet :", error);

        return res.status(500).json({
            message: "Erreur lors de la modification du projet."
        });
    }
});

// Supprimer un projet
projectsRouter.delete("/:id", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            message: "Vous devez être connecté pour supprimer un projet."
        });
    }

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Identifiant de projet invalide."
        });
    }

    try {
        const result = await pool.query(
            `DELETE FROM projects
             WHERE id = $1 AND user_id = $2
             RETURNING id`,
            [id, req.session.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Projet introuvable."
            });
        }

        return res.json({
            message: "Projet supprimé avec succès."
        });
    } catch (error) {
        console.error("Erreur lors de la suppression du projet :", error);

        return res.status(500).json({
            message: "Erreur lors de la suppression du projet."
        });
    }
});

export { projectsRouter };