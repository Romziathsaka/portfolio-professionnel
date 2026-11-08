import { useEffect, useState } from "react";
import { Routes, Route, Link, useParams } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type Health = {
    status: string;
    postgres?: string;
    redis?: string;
};

type Experience = {
    id: number;
    position: string;
    company: string;
    start_date: string;
    end_date: string | null;
    description: string | null;
};

type Education = {
    id: number;
    degree: string;
    school: string;
    start_date: string;
    end_date: string | null;
    description: string | null;
};

type Skill = {
    id: number;
    name: string;
    category: string | null;
    level: number | null;
};

type Project = {
    id: number;
    title: string;
    description: string | null;
    technologies: string[] | null;
    repo_url: string | null;
    demo_url: string | null;
    image_url: string | null;
};

type Portfolio = {
    slug: string;
    full_name: string | null;
    headline: string | null;
    bio: string | null;
    phone?: string | null;
    city?: string | null;
    linkedin_url?: string | null;
    github_url?: string | null;
    website_url?: string | null;
    photo_url?: string | null;
    experiences: Experience[];
    education: Education[];
    skills: Skill[];
    projects: Project[];
    source?: string;
};

const homeButtonStyle = {
    display: "inline-block",
    padding: "12px 20px",
    backgroundColor: "#173b6c",
    color: "white",
    textDecoration: "none",
    borderRadius: "8px",
};

function Home() {
    const [health, setHealth] = useState<Health | null>(null);

    useEffect(() => {
        fetch(`${API_URL}/api/health`)
            .then((response) => response.json())
            .then(setHealth)
            .catch(() => setHealth({ status: "error" }));
    }, []);

    return (
        <main
            style={{
                fontFamily: "Arial, sans-serif",
                maxWidth: "900px",
                margin: "60px auto",
                padding: "20px",
            }}
        >
            <h1>Portfolio professionnel</h1>

            <p>
                Présentez votre parcours, vos compétences et vos projets
                professionnels.
            </p>

            <div style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
                <Link to="/login" style={homeButtonStyle}>
                    Se connecter
                </Link>

                <Link to="/register" style={homeButtonStyle}>
                    Créer un compte
                </Link>
            </div>

            <h2>État des services</h2>

            <pre>{JSON.stringify(health, null, 2)}</pre>

            <Link
                to="/p/demo-etudiant"
                style={{
                    display: "inline-block",
                    padding: "12px 20px",
                    backgroundColor: "#173b6c",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "8px",
                    marginTop: "15px",
                }}
            >
                Voir le portfolio de démonstration
            </Link>
        </main>
    );
}

