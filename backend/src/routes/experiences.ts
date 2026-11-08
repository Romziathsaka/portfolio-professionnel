import { Router } from "express";
import { pool } from "../db.js";

const experiencesRouter = Router();

// CONSULTER LES EXPÉRIENCES
experiencesRouter.get("/", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Vous devez être connecté pour consulter vos expériences.",
            });
        }

        const resultat = await pool.query(
            `SELECT id, position, company, start_date, end_date,
              description, sort_order
       FROM experiences
       WHERE user_id = $1
       ORDER BY sort_order ASC, start_date DESC`,
            [req.session.userId]
        );

        return res.json({
            message: "Expériences récupérées avec succès.",
            experiences: resultat.rows,
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des expériences :", error);

        return res.status(500).json({
            message: "Une erreur est survenue lors de la récupération des expériences.",
        });
    }
});

// AJOUTER UNE EXPÉRIENCE
experiencesRouter.post("/", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Vous devez être connecté pour ajouter une expérience.",
            });
        }

        const {
            position,
            company,
            start_date,
            end_date,
            description,
            sort_order,
        } = req.body;

        if (
            typeof position !== "string" ||
            !position.trim() ||
            typeof company !== "string" ||
            !company.trim() ||
            typeof start_date !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(start_date)
        ) {
            return res.status(400).json({
                message: "Le poste, l'entreprise et une date de début valide sont obligatoires.",
            });
        }

        if (
            end_date !== undefined &&
            end_date !== null &&
            end_date !== "" &&
            (typeof end_date !== "string" ||
                !/^\d{4}-\d{2}-\d{2}$/.test(end_date))
        ) {
            return res.status(400).json({
                message: "La date de fin doit être une date valide ou vide.",
            });
        }

        if (
            description !== undefined &&
            description !== null &&
            typeof description !== "string"
        ) {
            return res.status(400).json({
                message: "La description doit être un texte.",
            });
        }

        const ordre =
            sort_order === undefined ? 0 : Number(sort_order);

        if (!Number.isInteger(ordre)) {
            return res.status(400).json({
                message: "L'ordre de l'expérience doit être un nombre entier.",
            });
        }

        const resultat = await pool.query(
            `INSERT INTO experiences
        (user_id, position, company, start_date, end_date,
         description, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, position, company, start_date, end_date,
                 description, sort_order`,
            [
                req.session.userId,
                position.trim(),
                company.trim(),
                start_date,
                end_date || null,
                description ?? null,
                ordre,
            ]
        );

        return res.status(201).json({
            message: "Expérience ajoutée avec succès.",
            experience: resultat.rows[0],
        });
    } catch (error) {
        console.error("Erreur lors de l'ajout de l'expérience :", error);

        return res.status(500).json({
            message: "Une erreur est survenue lors de l'ajout de l'expérience.",
        });
    }
});

// MODIFIER UNE EXPÉRIENCE
experiencesRouter.put("/:id", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Vous devez être connecté pour modifier une expérience.",
            });
        }

        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "L'identifiant de l'expérience est invalide.",
            });
        }

        const {
            position,
            company,
            start_date,
            end_date,
            description,
            sort_order,
        } = req.body;

        if (
            typeof position !== "string" ||
            !position.trim() ||
            typeof company !== "string" ||
            !company.trim() ||
            typeof start_date !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(start_date)
        ) {
            return res.status(400).json({
                message: "Le poste, l'entreprise et une date de début valide sont obligatoires.",
            });
        }

        if (
            end_date !== undefined &&
            end_date !== null &&
            end_date !== "" &&
            (typeof end_date !== "string" ||
                !/^\d{4}-\d{2}-\d{2}$/.test(end_date))
        ) {
            return res.status(400).json({
                message: "La date de fin doit être une date valide ou vide.",
            });
        }

        if (
            description !== undefined &&
            description !== null &&
            typeof description !== "string"
        ) {
            return res.status(400).json({
                message: "La description doit être un texte.",
            });
        }

        const ordre =
            sort_order === undefined ? 0 : Number(sort_order);

        if (!Number.isInteger(ordre)) {
            return res.status(400).json({
                message: "L'ordre de l'expérience doit être un nombre entier.",
            });
        }

        const resultat = await pool.query(
            `UPDATE experiences
       SET position = $1,
           company = $2,
           start_date = $3,
           end_date = $4,
           description = $5,
           sort_order = $6
       WHERE id = $7 AND user_id = $8
       RETURNING id, position, company, start_date, end_date,
                 description, sort_order`,
            [
                position.trim(),
                company.trim(),
                start_date,
                end_date || null,
                description ?? null,
                ordre,
                id,
                req.session.userId,
            ]
        );

        if (resultat.rows.length === 0) {
            return res.status(404).json({
                message: "Expérience introuvable.",
            });
        }

        return res.json({
            message: "Expérience modifiée avec succès.",
            experience: resultat.rows[0],
        });
    } catch (error) {
        console.error("Erreur lors de la modification de l'expérience :", error);

        return res.status(500).json({
            message: "Une erreur est survenue lors de la modification de l'expérience.",
        });
    }
});

// SUPPRIMER UNE EXPÉRIENCE
experiencesRouter.delete("/:id", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Vous devez être connecté pour supprimer une expérience.",
            });
        }

        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "L'identifiant de l'expérience est invalide.",
            });
        }

        const resultat = await pool.query(
            `DELETE FROM experiences
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
            [id, req.session.userId]
        );

        if (resultat.rows.length === 0) {
            return res.status(404).json({
                message: "Expérience introuvable.",
            });
        }

        return res.json({
            message: "Expérience supprimée avec succès.",
        });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'expérience :", error);

        return res.status(500).json({
            message: "Une erreur est survenue lors de la suppression de l'expérience.",
        });
    }
});

export { experiencesRouter };