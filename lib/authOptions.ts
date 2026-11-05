import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "./prisma";
import bcrypt from "bcrypt";

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
        jwt: async ({ token, user }: any) => {
            if (user) {
                token.id = (user as any).id;
                token.name = user.name;
                token.email = user.email;
                token.timezone = user.timezone
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