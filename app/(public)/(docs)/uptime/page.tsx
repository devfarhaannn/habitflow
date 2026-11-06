
"use client";

import { useCallback, useEffect, useState } from "react";
import {
    Activity,
    Clock,
    Database,
    Globe,
    RefreshCw,
    Server,
    ShieldCheck,
} from "lucide-react";

type HealthData = {
    status: "operational" | "degraded";
    services: {
        application: "operational" | "unavailable";
        database: "operational" | "unavailable";
    };
    timestamp: string;
};

function statusColor(status: string) {
    if (status === "operational") return "text-green-600";
    if (status === "unavailable") return "text-red-500";
    return "text-muted-foreground";
}

function StatusIndicator({ status }: { status: string }) {
    return (
        <span className="inline-flex items-center gap-2 text-sm font-medium">
            <span
                className={`h-2.5 w-2.5 rounded-full ${
                    status === "operational"
                        ? "bg-green-500"
                        : status === "unavailable"
                            ? "bg-red-500"
                            : "bg-muted-foreground"
                }`}
            />
            <span className={statusColor(status)}>
                {status === "unknown"
                    ? "Unknown"
                    : status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        </span>
    );
}

export default function UptimePage() {
    const [health, setHealth] = useState<HealthData | null>(null);
    const [responseTime, setResponseTime] = useState<number | null>(null);
    const [lastChecked, setLastChecked] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const checkHealth = useCallback(async () => {
        const start = performance.now();

        try {
            const response = await fetch("/api/health", {
                cache: "no-store",
            });

            if (!response.ok) {
                throw new Error("Health check failed");
            }

            const duration = Math.round(performance.now() - start);
            const data: HealthData = await response.json();

            setHealth(data);
            setResponseTime(duration);
            setLastChecked(new Date().toISOString());
            setError(false);
        } catch (error) {
            console.error("Health check error:", error);
            setError(true);
            setHealth(null);
            setResponseTime(null);
            setLastChecked(new Date().toISOString());
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const initialCheck = window.setTimeout(() => {
            void checkHealth();
        }, 0);

        const interval = window.setInterval(() => {
            void checkHealth();
        }, 60_000);

        return () => {
            window.clearTimeout(initialCheck);
            window.clearInterval(interval);
        };
    }, [checkHealth]);

    const applicationStatus = error
        ? "unavailable"
        : health?.services.application ?? "unknown";

    const databaseStatus = error
        ? "unknown"
        : health?.services.database ?? "unknown";

    const isOperational =
        !error && health?.status === "operational";

    return (
        <main className="mx-auto w-full max-w-6xl space-y-10 px-5 py-12 md:px-8">
            {/* Header */}
            <section className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    <Activity className="h-4 w-4 text-primary" />
                    HABITFLOW / SYSTEM STATUS
                </div>

                <div>
                    <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                        Site Uptime
                    </h1>

                    <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                        Monitor the current availability of HabitFlow
                        and its database connection.
                    </p>
                </div>
            </section>

            {/* Overall Status */}
            <section className="rounded-2xl border bg-card p-6 md:p-8">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-primary/10 p-3">
                            <ShieldCheck className="h-7 w-7 text-primary" />
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Current system status
                            </p>

                            <h2 className="mt-1 text-2xl font-bold">
                                {loading
                                    ? "Checking services..."
                                    : isOperational
                                        ? "All Systems Operational"
                                        : "Service Issue Detected"}
                            </h2>
                        </div>
                    </div>

                    <button
                        onClick={() => void checkHealth()}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                        />
                        Refresh Status
                    </button>
                </div>
            </section>

            {/* Statistics */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border bg-card p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Application
                        </p>
                        <Globe className="h-5 w-5 text-primary" />
                    </div>

                    <div className="mt-5">
                        <StatusIndicator status={applicationStatus} />
                    </div>

                    <p className="mt-2 text-xs text-muted-foreground">
                        Next.js application health
                    </p>
                </div>

                <div className="rounded-xl border bg-card p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Database
                        </p>
                        <Database className="h-5 w-5 text-primary" />
                    </div>

                    <div className="mt-5">
                        <StatusIndicator status={databaseStatus} />
                    </div>

                    <p className="mt-2 text-xs text-muted-foreground">
                        PostgreSQL connectivity
                    </p>
                </div>

                <div className="rounded-xl border bg-card p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Response Time
                        </p>
                        <Server className="h-5 w-5 text-primary" />
                    </div>

                    <p className="mt-5 text-3xl font-bold">
                        {responseTime !== null
                            ? `${responseTime} ms`
                            : "--"}
                    </p>

                    <p className="mt-2 text-xs text-muted-foreground">
                        Latest health-check request
                    </p>
                </div>
            </section>

            {/* Last Checked */}
            <section className="rounded-xl border bg-card p-6">
                <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <h2 className="font-semibold">Monitoring Information</h2>
                </div>

                <div className="mt-5 space-y-4 text-sm">
                    <div className="flex flex-wrap justify-between gap-2">
                        <span className="text-muted-foreground">
                            Last checked
                        </span>
                        <span className="font-medium">
                            {lastChecked
                                ? new Date(lastChecked).toLocaleString()
                                : "Not checked yet"}
                        </span>
                    </div>

                    <div className="flex flex-wrap justify-between gap-2">
                        <span className="text-muted-foreground">
                            Automatic check interval
                        </span>
                        <span className="font-medium">60 seconds</span>
                    </div>

                    <div className="flex flex-wrap justify-between gap-2">
                        <span className="text-muted-foreground">
                            Monitoring method
                        </span>
                        <span className="font-medium">
                            Application health API
                        </span>
                    </div>
                </div>
            </section>

            {/* Historical Monitoring */}
            <section className="rounded-xl border border-dashed p-6 md:p-8">
                <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">
                        Uptime History
                    </h2>
                </div>

                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    Historical uptime percentages, response-time trends
                    and incident reports will be available after
                    production monitoring is connected.
                </p>

                <p className="mt-3 text-xs text-muted-foreground">
                    Historical uptime data is not available yet.
                </p>
            </section>

            {error && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-600">
                    Unable to reach the health-check API. Please check
                    your connection and try again.
                </p>
            )}

            <footer className="border-t pt-6 text-center text-sm text-muted-foreground">
                HabitFlow System Monitoring
            </footer>
        </main>
    );
}
