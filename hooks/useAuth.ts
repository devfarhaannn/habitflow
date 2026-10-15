import { AuthError } from "@/types/types";
import { signIn, signOut, useSession } from "next-auth/react";
import { useCallback, useState } from "react";

export function useAuth() {
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<AuthError | null>(null);

    const login = useCallback(
        async (provider: string, email: string, password: string) => {
            const options = {
                redirect: false,
                callbackUrl: "/dashboard",
                email,
                password,
            };
            setError(null);
            try {
                setLoading(true);
                const res = await signIn(provider, options);
                if (res?.error) {
                    switch (res.error) {
                        case "CredentialsSignin":
                            setError("INVALID_CREDENTIALS");
                            break;
                        case "OAuthAccountNotLinked":
                            setError("OAUTH_ACCOUNT_EXISTS");
                            break;
                        case "USER_NOT_FOUND":
                            setError("USER_NOT_FOUND");
                            break;
                        case "INVALID_CREDENTIALS":
                            setError("INVALID_CREDENTIALS");
                            break;
                        case "OAUTH_ACCOUNT_EXISTS":
                            setError("OAUTH_ACCOUNT_EXISTS");
                            break;
                        case "MISSING_FIELDS":
                            setError("MISSING_FIELDS");
                            break;
                        case "UNKNOWN_ERROR":
                            setError("UNKNOWN_ERROR");
                            break;
                        default:
                            setError("UNKNOWN_ERROR");
                    }
                    return false;
                }
                return true;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const register = useCallback(
        async (name: string, email: string, password: string, timezone: string) => {
            setError(null);
            try {
                setLoading(true);
                const res = await fetch(`/api/auth/signup`, {
                    method: "POST",
                    body: JSON.stringify({ name, email, password, timezone }),
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const data = await res.json();

                if (!res.ok) {
                    if (data.code === "USER_EXISTS") {
                        setError("USER_ALREADY_EXISTS");
                    } else if (data.code === "MISSING_FIELDS") {
                        setError("MISSING_FIELDS");
                    }
                    else {
                        setError("UNKNOWN_ERROR");
                    }
                    return false;
                }

                return await login("credentials", email, password);

            } finally {
                setLoading(false);
            }
        },
        [login]
    );

    const logOut = useCallback(
        async () => {
            const options = {
                callbackUrl: "/",
            };
            setError(null);
            try {
                setLoading(true);
                const res = await signOut(options);
                return true;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return {
        user: session?.user ?? null,
        authenticated: !!session?.user,
        loading: status === "loading" || loading,
        error,
        login,
        register,
        logOut
    };
}