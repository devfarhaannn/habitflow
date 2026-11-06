
"use client"

import { motion } from "framer-motion"
import {
    Code,
    FlaskConical,
    Github,
    Rocket,
    Triangle,
    Terminal,
    Database,
    Settings,
    CheckCircle2,
    Server,
    Package,
    Globe,
    ShieldCheck,
} from "lucide-react"

const steps = [
    {
        title: "Develop Features",
        desc: "Build new features or improve existing ones in your local development environment.",
        icon: Code,
    },
    {
        title: "Test & Debug",
        desc: "Run the application locally, fix bugs, and verify that everything works as expected.",
        icon: FlaskConical,
    },
    {
        title: "Commit & Push Code",
        desc: "Save your changes with commits and push them to your GitHub repository.",
        icon: Github,
    },
    {
        title: "Automatic Deployment",
        desc: "Vercel builds and deploys the application when changes are pushed to the connected GitHub repository.",
        icon: Triangle,
    },
]

const prerequisites = [
    {
        title: "Node.js",
        desc: "JavaScript runtime required to run the Next.js application.",
        icon: Terminal,
    },
    {
        title: "pnpm",
        desc: "Package manager used to install and manage project dependencies.",
        icon: Package,
    },
    {
        title: "Git & GitHub",
        desc: "Version control and source-code hosting for the project.",
        icon: Github,
    },
    {
        title: "PostgreSQL",
        desc: "Relational database used to store application data.",
        icon: Database,
    },
]

const environmentVariables = [
    {
        name: "DATABASE_URL",
        desc: "PostgreSQL database connection string.",
    },
    {
        name: "NEXTAUTH_URL",
        desc: "Base URL of the application.",
    },
    {
        name: "NEXTAUTH_SECRET",
        desc: "Secret used by NextAuth.js to secure authentication.",
    },
    {
        name: "GOOGLE_CLIENT_ID",
        desc: "Google OAuth client ID, if Google sign-in is enabled.",
    },
    {
        name: "GOOGLE_CLIENT_SECRET",
        desc: "Google OAuth client secret, if Google sign-in is enabled.",
    },
]

const deploymentChecks = [
    "Connect the GitHub repository to Vercel.",
    "Configure the production environment variables.",
    "Ensure the production PostgreSQL database is accessible.",
    "Configure the Prisma Client generation and build process.",
    "Deploy the application and check the build logs.",
    "Verify authentication, database operations and application routes.",
]

