
import {
  Database,
  UserRound,
  Repeat,
  Tags,
  CalendarCheck,
  ChartNoAxesCombined,
  Bell,
  KeyRound,
  Link2,
  ShieldCheck,
} from "lucide-react";

const models = [
  {
    name: "User",
    table: "users",
    icon: UserRound,
    description: "Stores user profile information and account preferences.",
    fields: [
      ["id", "String", "Primary key (UUID)"],
      ["name", "String?", "User display name"],
      ["email", "String", "Unique email address"],
      ["firstName", "String?", "First name"],
      ["lastName", "String?", "Last name"],
      ["passwordHash", "String?", "Hashed password"],
      ["image", "String?", "Profile image"],
      ["timezone", "String", "Defaults to UTC"],
      ["createdAt", "DateTime", "Creation timestamp"],
      ["updatedAt", "DateTime", "Last update timestamp"],
    ],
    relations: "Has many habits, categories, completions, daily statistics, reminders, accounts and sessions.",
  },
  {
    name: "Habit",
    table: "habits",
    icon: Repeat,
    description: "Stores the habits created and managed by users.",
    fields: [
      ["id", "String", "Primary key (UUID)"],
      ["userId", "String", "Owner user ID"],
      ["title", "String", "Habit name"],
      ["description", "String?", "Habit description"],
      ["color", "String", "Display color"],
      ["icon", "String", "Habit icon"],
      ["goalType", "HabitFrequency", "Daily, weekly or monthly"],
      ["targetPerDay", "Int", "Daily target"],
      ["streakGoal", "Int?", "Optional streak goal"],
      ["categoryId", "String", "Category reference"],
      ["status", "HabitStatus", "Habit status"],
      ["currentStreak", "Int", "Current streak"],
      ["longestStreak", "Int", "Longest streak"],
      ["totalCompletions", "Int", "Total completions"],
      ["startDate", "DateTime", "Start date"],
      ["endDate", "DateTime?", "Optional end date"],
    ],
    relations: "Belongs to a User and HabitCategory. Has many completions, daily statistics and reminders.",
  },
  {
    name: "HabitCategory",
    table: "HabitCategory",
    icon: Tags,
    description: "Organizes habits into user-specific categories.",
    fields: [
      ["id", "String", "Primary key (UUID)"],
      ["title", "String", "Category name"],
      ["userId", "String", "Owner user ID"],
    ],
    relations: "Belongs to a User and has many Habits.",
  },
  {
    name: "HabitCompletion",
    table: "habit_completions",
    icon: CalendarCheck,
    description: "Records individual habit completion events.",
    fields: [
      ["id", "String", "Primary key (UUID)"],
      ["habitId", "String", "Related habit"],
      ["userId", "String", "Related user"],
      ["date", "DateTime", "Completion date"],
      ["completedAt", "DateTime", "Completion timestamp"],
    ],
    relations: "Belongs to a Habit and User.",
  },
  {
    name: "HabitDailyStat",
    table: "habit_daily_stats",
    icon: ChartNoAxesCombined,
    description: "Stores aggregated daily completion progress.",
    fields: [
      ["id", "String", "Primary key (UUID)"],
      ["habitId", "String", "Related habit"],
      ["userId", "String", "Related user"],
      ["date", "DateTime", "Statistics date"],
      ["completionCount", "Int", "Completed count"],
      ["targetCount", "Int", "Expected target"],
    ],
    relations: "Belongs to a Habit and User. Has a unique constraint on habitId and date.",
  },
  {
    name: "HabitReminder",
    table: "habit_reminders",
    icon: Bell,
    description: "Stores scheduled reminder preferences for habits.",
    fields: [
      ["id", "String", "Primary key (UUID)"],
      ["userId", "String", "Related user"],
      ["habitId", "String", "Related habit"],
      ["time", "DateTime", "Reminder time"],
      ["daysOfWeek", "Int[]", "Selected weekdays"],
      ["enabled", "Boolean", "Reminder enabled state"],
      ["createdAt", "DateTime", "Creation timestamp"],
      ["updatedAt", "DateTime", "Last update timestamp"],
    ],
    relations: "Belongs to a User and Habit.",
  },
  {
    name: "Account",
    table: "Account",
    icon: KeyRound,
    description: "Stores OAuth provider account information for authentication.",
    fields: [
      ["id", "String", "Primary key (CUID)"],
      ["userId", "String", "Related user"],
      ["provider", "String", "Authentication provider"],
      ["providerAccountId", "String", "Provider account ID"],
      ["type", "String", "Account type"],
      ["access_token", "String?", "Optional access token"],
      ["refresh_token", "String?", "Optional refresh token"],
    ],
    relations: "Belongs to a User. Provider and providerAccountId are unique together.",
  },
  {
    name: "Session",
    table: "Session",
    icon: ShieldCheck,
    description: "Stores authentication sessions.",
    fields: [
      ["id", "String", "Primary key (CUID)"],
      ["sessionToken", "String", "Unique session token"],
      ["userId", "String", "Related user"],
      ["expires", "DateTime", "Session expiration"],
    ],
    relations: "Belongs to a User.",
  },
  {
    name: "VerificationToken",
    table: "VerificationToken",
    icon: Link2,
    description: "Stores tokens used for account verification workflows.",
    fields: [
      ["identifier", "String", "Verification identifier"],
      ["token", "String", "Unique verification token"],
      ["expires", "DateTime", "Token expiration"],
    ],
    relations: "Has a compound unique constraint on identifier and token. No User relation is defined in this schema.",
  },
];

