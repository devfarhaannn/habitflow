## Habitkit

**Habitkit** is a modern, full‑stack habit tracking app designed to help you build better habits, one day at a time. It provides a focused dashboard, rich analytics, and a clean UI so you can see your progress, stay accountable, and tweak your routines quickly.

---

## Features

- **Dashboard overview**
  - See your key habits, current streaks, longest streaks, and total completions at a glance.
  - Time‑zone–aware stats so “today” always matches your local day.

- **Habit management**
  - Create, organize, and categorize habits (e.g. Health, Learning, Productivity).
  - Color‑coded habits with icons for quick visual scanning.

- **Daily tracking & streaks**
  - Track completions day by day with streaks and completion counts.
  - Deterministic sample dataset for quick demos and testing.

- **Analytics**
  - Historical data for the last 90 days (seeded) to visualize trends.
  - Built to integrate with charts and advanced analytics views.

- **Navigation & UX**
  - App‑wide sidebar with sections for Dashboard, Habits, Analytics, Calendar, Reminders, Community, Settings, and more.
  - Breadcrumb‑based header for clear navigation context.
  - Responsive layout with collapsible sidebar and app header/footer.

- **Authentication & theming**
  - Email/session authentication powered by NextAuth.
  - Dark‑mode first interface using `next-themes`.

- **Developer‑friendly**
  - Prisma schema and seed script for local development data.
  - Type‑safe APIs and forms using Zod and React Hook Form.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript, React 19
- **Styling & UI**
  - Tailwind CSS v4
  - shadcn/ui components
  - Radix UI primitives
  - Lucide React icons
- **State & Forms**
  - React Hook Form
  - Zod for validation
- **Data & Backend**
  - PostgreSQL (via `pg`)
  - Prisma ORM (`@prisma/client`, `prisma`)
  - Timezone utilities with `date-fns` and `date-fns-tz`
- **Auth**
  - NextAuth with Prisma adapter
- **UX Enhancements**
  - `@dnd-kit/*` for drag‑and‑drop interactions
  - `@tanstack/react-table` for interactive tables
  - `recharts` for charts and visualizations
  - `sonner` for toasts/notifications

---

## Getting Started

### Prerequisites

- **Node.js** (LTS recommended)
- **PostgreSQL** database

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/habitkit.git
cd habitkit
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the project root and configure at least:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/habitkit"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
# other provider / auth configs as needed
```

4. **Set up the database & run migrations**

```bash
npx prisma db push
```

5. **Seed sample data (optional but recommended)**

The project includes a Prisma seed script to generate a deterministic dataset (habits, categories, daily stats, and completions).

```bash
npx prisma db seed
```

6. **Run the development server**

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## Scripts

- **`npm run dev`**: Start the Next.js development server.
- **`npm run build`**: Create a production build.
- **`npm start`**: Start the production server.
- **`npm run lint`**: Run ESLint on the codebase.
- **`npx prisma db seed`**: Seed the database using `prisma/seed.ts` (via the `prisma.seed` config).

---

## Project Structure (high level)

- **`app/`**: Next.js App Router entrypoints and layouts.
  - `app/layout.tsx`: Root layout, global providers (session, theme, tooltips, toasts).
  - `app/(app)/layout.tsx`: Auth‑aware app layout with sidebar and header.
- **`components/`**: Reusable UI and layout components.
  - `components/app-layout/`: App header, sidebar, footer, and navigation.
  - `components/ui/`: Design‑system style components (buttons, sidebar, etc.).
- **`prisma/`**: Prisma schema and seed scripts.
- **`public/`**: Static assets and sample data helpers.

---

## Notes

- Habitkit is currently in early development (`version 0.1.0`).
- The UI/UX is optimized for a dark theme and desktop‑first layouts but is being iterated to support more use‑cases over time.


