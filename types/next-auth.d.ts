// types/next-auth.d.ts
import NextAuth from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {

            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            avatar?: string | null;
            timezone?: string | null;
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        timezone?: string
        name?: string;
        email?: string;
        image?: string;
        avatar?: string;
        timezone?: string;
    }
}