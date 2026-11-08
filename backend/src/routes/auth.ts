import { Router } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db.js";

const authRouter = Router();

// Permet à TypeScript de reconnaître l'identifiant
// de l'utilisateur enregistré dans sa session.
declare module "express-session" {
    interface SessionData {
        userId: number;
    }
}

// INSCRIPTION
authRouter.post("/register", async (req, res) => {
    try {
        const { full_name, email, password } = req.body;

        // Vérifier les informations reçues
        if (!full_name || !email || !password) {
            return res.status(400).json({
                message: "Veuillez remplir tous les champs.",
            });
        }

        if (
            typeof full_name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                message: "Les informations fournies sont invalides.",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Le mot de passe doit contenir au moins 8 caractères.",
            });
        }

        const nom = full_name.trim();
        const courriel = email.trim().toLowerCase();

        if (!nom || !courriel) {
            return res.status(400).json({
                message: "Le nom et le courriel sont obligatoires.",
            });
        }

        // Vérifier si le courriel existe déjà
        const utilisateurExistant = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [courriel]
        );

        if (utilisateurExistant.rows.length > 0) {
            return res.status(409).json({
                message: "Cette adresse courriel est déjà utilisée.",
            });
        }

        // Hacher le mot de passe
        const passwordHash = await bcrypt.hash(password, 12);

        // Créer un identifiant public pour le portfolio
        const baseSlug =
            nom
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "")
                .slice(0, 70) || "portfolio";

        const slug = `${baseSlug}-${Date.now().toString(36)}`;

        // Enregistrer le nouvel utilisateur
        const resultat = await pool.query(
            `INSERT INTO users (email, password_hash, slug, is_public)
       VALUES ($1, $2, $3, FALSE)
       RETURNING id, email, slug`,
            [courriel, passwordHash, slug]
        );

        const utilisateur = resultat.rows[0];

        // Créer le profil associé à l'utilisateur
        await pool.query(
            `INSERT INTO profiles (user_id, full_name)
       VALUES ($1, $2)`,
            [utilisateur.id, nom]
        );

        return res.status(201).json({
            message: "Votre compte a été créé avec succès.",
            user: utilisateur,
        });
    } catch (error) {
        console.error("Erreur lors de l'inscription :", error);

        return res.status(500).json({
            message: "Une erreur est survenue lors de l'inscription.",
        });
    }
});
// VÉRIFIER L'UTILISATEUR CONNECTÉ
authRouter.get("/me", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Vous n'êtes pas connecté.",
            });
        }

        const resultat = await pool.query(
            "SELECT id, email FROM users WHERE id = $1",
            [req.session.userId]
        );

        return res.json({
            user: resultat.rows[0],
        });
    } catch (error) {
        return res.status(500).json({
            message: "Erreur lors de la vérification.",
        });
    }
});

// CONNEXION
authRouter.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Veuillez saisir votre courriel et votre mot de passe.",
            });
        }

        const courriel = email.trim().toLowerCase();

        // Rechercher l'utilisateur
        const resultat = await pool.query(
            `SELECT id, email, password_hash, slug
       FROM users
       WHERE email = $1`,
            [courriel]
        );

        if (resultat.rows.length === 0) {
            return res.status(401).json({
                message: "Courriel ou mot de passe incorrect.",
            });
        }

        const utilisateur = resultat.rows[0];

        // Comparer le mot de passe avec son hachage
        const motDePasseCorrect = await bcrypt.compare(
            password,
            utilisateur.password_hash
        );

        if (!motDePasseCorrect) {
            return res.status(401).json({
                message: "Courriel ou mot de passe incorrect.",
            });
        }

        // Créer une nouvelle session après la connexion
        await new Promise<void>((resolve, reject) => {
            req.session.regenerate((error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });

        req.session.userId = utilisateur.id;

        await new Promise<void>((resolve, reject) => {
            req.session.save((error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });

        return res.json({
            message: "Connexion réussie.",
            user: {
                id: utilisateur.id,
                email: utilisateur.email,
                slug: utilisateur.slug,
            },
        });
    } catch (error) {
        console.error("Erreur lors de la connexion :", error);

        return res.status(500).json({
            message: "Une erreur est survenue lors de la connexion.",
        });
    }
});

// DÉCONNEXION
authRouter.post("/logout", (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error("Erreur lors de la déconnexion :", error);

            return res.status(500).json({
                message: "Impossible de fermer la session.",
            });
        }

        res.clearCookie("portfolio.sid");

        return res.json({
            message: "Déconnexion réussie.",
        });
    });
});

export { authRouter };