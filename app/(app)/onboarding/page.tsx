
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Target,
  CalendarDays,
  Bell,
  BarChart3,
  Tags,
  Sparkles,
} from "lucide-react";

const steps = [
  {
    icon: Target,
    title: "Create your first habit",
    description:
      "Open Habits and create a habit with a clear title, description, frequency, daily target, icon, and color.",
    href: "/habits",
    action: "Create a Habit",
  },
  {
    icon: Tags,
    title: "Organize your habits",
    description:
      "Assign categories such as Health, Fitness, and Productivity. Use the category filters to find habits and edit a habit to change its category.",
    href: "/habits",
    action: "Manage Categories",
  },
  {
    icon: CalendarDays,
    title: "Track your progress",
    description:
      "Mark your habits as completed and use the calendar to review your consistency and activity over time.",
    href: "/calendar",
    action: "Open Calendar",
  },
  {
    icon: Bell,
    title: "Set reminders",
    description:
      "Create reminders for important routines so you can remember when it is time to work on your habits.",
    href: "/reminder",
    action: "Manage Reminders",
  },
  {
    icon: BarChart3,
    title: "Review your analytics",
    description:
      "Explore your habit statistics, completion rate, and streaks to understand your progress.",
    href: "/analytics",
    action: "View Analytics",
  },
];

export default function OnboardingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-4 py-8 md:px-6">
      <section className="relative overflow-hidden rounded-2xl border bg-card px-6 py-10 text-center md:px-12">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>

          <p className="text-sm font-semibold tracking-widest text-primary">
            YOUR JOURNEY STARTS HERE
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome to HabitFlow
          </h1>

          <p className="text-sm leading-7 text-muted-foreground sm:text-base">
            Build meaningful routines, stay consistent, and turn small daily
            actions into lasting habits. Here is your guide to getting started.
          </p>

          <Link
            href="/dashboard"
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Explore Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">
            Getting started with HabitFlow
          </h2>
          <p className="text-sm text-muted-foreground">
            Five simple steps to make the most of your habit tracker.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <article
                key={step.title}
                className="group rounded-xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>

                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                    STEP {index + 1}
                  </span>
                </div>

                <h3 className="font-semibold tracking-tight">
                  {step.title}
                </h3>

                <p className="mt-2 min-h-14 text-sm leading-6 text-muted-foreground">
                  {step.description}
                </p>

                <Link
                  href={step.href}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                >
                  {step.action}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border bg-muted/30 px-6 py-8 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-5 w-5 text-primary" />
        </div>

        <h2 className="text-lg font-semibold">
          Small steps. Better habits. Real progress.
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          You do not need to change everything in one day. Start with one habit,
          stay consistent, and let HabitFlow help you track your journey.
        </p>

        <Link
          href="/dashboard"
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          Go to Dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
