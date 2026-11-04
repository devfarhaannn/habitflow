
import {
  AppWindow,
  ArrowDown,
  ArrowLeftRight,
  Database,
  KeyRound,
  Server,
  ShieldCheck,
  Workflow,
} from "lucide-react";

const layers = [
  {
    title: "Presentation Layer",
    subtitle: "Next.js App Router + React",
    description:
      "Renders the HabitFlow interface, dashboard, habit management, calendar, analytics and reminders.",
    icon: AppWindow,
  },
  {
    title: "Application Layer",
    subtitle: "Next.js API Routes",
    description:
      "Handles application requests, validates incoming data, applies business logic and communicates with the database.",
    icon: Server,
  },
  {
    title: "Authentication Layer",
    subtitle: "NextAuth.js",
    description:
      "Manages authentication, OAuth accounts, sessions and access to user-specific application data.",
    icon: ShieldCheck,
  },
  {
    title: "Data Access Layer",
    subtitle: "Prisma ORM",
    description:
      "Provides type-safe database queries and manages relationships between application models.",
    icon: Workflow,
  },
  {
    title: "Database Layer",
    subtitle: "PostgreSQL",
    description:
      "Stores users, habits, categories, completions, daily statistics, reminders and authentication records.",
    icon: Database,
  },
];

const dataModels = [
  "User",
  "Habit",
  "HabitCategory",
  "HabitCompletion",
  "HabitDailyStat",
  "HabitReminder",
  "Account",
  "Session",
  "VerificationToken",
];

export default function ArchitecturePage() {
  return (
    <main className="mx-auto max-w-6xl space-y-12 px-5 py-12 md:px-8">
      <header className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Workflow className="h-5 w-5" />
          <span className="text-xs font-semibold tracking-widest">
            SYSTEM DESIGN
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
          System Architecture
        </h1>

        <p className="max-w-3xl text-base leading-7 text-muted-foreground">
          An overview of HabitFlow's application architecture,
          system layers, authentication flow and database
          communication.
        </p>
      </header>

      <section className="space-y-5">
        <div>
          <h2 className="text-2xl font-semibold">
            Architecture Overview
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            HabitFlow uses a layered application structure
            built around Next.js, API routes, Prisma and PostgreSQL.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-5 md:p-8">
          <div className="mx-auto max-w-2xl space-y-2">
            {layers.map((layer, index) => {
              const Icon = layer.icon;

              return (
                <div key={layer.title}>
                  <div className="rounded-xl border bg-background p-4 md:p-5">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-semibold">
                          {layer.title}
                        </h3>
                        <p className="mt-1 text-sm font-medium text-primary">
                          {layer.subtitle}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {layer.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {index !== layers.length - 1 && (
                    <div className="flex justify-center py-1">
                      <ArrowDown className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Conceptual application layers — not a deployment topology.
          </p>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-3">
            <KeyRound className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">
              Authentication
            </h2>
          </div>

          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            NextAuth.js handles authentication and session
            management. The Prisma adapter connects authentication
            records to the database. Application endpoints use
            the authenticated user identity to protect personal
            habit data.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-3">
            <ArrowLeftRight className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">
              Data Flow
            </h2>
          </div>

          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            The interface sends requests to Next.js API routes.
            The application processes requests and uses Prisma
            to read or update PostgreSQL records. The resulting
            data is returned to the interface.
          </p>
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <h2 className="text-2xl font-semibold">
            Database Components
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The Prisma schema defines these main models.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {dataModels.map((model) => (
            <div
              key={model}
              className="rounded-lg border bg-card px-4 py-3 text-sm font-medium"
            >
              {model}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-dashed p-6">
        <h2 className="font-semibold">Architecture Summary</h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          HabitFlow separates its user interface, application
          endpoints, authentication, data access and persistent
          storage. This organization makes the application easier
          to maintain and extend as new features are introduced.
        </p>
      </section>
    </main>
  );
}
