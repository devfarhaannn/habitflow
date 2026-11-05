import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "./prisma";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";

export const NEXT_AUTH: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt"
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "Email" },
                password: { label: "Password", type: "password", placeholder: "Password" }
            },
            async authorize(credentials, req) {
                if (!credentials?.email || !credentials.password) {
                    throw new Error("MISSING_FIELDS");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user || !user.passwordHash) {
                    throw new Error("USER_NOT_FOUND");
                }

                const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
                if (!isValid) {
                    throw new Error("INVALID_CREDENTIALS");
                }
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    timezone: user.timezone,
                };
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        signIn: async ({ user, account }) => {
            if (account?.provider === "google" && user.id) {
                const cookieStore = await cookies();
                const timezoneCookie = cookieStore.get("habitflow-timezone");

                if (timezoneCookie?.value) {
                    try {
                        const timezone = decodeURIComponent(timezoneCookie.value);

                        new Intl.DateTimeFormat("en-US", {
                            timeZone: timezone,
                        });

                        await prisma.user.update({
                            where: { id: user.id },
                            data: { timezone },
                        });
                    } catch {
                        console.error("Invalid or unavailable browser timezone.");
                    }

                    cookieStore.delete("habitflow-timezone");
                }
            }

            return true;
        },
        jwt: async ({ token, user, trigger }: any) => {
            if (user?.id) {
                const dbUser = await prisma.user.findUnique({
                    where: {
                        id: user.id
                    },
                    select: {
                        name: true,
                        timezone: true
                    }
                });

                token.id = user.id;
                token.name = dbUser?.name ?? user.name;
                token.email = user.email;
                token.timezone = dbUser?.timezone ?? "UTC";
            }

            if (trigger === "update" && token.id) {
                const updatedUser = await prisma.user.findUnique({
                    where: {
                        id: token.id
                    },
                    select: {
                        name: true,
                        timezone: true
                    }
                });

                if (updatedUser) {
                    token.name = updatedUser.name;
                    token.timezone = updatedUser.timezone;
                }
            }

            return token;
        },
        session: async ({ session, token }: any) => {
            if (session.user && token.id) {
                session.user.id = (token.id) as string;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.timezone = token.timezone as string
            }
            return session;
        }
    },
    events: {
        createUser: async ({ user }) => {
            const basUsername = user.email?.split("@")[0] || "user";
            const randomSuffix = Math.floor(Math.random() * 1000);
            const parts = user.name?.split(" ") || [];

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    name: `${basUsername}${randomSuffix}`,
                    firstName: parts[0] || null,
                    lastName: parts.slice(1).join(" ") || null,
                }
            });
        },
    },
    pages: {
        signIn: "/login",
    }

}