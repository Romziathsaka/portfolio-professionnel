import { Router } from "express";
import PDFDocument from "pdfkit";
import { pool } from "../db.js";
import { redis } from "../redis.js";

export const cvRouter = Router();

// Polices compatibles avec les accents français
const FONT_REGULAR = "/usr/share/fonts/dejavu/DejaVuSans.ttf";
const FONT_BOLD = "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf";

// Formater les dates en français
function formaterDate(date: string | Date | null): string {
  if (!date) return "Aujourd'hui";

  let valeur: string;

  if (date instanceof Date) {
    valeur = date.toISOString().substring(0, 10);
  } else {
    valeur = String(date).substring(0, 10);
  }

  const parties = valeur.split("-");

  if (parties.length !== 3) return valeur;

  const annee = Number(parties[0]);
  const mois = Number(parties[1]);

  const dateFormatee = new Date(annee, mois - 1, 1);

  return dateFormatee.toLocaleDateString("fr-CA", {
    month: "long",
    year: "numeric"
  });
}

// Générer le CV
async function genererCV(
    userId: number,
    template: string
): Promise<Buffer> {

  const cle = `cv:v2:${userId}:${template}`;

  const pdfCache = await redis.get(cle);

  if (pdfCache) {
    return Buffer.from(pdfCache, "base64");
  }

  // Récupérer le profil
  const profil = await pool.query(
      `SELECT users.email, profiles.*
     FROM users
     INNER JOIN profiles ON profiles.user_id = users.id
     WHERE users.id = $1`,
      [userId]
  );

  if (profil.rows.length === 0) {
    throw new Error("Profil introuvable.");
  }

  const utilisateur = profil.rows[0];

  // Récupérer les expériences
  const experiences = await pool.query(
      `SELECT * FROM experiences
     WHERE user_id = $1
     ORDER BY sort_order, start_date DESC`,
      [userId]
  );

  // Récupérer les formations
  const formations = await pool.query(
      `SELECT * FROM education
     WHERE user_id = $1
     ORDER BY sort_order, start_date DESC`,
      [userId]
  );

  // Récupérer les compétences
  const competences = await pool.query(
      `SELECT * FROM skills
     WHERE user_id = $1
     ORDER BY sort_order`,
      [userId]
  );

  // Récupérer les projets
  const projets = await pool.query(
      `SELECT * FROM projects
     WHERE user_id = $1
     ORDER BY sort_order`,
      [userId]
  );

  const moderne = template === "modern";

  const couleur = moderne ? "#17365D" : "#222222";
  const couleurTexte = "#333333";
  const couleurSecondaire = "#666666";

  // Créer le document
  const document = new PDFDocument({
    size: "A4",
    margins: {
      top: 45,
      bottom: 45,
      left: 50,
      right: 50,
    },
    bufferPages: true,
  });

  const morceaux: Buffer[] = [];

  const pdf = new Promise<Buffer>((resolve, reject) => {
    document.on("data", (morceau: Buffer) => {
      morceaux.push(morceau);
    });

    document.on("end", () => {
      resolve(Buffer.concat(morceaux));
    });

    document.on("error", reject);
  });

  // En-tête professionnel
  if (moderne) {
    document
        .rect(0, 0, 595.28, 145)
        .fill(couleur);

    document
        .font(FONT_BOLD)
        .fontSize(25)
        .fillColor("#FFFFFF")
        .text(utilisateur.full_name || "Mon CV", 50, 35);

    document
        .font(FONT_REGULAR)
        .fontSize(13)
        .fillColor("#E5EAF0")
        .text(utilisateur.headline || "", 50, 75);

    document
        .fontSize(9)
        .text(
            [
              utilisateur.email,
              utilisateur.phone,
              utilisateur.city,
            ].filter(Boolean).join("  |  "),
            50,
            105
        );

    document.y = 120;

  } else {
    document
        .font(FONT_BOLD)
        .fontSize(25)
        .fillColor(couleur)
        .text(utilisateur.full_name || "Mon CV");

    document
        .moveDown(0.3)
        .font(FONT_REGULAR)
        .fontSize(13)
        .fillColor(couleurSecondaire)
        .text(utilisateur.headline || "");

    document.moveDown(0.5);

    const coordonnees = [
      utilisateur.email,
      utilisateur.phone,
      utilisateur.city,
      utilisateur.linkedin_url,
      utilisateur.github_url,
      utilisateur.website_url,
    ].filter(Boolean);

    document
        .fontSize(9)
        .fillColor(couleurTexte)
        .text(coordonnees.join("  |  "));

    document.moveDown(1);
  }

  // Vérifier l'espace disponible
  function verifierEspace(espace: number) {
    if (document.y + espace > 780) {
      document.addPage();
    }
  }

  // Titre des sections
  function titreSection(titre: string) {
    verifierEspace(45);

    document.moveDown(0.3);

    document
        .font(FONT_BOLD)
        .fontSize(13)
        .fillColor(couleur)
        .text(titre.toUpperCase());

    document
        .moveDown(0.25)
        .strokeColor(couleur)
        .lineWidth(1)
        .moveTo(50, document.y)
        .lineTo(545, document.y)
        .stroke();

    document.moveDown(0.5);
  }

  // Profil
  if (utilisateur.bio) {
    titreSection("Profil");

    document
        .font(FONT_REGULAR)
        .fontSize(10)
        .fillColor(couleurTexte)
        .text(utilisateur.bio, {
          align: "justify",
          lineGap: 3,
        });

    document.moveDown(0.5);
  }

  // Expériences
  if (experiences.rows.length > 0) {
    titreSection("Expériences professionnelles");

    for (const experience of experiences.rows) {
      verifierEspace(65);

      document
          .font(FONT_BOLD)
          .fontSize(11)
          .fillColor(couleur)
          .text(experience.position || "");

      document
          .font(FONT_REGULAR)
          .fontSize(10)
          .fillColor(couleurTexte)
          .text(experience.company || "");

      document
          .fontSize(9)
          .fillColor(couleurSecondaire)
          .text(
              `${formaterDate(experience.start_date)} - ${
                  formaterDate(experience.end_date)
              }`
          );

      if (experience.description) {
        document
            .moveDown(0.2)
            .fontSize(10)
            .fillColor(couleurTexte)
            .text(experience.description, {
              lineGap: 2,
            });
      }

      document.moveDown(0.3);
    }
  }

  // Formations
  if (formations.rows.length > 0) {
    titreSection("Formation");

    for (const formation of formations.rows) {
      verifierEspace(65);

      document
          .font(FONT_BOLD)
          .fontSize(11)
          .fillColor(couleur)
          .text(formation.degree || "");

      document
          .font(FONT_REGULAR)
          .fontSize(10)
          .fillColor(couleurTexte)
          .text(formation.school || "");

      document
          .fontSize(9)
          .fillColor(couleurSecondaire)
          .text(
              `${formaterDate(formation.start_date)} - ${
                  formaterDate(formation.end_date)
              }`
          );

      if (formation.description) {
        document
            .moveDown(0.2)
            .fontSize(10)
            .fillColor(couleurTexte)
            .text(formation.description);
      }

      document.moveDown(0.3);
    }
  }

  // Compétences
  if (competences.rows.length > 0) {
    titreSection("Compétences");

    const listeCompetences = competences.rows
        .map((competence: any) => {
          return competence.category
              ? `${competence.name} (${competence.category})`
              : competence.name;
        });

    verifierEspace(30);

    document
        .font(FONT_REGULAR)
        .fontSize(10)
        .fillColor(couleurTexte)
        .text(listeCompetences.join("  •  "), {
          lineGap: 4,
        });

    document.moveDown(0.5);
  }
  // Langues
  titreSection("Langues");

  document
      .font(FONT_REGULAR)
      .fontSize(10)
      .fillColor(couleurTexte)
      .text("Français : Avancé\nAnglais : Intermédiaire");

  document.moveDown(0.5);

  // Projets
  if (projets.rows.length > 0) {
    titreSection("Projets");

    for (const projet of projets.rows) {
      verifierEspace(60);

      document
          .font(FONT_BOLD)
          .fontSize(11)
          .fillColor(couleur)
          .text(projet.title || "");

      if (projet.description) {
        document
            .font(FONT_REGULAR)
            .fontSize(10)
            .fillColor(couleurTexte)
            .text(projet.description);
      }

      if (projet.technologies && projet.technologies.length > 0) {
        document
            .fontSize(9)
            .fillColor(couleurSecondaire)
            .text(projet.technologies.join(" • "));
      }

      document.moveDown(0.3);
    }
  }

  // Ajouter les numéros de pages
  const pages = document.bufferedPageRange();

  for (let i = 0; i < pages.count; i++) {
    document.switchToPage(pages.start + i);

    document
        .font(FONT_REGULAR)
        .fontSize(8)
        .fillColor("#888888")
        .text(
            `Page ${i + 1} / ${pages.count}`,
            50,
            775,
            {
              width: 495,
              align: "center",
            }
        );
  }

  document.end();

  const resultat = await pdf;

  // Enregistrer le PDF dans Redis
  await redis.set(cle, resultat.toString("base64"), {
    EX: 300,
  });

  return resultat;
}