function SectionHeading({
    eyebrow,
    title,
    description,
}: {
    eyebrow: string
    title: string
    description: string
}) {
    return (
        <div className="mb-10">
            <p className="text-sm font-medium uppercase tracking-wider text-primary">
                {eyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                {title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                {description}
            </p>
        </div>
    )
}

function CodeSnippet({ children }: { children: string }) {
    return (
        <pre className="overflow-x-auto rounded-xl border border-border bg-muted/50 p-4 text-sm leading-7">
            <code>{children}</code>
        </pre>
    )
}

export default function DeploymentPage() {
    return (
        <main className="min-h-screen">
            {/* Page Header */}
            <section className="border-b border-border py-16 sm:py-20">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted">
                            <Rocket className="h-7 w-7 text-primary" />
                        </div>

                        <p className="text-sm font-medium uppercase tracking-wider text-primary">
                            Deployment Documentation
                        </p>

                        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                            Build, Deploy & Launch
                        </h1>

                        <p className="mt-5 text-base leading-7 text-muted-foreground">
                            Learn how to set up HabitFlow locally, configure its
                            environment and deploy the application using Vercel.
                        </p>
                    </div>
                </div>
            </section>

            <div className="mx-auto max-w-7xl space-y-24 px-6 py-16">

                {/* Deployment Timeline */}
                <section>
                    <div className="mb-12 text-center">
                        <p className="text-sm font-medium uppercase tracking-wider text-primary">
                            Development Process
                        </p>

                        <h2 className="mt-2 text-3xl font-semibold">
                            Project Deployment Timeline
                        </h2>

                        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
                            From local development to a live application.
                        </p>
                    </div>

                    <div className="relative">
                        <div className="absolute left-6 top-0 h-full w-[2px] overflow-hidden bg-border md:left-0 md:top-7 md:h-[2px] md:w-full">
                            <motion.div
                                className="absolute h-full w-full origin-top bg-primary md:origin-left"
                                initial={{ scaleY: 0, scaleX: 0 }}
                                whileInView={{ scaleY: 1, scaleX: 1 }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                                viewport={{ once: true }}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
                            {steps.map((step) => {
                                const Icon = step.icon

                                return (
                                    <div
                                        key={step.title}
                                        className="relative flex md:block"
                                    >
                                        <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-md dark:text-black md:mx-auto">
                                            <Icon size={20} />
                                        </div>

                                        <div className="ml-6 max-w-sm md:ml-0 md:mt-6 md:text-center">
                                            <h3 className="text-lg font-semibold">
                                                {step.title}
                                            </h3>
                                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                                {step.desc}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </section>

                {/* Prerequisites */}
                <section>
                    <SectionHeading
                        eyebrow="Getting Started"
                        title="Prerequisites"
                        description="Install and configure these tools before running HabitFlow locally."
                    />

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {prerequisites.map((item) => {
                            const Icon = item.icon

                            return (
                                <div
                                    key={item.title}
                                    className="rounded-xl border border-border p-5 transition-colors hover:bg-muted/40"
                                >
                                    <Icon className="mb-4 h-6 w-6 text-primary" />
                                    <h3 className="font-semibold">{item.title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        {item.desc}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </section>

                {/* Local Setup */}
                <section>
                    <SectionHeading
                        eyebrow="Local Development"
                        title="Installation & Setup"
                        description="Follow these steps to download the source code, install dependencies and start HabitFlow on your local machine."
                    />

                    <div className="space-y-7">
                        {[
                            {
                                title: "1. Clone the repository",
                                command: "git clone <your-repository-url>\ncd habitflow",
                                desc: "Download the project from your GitHub repository.",
                            },
                            {
                                title: "2. Install dependencies",
                                command: "pnpm install",
                                desc: "Install all required project packages.",
                            },
                            {
                                title: "3. Configure environment variables",
                                command: "touch .env",
                                desc: "Create your local environment file if it does not already exist, then add the required configuration.",
                            },
                            {
                                title: "4. Generate Prisma Client",
                                command: "pnpm exec prisma generate",
                                desc: "Generate the Prisma Client used to communicate with PostgreSQL.",
                            },
                            {
                                title: "5. Start the development server",
                                command: "pnpm dev",
                                desc: "Run HabitFlow locally and open http://localhost:3000 in your browser.",
                            },
                        ].map((item) => (
                            <div key={item.title} className="space-y-3">
                                <h3 className="font-semibold">{item.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {item.desc}
                                </p>
                                <CodeSnippet>{item.command}</CodeSnippet>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Environment Variables */}
                <section>
                    <SectionHeading
                        eyebrow="Configuration"
                        title="Environment Variables"
                        description="HabitFlow uses environment variables for database connectivity and authentication. Configure these values in your local environment and production hosting settings."
                    />

                    <div className="overflow-hidden rounded-xl border border-border">
                        {environmentVariables.map((item, index) => (
                            <div
                                key={item.name}
                                className={`flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between ${
                                    index !== environmentVariables.length - 1
                                        ? "border-b border-border"
                                        : ""
                                }`}
                            >
                                <code className="text-sm font-semibold text-primary">
                                    {item.name}
                                </code>
                                <p className="text-sm text-muted-foreground sm:max-w-md sm:text-right">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-5 flex gap-3 rounded-xl border border-border bg-muted/30 p-4">
                        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        <p className="text-sm leading-6 text-muted-foreground">
                            Never commit your .env file or expose database credentials,
                            OAuth secrets or authentication secrets in your source code.
                            Only configure Google OAuth variables if that feature is enabled.
                        </p>
                    </div>
                </section>

                {/* Production Build */}
                <section>
                    <SectionHeading
                        eyebrow="Production"
                        title="Build & Run"
                        description="Prepare the application for production and verify that the production build completes successfully."
                    />

                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="rounded-xl border border-border p-5">
                            <div className="mb-4 flex items-center gap-3">
                                <Terminal className="h-5 w-5 text-primary" />
                                <h3 className="font-semibold">Production Build</h3>
                            </div>
                            <CodeSnippet>{"pnpm build"}</CodeSnippet>
                            <p className="mt-3 text-sm text-muted-foreground">
                                Creates an optimized production build of HabitFlow.
                            </p>
                        </div>

                        <div className="rounded-xl border border-border p-5">
                            <div className="mb-4 flex items-center gap-3">
                                <Server className="h-5 w-5 text-primary" />
                                <h3 className="font-semibold">Production Server</h3>
                            </div>
                            <CodeSnippet>{"pnpm start"}</CodeSnippet>
                            <p className="mt-3 text-sm text-muted-foreground">
                                Starts the production server after a successful build.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Vercel Deployment */}
                <section>
                    <SectionHeading
                        eyebrow="Hosting Platform"
                        title="Deploy with Vercel"
                        description="Vercel provides hosting and continuous deployment for Next.js applications. Connect your GitHub repository to deploy HabitFlow."
                    />

                    <div className="rounded-2xl border border-border p-6 sm:p-8">
                        <div className="mb-7 flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted">
                                <Triangle className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Vercel Deployment Workflow</h3>
                                <p className="text-sm text-muted-foreground">
                                    GitHub integration and automated builds
                                </p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            {[
                                "Push your project code to GitHub.",
                                "Import the repository into your Vercel account.",
                                "Configure the project settings and environment variables.",
                                "Ensure the production database connection is configured.",
                                "Deploy the project and review the build logs.",
                                "Test the deployed application and authentication flows.",
                            ].map((item, index) => (
                                <div key={item} className="flex items-start gap-3">
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                                    <p className="text-sm leading-6 text-muted-foreground">
                                        <span className="mr-2 font-semibold text-foreground">
                                            {index + 1}.
                                        </span>
                                        {item}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <a
                                href="https://vercel.com"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                            >
                                <Triangle size={16} />
                                Vercel Platform
                            </a>

                            <a
                                href="https://vercel.com/docs"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                            >
                                <Globe size={16} />
                                Vercel Documentation
                            </a>
                        </div>
                    </div>
                </section>

                {/* Final Checklist */}
                <section>
                    <SectionHeading
                        eyebrow="Final Verification"
                        title="Deployment Checklist"
                        description="Review these items before considering a production deployment complete."
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                        {deploymentChecks.map((item) => (
                            <div
                                key={item}
                                className="flex items-start gap-3 rounded-xl border border-border p-4"
                            >
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                                <p className="text-sm leading-6 text-muted-foreground">
                                    {item}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Footer */}
                <section className="border-t border-border pt-10 text-center">
                    <Settings className="mx-auto mb-4 h-7 w-7 text-primary" />
                    <h2 className="text-xl font-semibold">
                        Ready to Deploy HabitFlow?
                    </h2>
                    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                        Follow the deployment workflow, configure your production
                        environment and make HabitFlow available to users.
                    </p>
                </section>
            </div>
        </main>
    )
}
