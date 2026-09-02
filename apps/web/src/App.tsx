import { useEffect, useState } from "react";
import type { ApiResponse, HealthStatus } from "@template/types";

export function App() {
    const [health, setHealth] = useState<HealthStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/health")
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json() as Promise<ApiResponse<HealthStatus>>;
            })
            .then((payload) => {
                setHealth(payload.data);
                setLoading(false);
            })
            .catch((err: Error) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    return (
        <main style={{ fontFamily: "sans-serif", padding: "2rem", maxWidth: "600px" }}>
            <h1>Enterprise Monorepo Dashboard</h1>
            <p>Frontend powered by Vite + React consuming shared contracts.</p>

            <section style={{ marginTop: "1.5rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
                <h2>Backend Health Status</h2>
                {loading && <p>Connecting to backend API...</p>}
                {error && <p style={{ color: "red" }}>Error connecting to API: {error}</p>}
                {health && (
                    <ul>
                        <li><strong>Status:</strong> {health.status}</li>
                        <li><strong>Uptime:</strong> {health.uptime.toFixed(1)}s</li>
                        <li><strong>API Version:</strong> {health.version}</li>
                    </ul>
                )}
            </section>
        </main>
    );
}