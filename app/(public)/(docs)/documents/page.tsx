
import {
  BookOpen,
  CheckCircle2,
  CalendarDays,
  Bell,
  ChartNoAxesCombined,
  Database,
  Settings,
  Users,
  FileSpreadsheet,
} from "lucide-react";

const sections = [
  {
    title: "Getting Started",
    icon: BookOpen,
    description: "Learn the basics of HabitFlow.",
    items: [
      "Sign in to your HabitFlow account.",
      "Explore your Dashboard and habit overview.",
      "Create your first habit.",
      "Choose a category, frequency and target.",
    ],
  },
  {
    title: "Managing Habits",
    icon: CheckCircle2,
    description: "Create and manage your daily routines.",
    items: [
      "Create habits with a name and description.",
      "Organize habits using categories.",
      "Mark habits as completed.",
      "Track current and longest streaks.",
      "Edit, archive or delete habits.",
    ],
  },
  {
    title: "Calendar",
    icon: CalendarDays,
    description: "Review your habit activity over time.",
    items: [
      "Open Calendar to view your habit history.",
      "Review completed activities.",
      "Navigate between dates to inspect progress.",
    ],
  },
  {
    title: "Reminders",
    icon: Bell,
    description: "Manage reminders for your habits.",
    items: [
      "Create a reminder for a selected habit.",
      "Choose a reminder time.",
      "Select the weekdays for the reminder.",
      "Enable, disable, edit or delete reminders.",
    ],
  },
  {
    title: "Analytics",
    icon: ChartNoAxesCombined,
    description: "Understand your habit performance.",
    items: [
      "View habit completion statistics.",
      "Monitor streaks and consistency.",
      "Understand your progress through analytics.",
    ],
  },
  {
    title: "Export and Import Data",
    icon: Database,
    description: "Keep a backup of your habit data.",
    items: [
      "Open Export / Import Data.",
      "Download your account backup as a JSON file.",
      "Keep your backup somewhere safe.",
      "Select a previous JSON backup to restore your data.",
      "Review the import confirmation before proceeding.",
    ],
  },
  {
    title: "Download Reports",
    icon: FileSpreadsheet,
    description: "Export your habit progress into a spreadsheet.",
    items: [
      "Open Download Report.",
      "Review your habit statistics.",
      "Select Download CSV.",
      "Open the file in Excel, Numbers or Google Sheets.",
    ],
  },
  {
    title: "Settings and Community",
    icon: Settings,
    description: "Explore additional application features.",
    items: [
      "Visit Settings to view your account preferences.",
      "Change the application appearance using the theme control.",
      "Visit Community to explore its available features.",
    ],
  },
];

export default function DocumentationPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-5 py-10 md:px-8">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <BookOpen className="h-6 w-6" />
          <span className="text-sm font-semibold">
            HABITFLOW USER GUIDE
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Documentation
        </h1>

        <p className="max-w-2xl text-muted-foreground">
          Everything you need to know about HabitFlow.
          Learn how to manage your habits, build consistent
          routines and track your personal progress.
        </p>
      </header>

      {/* Introduction */}
      <section className="rounded-xl border bg-card p-6">
        <h2 className="text-xl font-semibold">
          Welcome to HabitFlow
        </h2>

        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          HabitFlow is a habit tracking application designed
          to help you build better routines and stay consistent.
          Create habits, monitor your daily activities, manage
          reminders and understand your progress through analytics.
        </p>
      </section>

      {/* Documentation Sections */}
      <section className="space-y-5">
        <div>
          <h2 className="text-2xl font-bold">
            User Guide
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Explore the different features of HabitFlow.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {sections.map((section, index) => {
            const Icon = section.icon;

            return (
              <article
                key={section.title}
                className="rounded-xl border bg-card p-5 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      {index + 1}. {section.title}
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                </div>

                <ul className="mt-5 space-y-3">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm leading-6"
                    >
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      {/* Help */}
      <section className="rounded-xl border border-dashed p-6">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Need Help?</h2>
        </div>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Refer to this documentation whenever you need
          help understanding HabitFlow features.
        </p>
      </section>
    </main>
  );
}
