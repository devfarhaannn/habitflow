
import {
  Code2,
  Database,
  Fingerprint,
  Layers3,
  Palette,
  ShieldCheck,
  Wrench,
  BarChart3,
} from "lucide-react";

const technologyGroups = [
  {
    title: "Frontend Development",
    description: "Building the user interface and interactive experiences.",
    icon: Palette,
    technologies: [
      {
        name: "Next.js",
        description: "React framework using the App Router for pages, layouts and server-side capabilities.",
      },
      {
        name: "React",
        description: "Component-based library for building interactive user interfaces.",
      },
      {
        name: "TypeScript",
        description: "Static typing that improves code reliability and maintainability.",
      },
      {
        name: "Tailwind CSS",
        description: "Utility-first CSS framework for responsive application styling.",
      },
      {
        name: "shadcn/ui",
        description: "Reusable interface components built on accessible UI primitives.",
      },
      {
        name: "Lucide React",
        description: "Icon library used throughout the application interface.",
      },
    ],
  },
  {
    title: "Backend and Database",
    description: "Managing application logic and persistent data.",
    icon: Database,
    technologies: [
      {
        name: "PostgreSQL",
        description: "Relational database used to store users, habits, categories and progress records.",
      },
      {
        name: "Prisma ORM 7",
        description: "Type-safe ORM for database models, queries and relationships.",
      },
      {
        name: "Next.js API Routes",
        description: "Application endpoints for handling client requests and server-side operations.",
      },
      {
        name: "node-postgres (pg)",
        description: "PostgreSQL driver used by the application database adapter.",
      },
    ],
  },
  {
    title: "Authentication and Validation",
    description: "Handling user identity and application data validation.",
    icon: ShieldCheck,
    technologies: [
      {
        name: "NextAuth.js",
        description: "Authentication and session management for the application.",
      },
      {
        name: "Prisma Adapter",
        description: "Connects NextAuth authentication records to the Prisma database.",
      },
      {
        name: "bcrypt",
        description: "Password hashing library for credential security.",
      },
      {
        name: "Zod",
        description: "Schema validation library for validating structured data.",
      },
    ],
  },
  {
    title: "UI and Data Visualization",
    description: "Improving interaction, analytics and data presentation.",
    icon: BarChart3,
    technologies: [
      {
        name: "Recharts",
        description: "Charting library for visualizing habit progress and analytics.",
      },
      {
        name: "Framer Motion",
        description: "Animation library for interactive interface transitions.",
      },
      {
        name: "React Hook Form",
        description: "Form state management and form handling.",
      },
      {
        name: "TanStack Table",
        description: "Headless table utilities for structured data interfaces.",
      },
      {
        name: "dnd-kit",
        description: "Drag-and-drop toolkit for interactive sortable interfaces.",
      },
    ],
  },
  {
    title: "Development Tools",
    description: "Supporting development, styling and code quality.",
    icon: Wrench,
    technologies: [
      {
        name: "pnpm",
        description: "Package manager used to install and manage project dependencies.",
      },
      {
        name: "ESLint",
        description: "Static code analysis and linting.",
      },
      {
        name: "PostCSS",
        description: "CSS processing used with the Tailwind CSS setup.",
      },
      {
        name: "TypeScript Compiler",
        description: "Type checking and compilation support.",
      },
    ],
  },
];

const highlights = [
  { label: "Frontend", value: "Next.js + React" },
  { label: "Language", value: "TypeScript" },
  { label: "Database", value: "PostgreSQL" },
  { label: "ORM", value: "Prisma" },
  { label: "Authentication", value: "NextAuth.js" },
  { label: "Package Manager", value: "pnpm" },
];

export default function StackPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-12 px-5 py-12 md:px-8">
      <header className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Code2 className="h-5 w-5" />
          <span className="text-xs font-semibold tracking-widest">
            ENGINEERING
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
          Technology Stack
        </h1>

        <p className="max-w-3xl text-base leading-7 text-muted-foreground">
          Discover the technologies, frameworks and development
          tools used to build HabitFlow. The stack combines a
          modern React frontend, type-safe backend development
          and relational data storage.
        </p>
      </header>

      <section className="rounded-2xl border bg-card p-6 md:p-8">
        <div className="flex items-center gap-2">
          <Layers3 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">
            Stack Overview
          </h2>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
          {highlights.map((item) => (
            <div
              key={item.label}
              className="rounded-lg bg-muted/40 p-4"
            >
              <p className="text-xs text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-2 text-sm font-semibold">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold">
            Technologies Used
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Explore the technologies grouped by their role in HabitFlow.
          </p>
        </div>

        {technologyGroups.map((group) => {
          const Icon = group.icon;

          return (
            <div key={group.title} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Icon className="h-5 w-5 text-primary" />
                </div>

                <div>
                  <h3 className="font-semibold">
                    {group.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {group.description}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.technologies.map((technology) => (
                  <article
                    key={technology.name}
                    className="rounded-xl border bg-card p-5 transition-colors hover:border-primary/40"
                  >
                    <h4 className="font-semibold">
                      {technology.name}
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {technology.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <section className="rounded-xl border border-dashed p-6">
        <div className="flex items-center gap-3">
          <Fingerprint className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">
            Engineering Approach
          </h2>
        </div>

        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          HabitFlow uses TypeScript across its application,
          Prisma for structured database access, reusable
          React components for the interface and PostgreSQL
          for persistent relational data. These technologies
          help keep the codebase organized, maintainable
          and extensible.
        </p>
      </section>
    </main>
  );
}
