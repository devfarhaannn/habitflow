import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Target,
  CalendarDays,
  Bell,
  BarChart3,
  Repeat,
} from "lucide-react";

const steps = [
  {
    icon: Target,
    title: "Create your first habit",
    description:
      "Choose something you want to improve, give your habit a name, and set a frequency that works for you.",
    href: "/habits",
    action: "Explore Habits",
  },
  {
    icon: Repeat,
    title: "Organize your habits",
    description:
      "Use categories such as Health, Fitness, and Productivity to keep your habits organized.",
    href: "/habits",
    action: "Manage Habits",
  },
  {
    icon: CalendarDays,
    title: "Track your progress",
    description:
      "Mark habits as completed and use the calendar to understand your consistency over time.",
    href: "/calendar",
    action: "Open Calendar",
  },
  {
    icon: Bell,
    title: "Set reminders",
    description:
      "Create reminders to help you remember your daily habits and stay consistent.",
    href: "/reminder",
    action: "Set Reminders",
  },
  {
    icon: BarChart3,
    title: "Review your analytics",
    description:
      "Check your completion rate, streaks, and progress to understand how you are improving.",
    href: "/analytics",
    action: "View Analytics",
  },
];

export default function OnboardingPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-4 py-8">
      <section className="space-y-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <CheckCircle2 className="h-7 w-7 text-primary" />
        </div>

        <p className="text-sm font-medium text-primary">
          GETTING STARTED
        </p>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Welcome to HabitFlow
        </h1>

        <p className="mx-auto max-w-2xl text-muted-foreground">
          Build better routines, stay consistent, and track your personal
          growth. Follow this guide to get the most out of HabitFlow.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Go to Dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold">How to use HabitFlow</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Follow these steps to start building better habits.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.title}
                className="rounded-xl border bg-card p-5 transition-colors hover:bg-accent/30"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>

                  <span className="text-sm font-medium text-muted-foreground">
                    STEP {index + 1}
                  </span>
                </div>

                <h3 className="font-semibold">{step.title}</h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {step.description}
                </p>

                <Link
                  href={step.href}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  {step.action}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border bg-muted/30 p-6 text-center">
        <h2 className="text-lg font-semibold">
          Ready to build better habits?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Start small, stay consistent, and celebrate your progress.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Start using HabitFlow
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}