function PublicPortfolio() {
    const { slug } = useParams<{ slug: string }>();

    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!slug) {
            setError("Adresse du portfolio invalide.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");
        setPortfolio(null);

        fetch(`${API_URL}/api/public/${encodeURIComponent(slug)}`)
            .then(async (response) => {
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.error || "Impossible de récupérer le portfolio."
                    );
                }

                return data as Portfolio;
            })
            .then((data) => {
                setPortfolio(data);
            })
            .catch((err: Error) => {
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [slug]);

    if (loading) {
        return (
            <main style={styles.message}>
                <p>Chargement du portfolio...</p>
            </main>
        );
    }

    if (error || !portfolio) {
        return (
            <main style={styles.message}>
                <h1>Portfolio introuvable</h1>

                <p>
                    {error || "Ce portfolio n'est pas disponible."}
                </p>

                <Link to="/" style={styles.backButton}>
                    Retour à l'accueil
                </Link>
            </main>
        );
    }

    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <Link to="/" style={styles.logo}>
                    MonPortfolio
                </Link>

                <a href="#presentation" style={styles.navLink}>
                    À propos
                </a>
            </header>

            <main>
                <section id="presentation" style={styles.hero}>
                    <div style={styles.heroContent}>
                        <p style={styles.eyebrow}>PORTFOLIO PROFESSIONNEL</p>

                        <h1 style={styles.name}>
                            {portfolio.full_name || "Nom de l'étudiant"}
                        </h1>

                        <h2 style={styles.headline}>
                            {portfolio.headline || "Étudiant en informatique"}
                        </h2>

                        <p style={styles.description}>
                            {portfolio.bio ||
                                "La biographie de cet étudiant sera bientôt disponible."}
                        </p>

                        <a href="#about" style={styles.primaryButton}>
                            Découvrir mon profil
                        </a>
                    </div>

                    <div style={styles.avatar}>
                        {(portfolio.full_name || "E")
                            .trim()
                            .charAt(0)
                            .toUpperCase()}
                    </div>
                </section>

                <section id="about" style={styles.about}>
                    <p style={styles.eyebrow}>MON PARCOURS</p>

                    <h2>À propos de moi</h2>

                    <p style={styles.aboutText}>
                        {portfolio.bio ||
                            "Aucune biographie n'a encore été ajoutée à ce profil."}
                    </p>
                </section>

                <section style={styles.nextSection}>
                    <h2>Mes expériences professionnelles</h2>

                    {portfolio.experiences.length === 0 ? (
                        <p>Aucune expérience professionnelle n'a encore été ajoutée.</p>
                    ) : (
                        portfolio.experiences.map((experience) => (
                            <article key={experience.id} style={styles.card}>
                                <h3>{experience.position}</h3>
                                <p style={styles.cardSubtitle}>{experience.company}</p>
                                <p>
                                    {experience.start_date} — {experience.end_date || "Aujourd'hui"}
                                </p>
                                {experience.description && <p>{experience.description}</p>}
                            </article>
                        ))
                    )}

                    <h2 style={styles.sectionTitle}>Mes formations</h2>

                    {portfolio.education.length === 0 ? (
                        <p>Aucune formation n'a encore été ajoutée.</p>
                    ) : (
                        portfolio.education.map((formation) => (
                            <article key={formation.id} style={styles.card}>
                                <h3>{formation.degree}</h3>
                                <p style={styles.cardSubtitle}>{formation.school}</p>
                                <p>
                                    {formation.start_date} — {formation.end_date || "En cours"}
                                </p>
                                {formation.description && <p>{formation.description}</p>}
                            </article>
                        ))
                    )}

                    <h2 style={styles.sectionTitle}>Mes compétences</h2>

                    {portfolio.skills.length === 0 ? (
                        <p>Aucune compétence n'a encore été ajoutée.</p>
                    ) : (
                        <div style={styles.skillsContainer}>
                            {portfolio.skills.map((skill) => (
                                <div key={skill.id} style={styles.skillBadge}>
                                    <strong>{skill.name}</strong>
                                    {skill.category && <span> — {skill.category}</span>}
                                    {skill.level !== null && <span> ({skill.level}/5)</span>}
                                </div>
                            ))}
                        </div>
                    )}

                    <h2 style={styles.sectionTitle}>Mes projets</h2>

                    {portfolio.projects.length === 0 ? (
                        <p>Aucun projet n'a encore été ajouté.</p>
                    ) : (
                        <div style={styles.projectsGrid}>
                            {portfolio.projects.map((project) => (
                                <article key={project.id} style={styles.card}>
                                    {project.image_url && (
                                        <img
                                            src={project.image_url}
                                            alt={project.title}
                                            style={styles.projectImage}
                                        />
                                    )}

                                    <h3>{project.title}</h3>

                                    {project.description && <p>{project.description}</p>}

                                    {project.technologies && project.technologies.length > 0 && (
                                        <p>
                                            <strong>Technologies :</strong>{" "}
                                            {project.technologies.join(", ")}
                                        </p>
                                    )}

                                    <div style={styles.projectLinks}>
                                        {project.demo_url && (
                                            <a href={project.demo_url} target="_blank" rel="noreferrer">
                                                Voir le projet
                                            </a>
                                        )}

                                        {project.repo_url && (
                                            <a href={project.repo_url} target="_blank" rel="noreferrer">
                                                Code source
                                            </a>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                </section>

            </main>

            <footer style={styles.footer}>
                <p>
                    © {new Date().getFullYear()}{" "}
                    {portfolio.full_name || "Portfolio professionnel"}
                </p>

                <p>Portfolio réalisé avec React et TypeScript.</p>

                <Link to="/" style={styles.footerLink}>
                    Retour à l'accueil
                </Link>
            </footer>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    page: {
        fontFamily: "Arial, sans-serif",
        color: "#172033",
        backgroundColor: "#f7f9fc",
        minHeight: "100vh",
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "22px 8%",
        backgroundColor: "white",
        borderBottom: "1px solid #e5eaf1",
    },

    logo: {
        fontSize: "22px",
        fontWeight: "bold",
        color: "#173b6c",
        textDecoration: "none",
    },

    navLink: {
        color: "#173b6c",
        textDecoration: "none",
        fontWeight: "bold",
    },

    hero: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "40px",
        flexWrap: "wrap",
        padding: "80px 8%",
        backgroundColor: "#eaf1fb",
    },

    heroContent: {
        flex: "1 1 350px",
        maxWidth: "650px",
    },

    eyebrow: {
        color: "#2864a8",
        fontSize: "13px",
        fontWeight: "bold",
        letterSpacing: "2px",
    },

    name: {
        fontSize: "clamp(32px, 5vw, 48px)",
        lineHeight: 1.2,
        margin: "20px 0",
        color: "#142b4d",
    },

    headline: {
        fontSize: "23px",
        fontWeight: "normal",
        color: "#426080",
    },

    description: {
        fontSize: "17px",
        lineHeight: 1.8,
        color: "#46566b",
        whiteSpace: "pre-line",
        overflowWrap: "anywhere",
    },

    primaryButton: {
        display: "inline-block",
        backgroundColor: "#173b6c",
        color: "white",
        textDecoration: "none",
        padding: "14px 22px",
        borderRadius: "8px",
        marginTop: "20px",
        fontWeight: "bold",
    },

    avatar: {
        width: "150px",
        height: "150px",
        borderRadius: "50%",
        backgroundColor: "#173b6c",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "64px",
        fontWeight: "bold",
        flexShrink: 0,
    },

    about: {
        maxWidth: "850px",
        margin: "0 auto",
        padding: "60px 25px",
    },

    aboutText: {
        fontSize: "17px",
        lineHeight: 1.8,
        color: "#46566b",
        whiteSpace: "pre-line",
        overflowWrap: "anywhere",
    },

    nextSection: {
        padding: "50px 8%",
        backgroundColor: "white",
        lineHeight: 1.8,
    },

card: {
    backgroundColor: "white",
    padding: "22px",
    marginTop: "18px",
    marginBottom: "18px",
    borderRadius: "12px",
    border: "1px solid #e5eaf1",
    boxShadow: "0 4px 12px rgba(23, 43, 77, 0.05)",
},

cardSubtitle: {
    color: "#2864a8",
    fontWeight: "bold",
},

sectionTitle: {
    marginTop: "45px",
},

skillsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "20px",
},

skillBadge: {
    backgroundColor: "#eaf1fb",
    color: "#173b6c",
    padding: "10px 15px",
    borderRadius: "20px",
},

projectsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginTop: "20px",
},

projectImage: {
    width: "100%",
    maxHeight: "200px",
    objectFit: "cover",
    borderRadius: "8px",
},

projectLinks: {
    display: "flex",
    flexWrap: "wrap",
    gap: "15px",
    marginTop: "15px",
},



message: {
        fontFamily: "Arial, sans-serif",
        maxWidth: "700px",
        margin: "100px auto",
        padding: "25px",
        textAlign: "center",
        color: "#172033",
    },

    backButton: {
        display: "inline-block",
        padding: "12px 20px",
        backgroundColor: "#173b6c",
        color: "white",
        textDecoration: "none",
        borderRadius: "8px",
        marginTop: "15px",
    },

    footer: {
        padding: "30px 20px",
        textAlign: "center",
        backgroundColor: "#142b4d",
        color: "white",
        lineHeight: 1.8,
    },

    footerLink: {
        color: "white",
    },
};

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/p/:slug" element={<PublicPortfolio />} />
        </Routes>
    );
}