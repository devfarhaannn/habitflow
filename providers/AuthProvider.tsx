"use client"

import LoadingPage from "@/app/loading";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { authenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authenticated && !loading) {
            router.replace("/login");
        }
    }, [authenticated, loading, router]);

    if (loading) {
        return <LoadingPage />
    }

    if (!authenticated) {
        return null; // prevent rendering children
    }

    return <>
        {children}
    </>
}