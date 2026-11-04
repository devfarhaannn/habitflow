
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Code2,
  Database,
  Layers3,
  Rocket,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const documentation = [
  {
    title: "Project Overview",
    description:
      "Understand HabitFlow, its purpose, core capabilities and the problems it solves.",
    href: "/documents/features",
    icon: Sparkles,
    label: "Introduction",
  },
  {
    title: "System Architecture",
    description:
      "Explore the application architecture, system components and how they communicate.",
    href: "/documents/architecture",
    icon: Layers3,
    label: "Architecture",
  },
  {
    title: "Database Schema",
    description:
      "Understand database models, relationships, entities and data organization.",
    href: "/documents/schema",
    icon: Database,
    label: "Database",
  },
  {
    title: "Technology Stack",
    description:
      "Discover the technologies, frameworks and libraries used to build HabitFlow.",
    href: "/documents/stack",
    icon: Code2,
    label: "Technologies",
  },
  {
    title: "Deployment Guide",
    description:
      "Learn how to configure, build and deploy the HabitFlow application.",
    href: "/documents/deployment",
    icon: Rocket,
    label: "Deployment",
  },
  {
    title: "Project Gallery",
    description:
      "Explore the application interface and its important screens.",
    href: "/documents/gallery",
    icon: BookOpen,
    label: "Gallery",
  },
];

const highlights = [
  "Full-stack habit tracking application",
  "Google OAuth authentication",
  "Habit management and progress tracking",
  "Calendar, analytics and reminders",
  "Data export and import",
  "PostgreSQL database with Prisma ORM",
];

export default function DocumentationPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-12 px-5 py-12 md:px-8">

      {/* Header */}
      <section className="space-y-5">
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <BookOpen className="h-4 w-4 text-primary" />
          HABITFLOW / DOCUMENTATION
        </div>

        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Technical Documentation
          </h1>

          <p className="text-base leading-7 text-muted-foreground md:text-lg">
            Explore the engineering behind HabitFlow. This
            documentation covers the project architecture,
            database design, technology stack, features and
            deployment process.
          </p>
        </div>
      </section>

      {/* Project introduction */}
      <section className="rounded-2xl border bg-card p-6 md:p-8">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="h-5 w-5" />
          <h2 className="text-xl font-semibold">
            About HabitFlow
          </h2>
        </div>

        <p className="mt-4 max-w-4xl text-sm leading-7 text-muted-foreground md:text-base">
          HabitFlow is a modern habit tracking application
          designed to help users build consistent routines,
          manage daily activities and understand their progress.
          It combines habit management, reminders, calendar
          tracking and analytics in one application.
        </p>
      </section>

      {/* Documentation navigation */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Explore Documentation
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Select a topic to explore the technical details.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documentation.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                href={item.href}
                className="group flex flex-col rounded-xl border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>

                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>

                <span className="mt-5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {item.label}
                </span>

                <h3 className="mt-2 font-semibold">
                  {item.title}
                </h3>

                <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Main features */}
      <section className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">
              Core Capabilities
            </h2>
          </div>

          <ul className="space-y-3">
            {highlights.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-sm text-muted-foreground"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border bg-muted/30 p-6">
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">
              For Developers
            </h2>
          </div>

          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Whether you are exploring the codebase, learning
            the system design or contributing to the project,
            these documents provide a starting point for
            understanding HabitFlow.
          </p>

          <Link
            href="/documents/stack"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            Explore the technology stack
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t pt-6 text-center text-sm text-muted-foreground">
        HabitFlow Technical Documentation
      </footer>
    </main>
  );
}