// Télécharger le CV
cvRouter.get("/download", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        message: "Vous devez être connecté pour télécharger votre CV.",
      });
    }

    const template = String(req.query.template || "classic");

    if (template !== "classic" && template !== "modern") {
      return res.status(400).json({
        message: "Modèle invalide. Choisissez classic ou modern.",
      });
    }

    const pdf = await genererCV(req.session.userId, template);

    const profil = await pool.query(
        "SELECT full_name FROM profiles WHERE user_id = $1",
        [req.session.userId]
    );

    const nom = String(profil.rows[0]?.full_name || "Utilisateur")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "_");

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
        "Content-Disposition",
        `attachment; filename="CV_${nom}.pdf"`
    );

    return res.send(pdf);

  } catch (error) {
    console.error("Erreur lors de la génération du CV :", error);

    return res.status(500).json({
      message: "Une erreur est survenue lors de la génération du CV.",
    });
  }
});

// Aperçu du CV
cvRouter.get("/preview", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        message: "Vous devez être connecté pour consulter votre CV.",
      });
    }

    const template = String(req.query.template || "classic");

    if (template !== "classic" && template !== "modern") {
      return res.status(400).json({
        message: "Modèle invalide. Choisissez classic ou modern.",
      });
    }

    const pdf = await genererCV(req.session.userId, template);

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
        "Content-Disposition",
        'inline; filename="CV_Utilisateur.pdf"'
    );

    return res.send(pdf);

  } catch (error) {
    console.error("Erreur lors de l'aperçu du CV :", error);

    return res.status(500).json({
      message: "Une erreur est survenue lors de l'aperçu du CV.",
    });
  }
});