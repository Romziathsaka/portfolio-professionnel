import { Router } from "express";
import { pool } from "../db.js";

const educationRouter = Router();

// Afficher les formations
educationRouter.get("/", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            message: "Vous devez être connecté pour consulter vos formations."
        });
    }

    try {
        const result = await pool.query(
            `SELECT id, degree, school, start_date, end_date, description, sort_order
FROM education
WHERE user_id = $1
ORDER BY sort_order ASC, start_date DESC`,
            [req.session.userId]
        );

        return res.json({
            message: "Formations récupérées avec succès.",
            education: result.rows
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des formations :", error);
        return res.status(500).json({
            message: "Erreur lors de la récupération des formations."
        });
    }
});

// Ajouter une formation
educationRouter.post("/", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            message: "Vous devez être connecté pour ajouter une formation."
        });
    }

    const { degree, school, start_date, end_date, description, sort_order } = req.body;

    if (
        typeof degree !== "string" || !degree.trim() ||
        typeof school !== "string" || !school.trim() ||
        typeof start_date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(start_date)
    ) {
        return res.status(400).json({
            message: "Le diplôme, l'établissement et une date de début valide sont obligatoires."
        });
    }

    if (end_date && (typeof end_date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(end_date))) {
        return res.status(400).json({
            message: "La date de fin doit respecter le format AAAA-MM-JJ."
        });
    }

    if (description !== undefined && typeof description !== "string") {
        return res.status(400).json({
            message: "La description doit être un texte."
        });
    }

    if (sort_order !== undefined && !Number.isInteger(sort_order)) {
        return res.status(400).json({
            message: "L'ordre doit être un nombre entier."
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO education
(user_id, degree, school, start_date, end_date, description, sort_order)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id, degree, school, start_date, end_date, description, sort_order`,
            [
                req.session.userId,
                degree.trim(),
                school.trim(),
                start_date,
                end_date || null,
                description || null,
                sort_order ?? 0
            ]
        );

        return res.status(201).json({
            message: "Formation ajoutée avec succès.",
            education: result.rows[0]
        });
    } catch (error) {
        console.error("Erreur lors de l'ajout de la formation :", error);
        return res.status(500).json({
            message: "Erreur lors de l'ajout de la formation."
        });
    }
});

// Modifier une formation
educationRouter.put("/:id", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            message: "Vous devez être connecté pour modifier une formation."
        });
    }

    const id = Number(req.params.id);
    const { degree, school, start_date, end_date, description, sort_order } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "Identifiant de formation invalide." });
    }

    if (
        typeof degree !== "string" || !degree.trim() ||
        typeof school !== "string" || !school.trim() ||
        typeof start_date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(start_date)
    ) {
        return res.status(400).json({
            message: "Le diplôme, l'établissement et une date de début valide sont obligatoires."
        });
    }

    if (end_date && (typeof end_date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(end_date))) {
        return res.status(400).json({
            message: "La date de fin doit respecter le format AAAA-MM-JJ."
        });
    }

    if (description !== undefined && typeof description !== "string") {
        return res.status(400).json({
            message: "La description doit être un texte."
        });
    }

    if (sort_order !== undefined && !Number.isInteger(sort_order)) {
        return res.status(400).json({
            message: "L'ordre doit être un nombre entier."
        });
    }

    try {
        const result = await pool.query(
            `UPDATE education
SET degree = $1,
    school = $2,
    start_date = $3,
    end_date = $4,
    description = $5,
    sort_order = $6
WHERE id = $7 AND user_id = $8
RETURNING id, degree, school, start_date, end_date, description, sort_order`,
            [
                degree.trim(),
                school.trim(),
                start_date,
                end_date || null,
                description || null,
                sort_order ?? 0,
                id,
                req.session.userId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Formation introuvable." });
        }

        return res.json({
            message: "Formation modifiée avec succès.",
            education: result.rows[0]
        });
    } catch (error) {
        console.error("Erreur lors de la modification de la formation :", error);
        return res.status(500).json({
            message: "Erreur lors de la modification de la formation."
        });
    }
});

// Supprimer une formation
educationRouter.delete("/:id", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            message: "Vous devez être connecté pour supprimer une formation."
        });
    }

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "Identifiant de formation invalide." });
    }

    try {
        const result = await pool.query(
            "DELETE FROM education WHERE id = $1 AND user_id = $2 RETURNING id",
            [id, req.session.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Formation introuvable." });
        }

        return res.json({ message: "Formation supprimée avec succès." });
    } catch (error) {
        console.error("Erreur lors de la suppression de la formation :", error);
        return res.status(500).json({
            message: "Erreur lors de la suppression de la formation."
        });
    }
});

export { educationRouter };