const enums = [
  {
    name: "HabitFrequency",
    values: ["DAILY", "WEEKLY", "MONTHLY"],
    description: "Defines how frequently a habit should be performed.",
  },
  {
    name: "HabitStatus",
    values: ["ACTIVE", "INACTIVE", "COMPLETED", "ARCHIVED"],
    description: "Defines the current lifecycle status of a habit.",
  },
];

export default function SchemaPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-10 px-5 py-12 md:px-8">
      <header className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Database className="h-5 w-5" />
          <span className="text-xs font-semibold tracking-widest">
            DATA ARCHITECTURE
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
          Database Schema
        </h1>

        <p className="max-w-3xl text-base leading-7 text-muted-foreground">
          Explore the PostgreSQL database structure used by
          HabitFlow, including its Prisma models, fields,
          relationships, indexes and enums.
        </p>
      </header>

      <section className="rounded-xl border bg-card p-6">
        <h2 className="text-xl font-semibold">Database Overview</h2>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            ["Database", "PostgreSQL"],
            ["ORM", "Prisma"],
            ["Models", "9"],
            ["Enums", "2"],
            ["Primary IDs", "UUID / CUID"],
            ["Relations", "One-to-many"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <h2 className="text-2xl font-semibold">Entity Models</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Nine models defined in the current Prisma schema.
          </p>
        </div>

        <div className="space-y-5">
          {models.map((model, index) => {
            const Icon = model.icon;

            return (
              <article
                key={model.name}
                className="overflow-hidden rounded-xl border bg-card"
              >
                <div className="flex items-start gap-4 border-b p-5">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold">
                        {index + 1}. {model.name}
                      </h3>
                      <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                        {model.table}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {model.description}
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto p-5">
                  <table className="w-full min-w-[480px] text-left text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground">
                        <th className="pb-3 pr-4 font-medium">Field</th>
                        <th className="pb-3 pr-4 font-medium">Type</th>
                        <th className="pb-3 font-medium">Description</th>
                      </tr>
                    </thead>

                    <tbody>
                      {model.fields.map(([field, type, description]) => (
                        <tr key={field} className="border-b last:border-0">
                          <td className="py-3 pr-4 font-mono text-xs">
                            {field}
                          </td>
                          <td className="py-3 pr-4 text-primary">
                            {type}
                          </td>
                          <td className="py-3 text-muted-foreground">
                            {description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="border-t bg-muted/20 px-5 py-4">
                  <p className="text-xs leading-6 text-muted-foreground">
                    <strong className="text-foreground">Relationships:</strong>{" "}
                    {model.relations}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <h2 className="text-2xl font-semibold">Enums</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enumerated values used to control habit frequency and status.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {enums.map((item) => (
            <div key={item.name} className="rounded-xl border bg-card p-5">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {item.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {item.values.map((value) => (
                  <span
                    key={value}
                    className="rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-dashed p-6">
        <h2 className="font-semibold">Data Integrity</h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          The schema uses primary keys, unique constraints,
          foreign-key relationships and indexes to organize
          records and support data integrity. User and habit
          relationships use cascading deletion where explicitly
          configured in the Prisma schema.
        </p>
      </section>
    </main>
  );
}
