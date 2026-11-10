
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { cookies } from "next/headers";
import prisma from "./prisma";
import bcrypt from "bcrypt";

// Normalize timezone identifiers
function normalizeTimezone(timezone: string): string {
    return timezone === "Asia/Calcutta"
        ? "Asia/Kolkata"
        : timezone;
}

// Validate timezone
function isValidTimezone(timezone: string): boolean {
    try {
        new Intl.DateTimeFormat("en-US", {
            timeZone: timezone,
        });
        return true;
    } catch {
        return false;
    }
}

// Read browser timezone from the existing cookie
async function getBrowserTimezone(): Promise<string | null> {
    try {
        const cookieStore = await cookies();

        const rawTimezone = cookieStore.get(
            "habitflow-timezone"
        )?.value;

        if (!rawTimezone) return null;

        let timezone = rawTimezone;

        try {
            timezone = decodeURIComponent(rawTimezone);
        } catch {
            return null;
        }

        timezone = normalizeTimezone(timezone);

        return isValidTimezone(timezone) ? timezone : null;
    } catch (error) {
        console.error("Unable to read timezone cookie:", error);
        return null;
    }
}

export const NEXT_AUTH: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),

    session: {
        strategy: "jwt",
    },

    providers: [
        // EMAIL AND PASSWORD AUTHENTICATION
        CredentialsProvider({
            name: "Credentials",

            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                    placeholder: "Email",
                },
                password: {
                    label: "Password",
                    type: "password",
                    placeholder: "Password",
                },
            },

            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    throw new Error("MISSING_FIELDS");
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email,
                    },
                });

                if (!user || !user.passwordHash) {
                    throw new Error("USER_NOT_FOUND");
                }

                const isValid = await bcrypt.compare(
                    credentials.password,
                    user.passwordHash
                );

                if (!isValid) {
                    throw new Error("INVALID_CREDENTIALS");
                }

                const timezone = normalizeTimezone(user.timezone);

                if (timezone !== user.timezone) {
                    await prisma.user.update({
                        where: {
                            id: user.id,
                        },
                        data: {
                            timezone,
                        },
                    });
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    timezone,
                };
            },
        }),

        // GOOGLE AUTHENTICATION
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],

    secret: process.env.NEXTAUTH_SECRET,

    callbacks: {
        // HANDLE EXISTING GOOGLE USERS
        async signIn({ user, account }) {
            if (account?.provider !== "google" || !user.email) {
                return true;
            }

            try {
                const timezone = await getBrowserTimezone();

                if (!timezone) {
                    console.log("No valid browser timezone cookie found.");
                    return true;
                }

                const existingUser = await prisma.user.findUnique({
                    where: {
                        email: user.email,
                    },
                    select: {
                        id: true,
                        timezone: true,
                    },
                });

                if (existingUser?.timezone === "UTC") {
                    await prisma.user.update({
                        where: {
                            id: existingUser.id,
                        },
                        data: {
                            timezone,
                        },
                    });

                    console.log(
                        "Existing Google user timezone updated:",
                        timezone
                    );
                }
            } catch (error) {
                console.error(
                    "Google timezone update failed:",
                    error
                );
            }

            return true;
        },

        // JWT CALLBACK
        async jwt({ token, user, trigger }) {
            if (user?.id) {
                const userId = user.id as string;

                const dbUser = await prisma.user.findUnique({
                    where: {
                        id: userId,
                    },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        timezone: true,
                    },
                });

                if (dbUser) {
                    token.id = dbUser.id;
                    token.name = dbUser.name ?? user.name ?? undefined;
                    token.email = dbUser.email ?? user.email ?? undefined;
                    token.timezone = normalizeTimezone(
                        dbUser.timezone || "UTC"
                    );
                }
            }

            if (trigger === "update" && token.id) {
                const updatedUser = await prisma.user.findUnique({
                    where: {
                        id: token.id as string,
                    },
                    select: {
                        name: true,
                        timezone: true,
                    },
                });

                if (updatedUser) {
                    token.name = updatedUser.name ?? undefined;
                    token.timezone = normalizeTimezone(
                        updatedUser.timezone || "UTC"
                    );
                }
            }

            return token;
        },

        // SESSION CALLBACK
        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string;
                session.user.name = token.name ?? undefined;
                session.user.email = token.email ?? undefined;
                session.user.timezone =
                    (token.timezone as string) || "UTC";
            }

            return session;
        },
    },

    // HANDLE NEW GOOGLE USERS
    events: {
        async createUser({ user }) {
            try {
                const baseUsername =
                    user.email?.split("@")[0] || "user";

                const randomSuffix = Math.floor(Math.random() * 1000);
                const parts = user.name?.split(" ") || [];

                // This event runs when Prisma creates a new OAuth user.
                const timezone = await getBrowserTimezone();

                await prisma.user.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        name: `${baseUsername}${randomSuffix}`,
                        firstName: parts[0] || null,
                        lastName: parts.slice(1).join(" ") || null,
                        ...(timezone ? { timezone } : {}),
                    },
                });

                if (timezone) {
                    console.log(
                        "New Google user timezone saved:",
                        timezone
                    );
                }
            } catch (error) {
                console.error(
                    "Google user initialization failed:",
                    error
                );
            }
        },
    },

    pages: {
        signIn: "/login",
    },
};
