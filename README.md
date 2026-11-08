# HabitFlow – Modern Habit Tracker

**HabitFlow** is a modern, full-stack habit-tracking application designed to help you build better habits, one day at a time. It provides a focused dashboard, habit management, daily tracking, streaks, and analytics so you can monitor your progress and improve your routines.

---

## Features

- **Dashboard Overview**
  - See your habits, current streaks, longest streaks, and total completions.
  - Timezone-aware statistics so daily progress matches your local day.

- **Habit Management**
  - Create, organize, categorize, favorite, reorder, and delete habits.
  - Color-coded habits with icons for quick visual identification.

- **Daily Tracking & Streaks**
  - Track habit completions day by day.
  - Monitor current streaks and completion counts.
  - View habit completion history and daily statistics.

- **Analytics**
  - Visualize habit progress and completion trends.
  - Review historical performance and consistency.

- **Navigation & UX**
  - Sidebar-based application navigation.
  - Dashboard, Habits, Analytics, Calendar, Reminders, and Settings.
  - Responsive interface with dark-mode support.

- **Authentication & Theming**
  - Email and password authentication.
  - Google OAuth sign-in.
  - Account settings for profile, password, and timezone management.

- **Developer-Friendly**
  - Prisma schema and seed script for local development data.
  - Type-safe forms and validation using Zod and React Hook Form.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript, React 19

- **Styling & UI**
  - Tailwind CSS v4
  - shadcn/ui
  - Radix UI
  - Lucide React
  - Tabler Icons

- **State & Forms**
  - React Hook Form
  - Zod

- **Data & Backend**
  - PostgreSQL
  - Prisma ORM
  - `@prisma/adapter-pg`
  - `pg`
  - date-fns and date-fns-tz

- **Authentication**
  - NextAuth.js
  - Prisma Adapter
  - Google OAuth

- **UX Enhancements**
  - dnd-kit for drag-and-drop interactions
  - TanStack React Table
  - Recharts for charts and visualizations
  - Sonner for notifications
  - Framer Motion for animations

---

## Getting Started

### Prerequisites

- **Node.js:** 20.9 or later
- **npm**
- **PostgreSQL** database

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/devfarhaannn/habitflow.git
cd habitflow
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up the environment variables**

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/habitflow"

NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

Google OAuth credentials are optional if you do not want to use Google sign-in.

**4. Create the database**

Make sure PostgreSQL is running and create an empty database named `habitflow`.

**5. Generate Prisma Client**

```bash
npm run generate
```

**6. Set up the database schema**

```bash
npx prisma db push
```

**7. Seed sample data**

HabitFlow includes a Prisma seed script that creates a demo account, sample categories, six habits, and 90 days of habit statistics and completions.

```bash
npx prisma db seed
```

The seed script uses the following demo account:

- **Email:** `demo@habitflow.com`
- **Password:** `randomPassword`

**Note:** Running the seed script again replaces the existing habits, categories, completions, and daily statistics belonging to the demo account. Use it with a development database.

**8. Run the development server**

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Scripts

- **`npm run dev`**: Start the Next.js development server.
- **`npm run build`**: Create a production build.
- **`npm run start`**: Start the production server.
- **`npm run lint`**: Run ESLint.
- **`npm run generate`**: Generate the Prisma Client.
- **`npx prisma db seed`**: Insert sample data into the database.

---

## Project Structure

```text
habitflow/
│
├── app/                  # Next.js App Router pages and API routes
│
├── components/           # Reusable UI and application components
│
├── hooks/                # Custom React hooks
│
├── lib/                  # Authentication, Prisma, and utilities
│
├── prisma/
│   ├── migrations/       # Database migration history
│   ├── schema.prisma     # Prisma database schema
│   └── seed.ts           # Sample data seed script
│
├── public/               # Static assets
│
├── types/                # TypeScript types
│
├── prisma.config.ts      # Prisma configuration
├── package.json          # Project dependencies and scripts
├── package-lock.json     # npm dependency lockfile
└── README.md
```

---

## Notes

- HabitFlow is currently in early development (`version 0.1.0`).
- PostgreSQL must be running before starting the application.
- Keep your `.env` file private and never commit credentials.
- Google OAuth requires valid Google OAuth credentials.
- Use npm to install dependencies and run project scripts.