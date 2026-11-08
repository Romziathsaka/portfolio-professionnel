import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export default function Register() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    full_name: fullName,
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Inscription impossible.");
            }

            navigate("/login");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main style={{ maxWidth: "450px", margin: "70px auto", padding: "25px", fontFamily: "Arial" }}>
            <h1>Créer un compte</h1>
            <p>Inscrivez-vous pour créer votre portfolio professionnel.</p>

            <form onSubmit={handleRegister}>
                <div style={{ marginBottom: "15px" }}>
                    <label>Nom complet</label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        style={inputStyle}
                    />
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <label>Adresse courriel</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={inputStyle}
                    />
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <label>Mot de passe (8 caractères minimum)</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={8}
                        required
                        style={inputStyle}
                    />
                </div>

                {error && <p style={{ color: "red" }}>{error}</p>}

                <button type="submit" disabled={loading} style={buttonStyle}>
                    {loading ? "Inscription..." : "Créer mon compte"}
                </button>
            </form>

            <p>
                Déjà un compte ? <Link to="/login">Se connecter</Link>
            </p>

            <Link to="/">Retour à l'accueil</Link>
        </main>
    );
}

const inputStyle = {
    display: "block",
    width: "100%",
    padding: "10px",
    marginTop: "7px",
    boxSizing: "border-box" as const,
};

const buttonStyle = {
    padding: "12px 20px",
    backgroundColor: "#173b6c",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
};