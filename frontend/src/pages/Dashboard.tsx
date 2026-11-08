import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type Profile = {
    email: string;
    slug: string;
    full_name: string;
    headline: string | null;
    bio: string | null;
    city: string | null;
    phone: string | null;
    linkedin_url: string | null;
    github_url: string | null;
    website_url: string | null;
    photo_url: string | null;
    is_public: boolean;
};

type Experience = {
    id: number;
    position: string;
    company: string;
    start_date: string;
    end_date: string | null;
    description: string | null;
    sort_order: number;
};

type Education = {
    id: number;
    degree: string;
    school: string;
    start_date: string;
    end_date: string | null;
    description: string | null;
    sort_order: number;
};

type Skill = {
    id: number;
    name: string;
    category: string | null;
    level: number | null;
    sort_order: number;
};

type Project = {
    id: number;
    title: string;
    description: string | null;
    technologies: string[];
    repo_url: string | null;
    demo_url: string | null;
    image_url: string | null;
    sort_order: number;
};

export default function Dashboard() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [education, setEducation] = useState<Education[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [projectError, setProjectError] = useState("");
    const [showProjectForm, setShowProjectForm] = useState(false);
    const [editingProject, setEditingProject] = useState<number | null>(null);
    const [skillError, setSkillError] = useState("");
    const [showSkillForm, setShowSkillForm] = useState(false);
    const [editingSkill, setEditingSkill] = useState<number | null>(null);
    const [educationError, setEducationError] = useState("");
    const [editingEducation, setEditingEducation] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [experienceError, setExperienceError] = useState("");
    const [showExperienceForm, setShowExperienceForm] = useState(false);
    const [showEducationForm, setShowEducationForm] = useState(false);
    const [editingExperience, setEditingExperience] = useState<number | null>(null);

    const [projectForm, setProjectForm] = useState({
        title: "",
        description: "",
        technologies: "",
        repo_url: "",
        demo_url: "",
        image_url: "",
        sort_order: 0,
    });

    const [skillForm, setSkillForm] = useState({
        name: "",
        category: "",
        level: 1,
        sort_order: 0,
    });

    const [educationForm, setEducationForm] = useState({
        degree: "",
        school: "",
        start_date: "",
        end_date: "",
        description: "",
        sort_order: 0,
    });

    const [experienceForm, setExperienceForm] = useState({
        position: "",
        company: "",
        start_date: "",
        end_date: "",
        description: "",
        sort_order: 0,
    });

    const [form, setForm] = useState({
        full_name: "",
        headline: "",
        bio: "",
        city: "",
        phone: "",
        linkedin_url: "",
        github_url: "",
        website_url: "",
        photo_url: "",
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${API_URL}/api/profile/me`, {
            credentials: "include",
        })
            .then(async (response) => {
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || data.error || "Impossible de charger le profil.");
                }

                return data;
            })
            .then((data) => {
                setProfile(data.user);

                setForm({
                    full_name: data.user.full_name || "",
                    headline: data.user.headline || "",
                    bio: data.user.bio || "",
                    city: data.user.city || "",
                    phone: data.user.phone || "",
                    linkedin_url: data.user.linkedin_url || "",
                    github_url: data.user.github_url || "",
                    website_url: data.user.website_url || "",
                    photo_url: data.user.photo_url || "",
                });
            })
            .catch((err: Error) => {
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
            });

        fetch(`${API_URL}/api/experiences`, {
            credentials: "include",
        })
            .then(async (response) => {
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Impossible de charger les expériences.");
                }

                return data;
            })
            .then((data) => {
                setExperiences(data.experiences);
            })
            .catch((err: Error) => {
                setExperienceError(err.message);
            });

        fetch(`${API_URL}/api/education`, {
            credentials: "include",
        })
            .then(async (response) => {
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Impossible de charger les formations.");
                }

                return data;
            })
            .then((data) => {
                setEducation(data.education);
            })
            .catch((err: Error) => {
                setEducationError(err.message);
            });

        fetch(`${API_URL}/api/skills`, {
            credentials: "include",
        })
            .then(async (response) => {
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Impossible de charger les compétences.");
                }

                return data;
            })
            .then((data) => {
                setSkills(data.skills);
            })
            .catch((err: Error) => {
                setSkillError(err.message);
            });

        fetch(`${API_URL}/api/projects`, {
            credentials: "include",
        })
            .then(async (response) => {
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Impossible de charger les projets.");
                }

                return data;
            })
            .then((data) => {
                setProjects(data.projects);
            })
            .catch((err: Error) => {
                setProjectError(err.message);
            });


    }, []);

    const handleToggleVisibility = async () => {
        if (!profile) return;

        const nouvelleVisibilite = !profile.is_public;

        try {
            const response = await fetch(`${API_URL}/api/profile/visibility`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    is_public: nouvelleVisibilite,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Impossible de modifier la visibilité.");
            }

            setProfile({
                ...profile,
                is_public: nouvelleVisibilite,
            });

            setSuccess(data.message);
            setError("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Une erreur est survenue.");
        }
    };

    async function handleLogout() {
        await fetch(`${API_URL}/api/auth/logout`, {
            method: "POST",
            credentials: "include",
        });

        navigate("/login");
    }

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    }

    async function handleSave(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setError("");
        setSuccess("");
        setSaving(true);

        try {
            const response = await fetch(`${API_URL}/api/profile/me`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Impossible de modifier le profil.");
            }

            setProfile({
                ...profile!,
                ...data.profile,
            });

            setSuccess("Votre profil a été modifié avec succès !");
            setEditing(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Une erreur est survenue.");
        } finally {
            setSaving(false);
        }
    }

    async function handleSaveExperience(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setExperienceError("");

        try {
            const response = await fetch(`${API_URL}/api/experiences${editingExperience ? `/${editingExperience}` : ""}`,{
                method: editingExperience ? "PUT" : "POST",                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(experienceForm),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Impossible d'ajouter l'expérience.");
            }

            if (editingExperience) {
                setExperiences(
                    experiences.map((experience) =>
                        experience.id === editingExperience ? data.experience : experience
                    )
                );
            } else {
                setExperiences([...experiences, data.experience]);
            }
            setEditingExperience(null);

            setExperienceForm({
                position: "",
                company: "",
                start_date: "",
                end_date: "",
                description: "",
                sort_order: 0,
            });

            setShowExperienceForm(false);
        } catch (err) {
            setExperienceError(
                err instanceof Error ? err.message : "Une erreur est survenue."
            );
        }
    }

    async function handleSaveEducation(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setEducationError("");

        try {
            const response = await fetch(
                `${API_URL}/api/education${editingEducation ? `/${editingEducation}` : ""}`,
                {
                    method: editingEducation ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(educationForm),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Impossible d'enregistrer la formation.");
            }

            if (editingEducation) {
                setEducation(
                    education.map((item) =>
                        item.id === editingEducation ? data.education : item
                    )
                );
            } else {
                setEducation([...education, data.education]);
            }

            setEditingEducation(null);

            setEducationForm({
                degree: "",
                school: "",
                start_date: "",
                end_date: "",
                description: "",
                sort_order: 0,
            });

            setShowEducationForm(false);

        } catch (err) {
            setEducationError(
                err instanceof Error ? err.message : "Une erreur est survenue."
            );
        }
    }

    async function handleSaveSkill(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSkillError("");

        try {
            const response = await fetch(
                `${API_URL}/api/skills${editingSkill ? `/${editingSkill}` : ""}`,
                {
                    method: editingSkill ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(skillForm),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Impossible d'enregistrer la compétence.");
            }

            if (editingSkill) {
                setSkills(
                    skills.map((item) =>
                        item.id === editingSkill ? data.skill : item
                    )
                );
            } else {
                setSkills([...skills, data.skill]);
            }

            setEditingSkill(null);
            setSkillForm({
                name: "",
                category: "",
                level: 1,
                sort_order: 0,
            });
            setShowSkillForm(false);

        } catch (err) {
            setSkillError(
                err instanceof Error ? err.message : "Une erreur est survenue."
            );
        }
    }

    async function handleSaveProject(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setProjectError("");

        try {
            const response = await fetch(
                `${API_URL}/api/projects${editingProject ? `/${editingProject}` : ""}`,
                {
                    method: editingProject ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        ...projectForm,
                        technologies: projectForm.technologies
                            .split(",")
                            .map((tech) => tech.trim())
                            .filter((tech) => tech !== ""),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Impossible d'enregistrer le projet.");
            }

            if (editingProject) {
                setProjects(
                    projects.map((item) =>
                        item.id === editingProject ? data.project : item
                    )
                );
            } else {
                setProjects([...projects, data.project]);
            }

            setEditingProject(null);
            setProjectForm({
                title: "",
                description: "",
                technologies: "",
                repo_url: "",
                demo_url: "",
                image_url: "",
                sort_order: 0,
            });
            setShowProjectForm(false);

        } catch (err) {
            setProjectError(
                err instanceof Error ? err.message : "Une erreur est survenue."
            );
        }
    }

    async function handleDeleteProject(id: number) {
        const confirmation = window.confirm(
            "Voulez-vous vraiment supprimer ce projet ?"
        );

        if (!confirmation) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/projects/${id}`, {
                method: "DELETE",
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Impossible de supprimer le projet.");
            }

            setProjects(projects.filter((item) => item.id !== id));

        } catch (err) {
            setProjectError(
                err instanceof Error ? err.message : "Une erreur est survenue."
            );
        }
    }

    async function handleDeleteSkill(id: number) {
        const confirmation = window.confirm(
            "Voulez-vous vraiment supprimer cette compétence ?"
        );

        if (!confirmation) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/skills/${id}`, {
                method: "DELETE",
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Impossible de supprimer la compétence.");
            }

            setSkills(skills.filter((item) => item.id !== id));

        } catch (err) {
            setSkillError(
                err instanceof Error ? err.message : "Une erreur est survenue."
            );
        }
    }

    async function handleDeleteEducation(id: number) {
        const confirmation = window.confirm(
            "Voulez-vous vraiment supprimer cette formation ?"
        );

        if (!confirmation) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/education/${id}`, {
                method: "DELETE",
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Impossible de supprimer la formation.");
            }

            setEducation(
                education.filter((item) => item.id !== id)
            );

        } catch (err) {
            setEducationError(
                err instanceof Error ? err.message : "Une erreur est survenue."
            );
        }
    }

    async function handleDeleteExperience(id: number) {
        const confirmation = window.confirm(
            "Voulez-vous vraiment supprimer cette expérience ?"
        );

        if (!confirmation) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/experiences/${id}`, {
                method: "DELETE",
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Impossible de supprimer l'expérience.");
            }

            setExperiences(experiences.filter((experience) => experience.id !== id));

        } catch (err) {
            setExperienceError(
                err instanceof Error ? err.message : "Une erreur est survenue."
            );
        }
    }

    if (loading) {
        return <p style={styles.message}>Chargement...</p>;
    }

    if (error && !profile) {
        return (
            <main style={styles.message}>
                <h2>Impossible de charger le tableau de bord</h2>
                <p>{error}</p>
                <Link to="/login">Retour à la connexion</Link>
            </main>
        );
    }

    if (!profile) {
        return null;
    }

    return (
        <main style={styles.container}>
            <header style={styles.header}>
                <h1>Mon espace personnel</h1>

                <button onClick={handleLogout} style={styles.logoutButton}>
                    Déconnexion
                </button>
            </header>

            <section style={styles.card}>
                <h2>Bienvenue, {profile.full_name} !</h2>

                <p>Adresse courriel : {profile.email}</p>

                <p>
                    Mon portfolio public :{" "}
                    <Link to={`/p/${profile.slug}`}>
                        Voir mon portfolio
                    </Link>
                </p>

                <p>
                    Visibilité : {profile.is_public ? "Public" : "Privé"}
                </p>

                <button
                    onClick={handleToggleVisibility}
                    style={styles.button}
                >
                    {profile.is_public
                        ? "Rendre mon portfolio privé"
                        : "Rendre mon portfolio public"}
                </button>

                <button
                    onClick={() => {
                        setEditing(!editing);
                        setError("");
                        setSuccess("");
                    }}
                    style={styles.button}
                >
                    {editing ? "Annuler" : "Modifier mon profil"}
                </button>
            </section>

            {success && <p style={styles.success}>{success}</p>}
            {error && <p style={styles.error}>{error}</p>}

            {editing && (
                <section style={styles.card}>
                    <h2>Modifier mon profil</h2>

                    <form onSubmit={handleSave}>
                        <label>Nom complet</label>
                        <input
                            name="full_name"
                            value={form.full_name}
                            onChange={handleChange}
                            required
                            style={styles.input}
                        />

                        <label>Titre professionnel</label>
                        <input
                            name="headline"
                            value={form.headline}
                            onChange={handleChange}
                            style={styles.input}
                        />

                        <label>Présentation</label>
                        <textarea
                            name="bio"
                            value={form.bio}
                            onChange={handleChange}
                            rows={5}
                            style={styles.input}
                        />

                        <label>Ville</label>
                        <input
                            name="city"
                            value={form.city}
                            onChange={handleChange}
                            style={styles.input}
                        />

                        <label>Téléphone</label>
                        <input
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            style={styles.input}
                        />

                        <label>LinkedIn</label>
                        <input
                            name="linkedin_url"
                            value={form.linkedin_url}
                            onChange={handleChange}
                            style={styles.input}
                        />

                        <label>GitHub</label>
                        <input
                            name="github_url"
                            value={form.github_url}
                            onChange={handleChange}
                            style={styles.input}
                        />

                        <label>Site web</label>
                        <input
                            name="website_url"
                            value={form.website_url}
                            onChange={handleChange}
                            style={styles.input}
                        />

                        <label>Photo (lien de l'image)</label>
                        <input
                            name="photo_url"
                            value={form.photo_url}
                            onChange={handleChange}
                            style={styles.input}
                        />

                        <button
                            type="submit"
                            disabled={saving}
                            style={styles.button}
                        >
                            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                        </button>
                    </form>
                </section>
            )}

            <section style={styles.card}>
                <h2>Mes expériences professionnelles</h2>

                <button
                    onClick={() => setShowExperienceForm(!showExperienceForm)}
                    style={styles.button}
                >
                    {showExperienceForm ? "Annuler" : "Ajouter une expérience"}
                </button>

                {experienceError && (
                    <p style={styles.error}>{experienceError}</p>
                )}

                {showExperienceForm && (
                    <form onSubmit={handleSaveExperience}>
                        <label>Poste occupé</label>
                        <input
                            name="position"
                            value={experienceForm.position}
                            onChange={(e) =>
                                setExperienceForm({
                                    ...experienceForm,
                                    position: e.target.value,
                                })
                            }
                            required
                            style={styles.input}
                        />

                        <label>Entreprise</label>
                        <input
                            name="company"
                            value={experienceForm.company}
                            onChange={(e) =>
                                setExperienceForm({
                                    ...experienceForm,
                                    company: e.target.value,
                                })
                            }
                            required
                            style={styles.input}
                        />

                        <label>Date de début</label>
                        <input
                            type="date"
                            name="start_date"
                            value={experienceForm.start_date}
                            onChange={(e) =>
                                setExperienceForm({
                                    ...experienceForm,
                                    start_date: e.target.value,
                                })
                            }
                            required
                            style={styles.input}
                        />

                        <label>Date de fin</label>
                        <input
                            type="date"
                            name="end_date"
                            value={experienceForm.end_date}
                            onChange={(e) =>
                                setExperienceForm({
                                    ...experienceForm,
                                    end_date: e.target.value,
                                })
                            }
                            style={styles.input}
                        />

                        <label>Description</label>
                        <textarea
                            name="description"
                            value={experienceForm.description}
                            onChange={(e) =>
                                setExperienceForm({
                                    ...experienceForm,
                                    description: e.target.value,
                                })
                            }
                            rows={4}
                            style={styles.input}
                        />

                        <button type="submit" style={styles.button}>
                            Enregistrer l'expérience
                        </button>
                    </form>
                )}
            </section>

            <section style={styles.card}>
                <h2>Mes formations</h2>

                <button
                    onClick={() => setShowEducationForm(!showEducationForm)}
                    style={styles.button}
                >
                    {showEducationForm ? "Annuler" : "Ajouter une formation"}
                </button>

                {educationError && (
                    <p style={styles.error}>{educationError}</p>
                )}

                {showEducationForm && (
                    <form onSubmit={handleSaveEducation}>
                        <label>Diplôme ou formation</label>
                        <input
                            name="degree"
                            value={educationForm.degree}
                            onChange={(e) =>
                                setEducationForm({
                                    ...educationForm,
                                    degree: e.target.value,
                                })
                            }
                            required
                            style={styles.input}
                        />

                        <label>Établissement</label>
                        <input
                            name="school"
                            value={educationForm.school}
                            onChange={(e) =>
                                setEducationForm({
                                    ...educationForm,
                                    school: e.target.value,
                                })
                            }
                            required
                            style={styles.input}
                        />

                        <label>Date de début</label>
                        <input
                            type="date"
                            name="start_date"
                            value={educationForm.start_date}
                            onChange={(e) =>
                                setEducationForm({
                                    ...educationForm,
                                    start_date: e.target.value,
                                })
                            }
                            required
                            style={styles.input}
                        />

                        <label>Date de fin</label>
                        <input
                            type="date"
                            name="end_date"
                            value={educationForm.end_date}
                            onChange={(e) =>
                                setEducationForm({
                                    ...educationForm,
                                    end_date: e.target.value,
                                })
                            }
                            style={styles.input}
                        />

                        <label>Description</label>
                        <textarea
                            name="description"
                            value={educationForm.description}
                            onChange={(e) =>
                                setEducationForm({
                                    ...educationForm,
                                    description: e.target.value,
                                })
                            }
                            rows={4}
                            style={styles.input}
                        />

                        <button type="submit" style={styles.button}>
                            Enregistrer la formation
                        </button>
                    </form>
                )}
            </section>

            <section style={styles.card}>
                <h2>Mes compétences</h2>

                <button
                    onClick={() => setShowSkillForm(!showSkillForm)}
                    style={styles.button}
                >
                    {showSkillForm ? "Annuler" : "Ajouter une compétence"}
                </button>

                {skillError && (
                    <p style={styles.error}>{skillError}</p>
                )}

                {showSkillForm && (
                    <form onSubmit={handleSaveSkill}>
                        <label>Nom de la compétence</label>
                        <input
                            value={skillForm.name}
                            onChange={(e) =>
                                setSkillForm({
                                    ...skillForm,
                                    name: e.target.value,
                                })
                            }
                            required
                            style={styles.input}
                        />

                        <label>Catégorie</label>
                        <input
                            value={skillForm.category}
                            onChange={(e) =>
                                setSkillForm({
                                    ...skillForm,
                                    category: e.target.value,
                                })
                            }
                            style={styles.input}
                        />

                        <label>Niveau (de 1 à 5)</label>
                        <select
                            value={skillForm.level}
                            onChange={(e) =>
                                setSkillForm({
                                    ...skillForm,
                                    level: Number(e.target.value),
                                })
                            }
                            style={styles.input}
                        >
                            <option value={1}>1 - Débutant</option>
                            <option value={2}>2 - Élémentaire</option>
                            <option value={3}>3 - Intermédiaire</option>
                            <option value={4}>4 - Avancé</option>
                            <option value={5}>5 - Expert</option>
                        </select>

                        <button type="submit" style={styles.button}>
                            Enregistrer la compétence
                        </button>
                    </form>
                )}


                {skills.length === 0 ? (
                    <p>Aucune compétence enregistrée.</p>
                ) : (
                    skills.map((item) => (
                        <div
                            key={item.id}
                            style={{
                                border: "1px solid #ddd",
                                padding: "15px",
                                marginTop: "15px",
                                borderRadius: "8px",
                            }}
                        >
                            <h3>{item.name}</h3>
                            <p>Catégorie : {item.category || "Non précisée"}</p>
                            <p>Niveau : {item.level || "Non précisé"}/5</p>

                            <button
                                type="button"
                                onClick={() => {
                                    setSkillForm({
                                        name: item.name,
                                        category: item.category || "",
                                        level: item.level || 1,
                                        sort_order: item.sort_order,
                                    });
                                    setEditingSkill(item.id);
                                    setShowSkillForm(true);
                                }}
                            >
                                Modifier
                            </button>

                            <button
                                type="button"
                                onClick={() => handleDeleteSkill(item.id)}
                            >
                                Supprimer
                            </button>
                        </div>
                    ))
                )}
            </section>

            <section style={styles.card}>
                <h2>Mes projets</h2>

                <button
                    onClick={() => setShowProjectForm(!showProjectForm)}
                    style={styles.button}
                >
                    {showProjectForm ? "Annuler" : "Ajouter un projet"}
                </button>

                {projectError && (
                    <p style={styles.error}>{projectError}</p>
                )}

                {showProjectForm && (
                    <form onSubmit={handleSaveProject}>
                        <label>Titre du projet</label>
                        <input
                            value={projectForm.title}
                            onChange={(e) =>
                                setProjectForm({
                                    ...projectForm,
                                    title: e.target.value,
                                })
                            }
                            required
                            style={styles.input}
                        />

                        <label>Description</label>
                        <textarea
                            value={projectForm.description}
                            onChange={(e) =>
                                setProjectForm({
                                    ...projectForm,
                                    description: e.target.value,
                                })
                            }
                            rows={4}
                            style={styles.input}
                        />

                        <label>Technologies (séparées par des virgules)</label>
                        <input
                            value={projectForm.technologies}
                            onChange={(e) =>
                                setProjectForm({
                                    ...projectForm,
                                    technologies: e.target.value,
                                })
                            }
                            placeholder="HTML, CSS, JavaScript"
                            style={styles.input}
                        />

                        <label>Lien GitHub</label>
                        <input
                            type="url"
                            value={projectForm.repo_url}
                            onChange={(e) =>
                                setProjectForm({
                                    ...projectForm,
                                    repo_url: e.target.value,
                                })
                            }
                            style={styles.input}
                        />

                        <label>Lien de démonstration</label>
                        <input
                            type="url"
                            value={projectForm.demo_url}
                            onChange={(e) =>
                                setProjectForm({
                                    ...projectForm,
                                    demo_url: e.target.value,
                                })
                            }
                            style={styles.input}
                        />

                        <label>Lien de l'image</label>
                        <input
                            type="url"
                            value={projectForm.image_url}
                            onChange={(e) =>
                                setProjectForm({
                                    ...projectForm,
                                    image_url: e.target.value,
                                })
                            }
                            style={styles.input}
                        />

                        <button type="submit" style={styles.button}>
                            Enregistrer le projet
                        </button>
                    </form>
                )}

                {projects.length === 0 ? (
                    <p>Aucun projet enregistré.</p>
                ) : (
                    projects.map((item) => (
                        <div
                            key={item.id}
                            style={{
                                border: "1px solid #ddd",
                                padding: "15px",
                                marginTop: "15px",
                                borderRadius: "8px",
                            }}
                        >
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                            <p>Technologies : {item.technologies.join(", ")}</p>

                            {item.repo_url && (
                                <p>
                                    <a href={item.repo_url} target="_blank">
                                        Voir le code GitHub
                                    </a>
                                </p>
                            )}

                            {item.demo_url && (
                                <p>
                                    <a href={item.demo_url} target="_blank">
                                        Voir la démonstration
                                    </a>
                                </p>
                            )}

                            {item.image_url && (
                                <img
                                    src={item.image_url}
                                    alt={item.title}
                                    style={{ maxWidth: "200px" }}
                                />
                            )}

                            <button
                                type="button"
                                onClick={() => {
                                    setProjectForm({
                                        title: item.title,
                                        description: item.description || "",
                                        technologies: item.technologies.join(", "),
                                        repo_url: item.repo_url || "",
                                        demo_url: item.demo_url || "",
                                        image_url: item.image_url || "",
                                        sort_order: item.sort_order,
                                    });
                                    setEditingProject(item.id);
                                    setShowProjectForm(true);
                                }}
                            >
                                Modifier
                            </button>

                            <button
                                type="button"
                                onClick={() => handleDeleteProject(item.id)}
                            >
                                Supprimer
                            </button>
                        </div>
                    ))
                )}
            </section>

            {education.length === 0 ? (
                <p>Aucune formation enregistrée.</p>
            ) : (
                education.map((item) => (
                    <div
                        key={item.id}
                        style={{
                            border: "1px solid #ddd",
                            padding: "15px",
                            marginTop: "15px",
                            borderRadius: "8px",
                        }}
                    >
                        <h3>{item.degree}</h3>

                        <p>{item.school}</p>

                        <p>Début : {item.start_date}</p>

                        <p>Fin : {item.end_date || "En cours"}</p>

                        <p>{item.description}</p>

                        <button
                            type="button"
                            onClick={() => {
                                setEducationForm({
                                    degree: item.degree,
                                    school: item.school,
                                    start_date: item.start_date,
                                    end_date: item.end_date || "",
                                    description: item.description || "",
                                    sort_order: item.sort_order,
                                });

                                setEditingEducation(item.id);
                                setShowEducationForm(true);
                            }}
                        >
                            Modifier
                        </button>

                        <button
                            type="button"
                            onClick={() => handleDeleteEducation(item.id)}
                        >
                            Supprimer
                        </button>
                    </div>
                ))
            )}

            {experiences.length === 0 ? (
                <p>Aucune expérience professionnelle enregistrée.</p>
            ) : (
                experiences.map((experience) => (
                    <div
                        key={experience.id}
                        style={{
                            border: "1px solid #ddd",
                            padding: "15px",
                            marginTop: "15px",
                            borderRadius: "8px",
                        }}
                    >
                        <h3>{experience.position}</h3>

                        <p>{experience.company}</p>

                        <p>
                            Début : {experience.start_date}
                        </p>

                        <p>
                            Fin : {experience.end_date || "En cours"}
                        </p>

                        <p>{experience.description}</p>

                        <button
                            type="button"
                            onClick={() => {
                                setExperienceForm({
                                    position: experience.position,
                                    company: experience.company,
                                    start_date: experience.start_date,
                                    end_date: experience.end_date || "",
                                    description: experience.description || "",
                                    sort_order: experience.sort_order,
                                });

                                setEditingExperience(experience.id);
                                setShowExperienceForm(true);
                            }}
                        >
                            Modifier
                        </button>

                        <button
                            type="button"
                            onClick={() => handleDeleteExperience(experience.id)}
                        >
                            Supprimer
                        </button>
                    </div>
                ))
            )}

            
            <section style={styles.card}>
                <h2>Générer mon CV</h2>

                <p>Choisissez le modèle de CV que vous souhaitez télécharger.</p>

                <a
                    href={`${API_URL}/api/cv/download?template=classic`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        ...styles.button,
                        display: "block",
                        marginBottom: "15px",
                        textAlign: "center"
                    }}
                >
                    Télécharger le CV classique
                </a>

                <a
                    href={`${API_URL}/api/cv/download?template=modern`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        ...styles.button,
                        display: "block",
                        textAlign: "center"
                    }}
                >
                    Télécharger le CV moderne
                </a>
            </section>

            <Link to="/" style={styles.backLink}>
                Retour à l'accueil
            </Link>
        </main>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        fontFamily: "Arial, sans-serif",
        maxWidth: "900px",
        margin: "50px auto",
        padding: "20px",
        color: "#172033",
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "15px",
    },

    card: {
        backgroundColor: "#f7f9fc",
        padding: "25px",
        marginTop: "25px",
        borderRadius: "10px",
        border: "1px solid #e5eaf1",
    },

    logoutButton: {
        padding: "10px 18px",
        backgroundColor: "#173b6c",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
    },

    button: {
        padding: "12px 20px",
        backgroundColor: "#173b6c",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        marginTop: "15px",
    },

    input: {
        display: "block",
        width: "100%",
        padding: "10px",
        marginTop: "7px",
        marginBottom: "18px",
        boxSizing: "border-box",
        border: "1px solid #ccd3df",
        borderRadius: "5px",
        fontFamily: "Arial",
    },

    backLink: {
        display: "inline-block",
        marginTop: "25px",
        color: "#173b6c",
    },

    message: {
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
        margin: "80px auto",
    },

    success: {
        color: "green",
        marginTop: "20px",
    },

    error: {
        color: "red",
        marginTop: "20px",
    },
};