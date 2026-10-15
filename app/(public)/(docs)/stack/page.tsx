import { LucideProps } from "lucide-react";
import Image from "next/image";

type AppType = {
    name: string;
    description: string;
    icon: string;
}

const apps: AppType[] = [
    {
        name: "Next.js",
        description: "App router based React framework powering the Habit Kit frontend and routing.",
        icon: "/logo/nextjs.svg"
    },
    {
        name: "React",
        description: "Modern component-based UI library used to build interactive habit experiences.",
        icon: "/logo/react.svg"
    },
    {
        name: "TypeScript",
        description: "Type-safe codebase for more reliable development and easier refactoring.",
        icon: "/logo/typescript.svg"
    },
    {
        name: "Tailwind CSS",
        description: "Utility-first styling for a clean, responsive and consistent interface.",
        icon: "/logo/tailwind.svg"
    },
    {
        name: "shadcn/ui",
        description: "Accessible, unstyled component primitives used as the base for Habit Kit’s UI.",
        icon: "/logo/shadcn.svg"
    },
    {
        name: "Prisma",
        description: "Type-safe ORM used to model and access the Habit Kit database.",
        icon: "/logo/prisma.svg"
    },
    {
        name: "PostgreSQL",
        description: "Reliable relational database for storing all habit and user data.",
        icon: "/logo/postgresql.svg"
    },
    {
        name: "NextAuth.js",
        description: "Authentication layer handling secure login and session management.",
        icon: "/logo/nextauth.svg"
    },
    {
        name: "bcrypt",
        description: "Password hashing library used to securely store user credentials.",
        icon: "/logo/bcrypt.svg"
    },
    {
        name: "Recharts",
        description: "Charting library used to visualize habit analytics and progress.",
        icon: "/logo/react.svg"
    },
    {
        name: "Zod",
        description: "Schema validation library ensuring safe and correct data throughout the app.",
        icon: "/logo/zod.svg"
    },
    {
        name: "Vercel",
        description: "Hosting and deployment platform providing fast, global delivery.",
        icon: "/logo/vercel.svg"
    }
];

export default function StackPage() {
    return (
        <section className="py-8 sm:py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                <div className="mb-12 text-center space-y-4">
                    <p className="text-primary text-sm font-medium uppercase">
                        Technology Stack
                    </p>

                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold">
                        Built with modern technologies
                    </h2>

                    <p className="text-muted-foreground text-xl">
                        Our platform is powered by a carefully selected stack designed for performance, scalability, and reliability.
                    </p>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {apps.map((app) => (
                        <IntegrationCard key={app.name} app={app} />
                    ))}
                </div>

            </div>
        </section>
    )
}

function IntegrationCard({ app }: { app: AppType }) {
    return (
        <div className="group flex flex-col gap-6 rounded-xl py-6 hover:bg-muted transition-colors border">

            <div className="px-6 flex flex-col gap-6">

                <div className={`flex size-12 items-center justify-center rounded-lg bg-primary/20`}>
                    <Image src={app.icon} alt={app.name} className="size-7 object-contain" width={12} height={12} />
                </div>

                <div>
                    <h3 className="text-2xl font-medium mb-3.5">{app.name}</h3>
                    <p className="text-muted-foreground">{app.description}</p>
                </div>
            </div>
        </div>
    );
}