
"use client";

import { useEffect, useState } from "react";
import { Download, FileSpreadsheet, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

type Habit = {
  id: string;
  title: string;
  categoryId: string;
  status: string;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
};

type Category = {
  id: string;
  title: string;
};

type DailyStat = {
  id: string;
  habitId: string;
  date: string;
  completionCount: number;
  targetCount: number;
};

type ReportData = {
  categories: Category[];
  habits: Habit[];
  dailyStats: DailyStat[];
};

function csvCell(value: string | number) {
  let text = String(value ?? "");

  // Prevent spreadsheet formula injection.
  if (/^[=+\-@]/.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

export default function ReportPage() {
  const { user, loading: authLoading } = useAuth();

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  async function fetchReport() {
    if (!user?.id) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/${user.id}/data`);

      if (!response.ok) {
        throw new Error("Failed to fetch report data");
      }

      const result = await response.json();

      setReport({
        categories: result.data.categories ?? [],
        habits: result.data.habits ?? [],
        dailyStats: result.data.dailyStats ?? [],
      });
    } catch (error) {
      console.error("Report fetch error:", error);
      toast.error("Could not load your report data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchReport();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user?.id]);

  function downloadReport() {
    if (!report) {
      toast.error("Report data is not available.");
      return;
    }

    if (report.habits.length === 0) {
      toast.error("Create a habit before downloading your report.");
      return;
    }

    try {
      setDownloading(true);

      const categoryMap = new Map(
        report.categories.map((category) => [
          category.id,
          category.title,
        ])
      );

      const statsMap = new Map<string, DailyStat[]>();

      report.dailyStats.forEach((stat) => {
        const existing = statsMap.get(stat.habitId) ?? [];
        existing.push(stat);
        statsMap.set(stat.habitId, existing);
      });

      const headers = [
        "Record Type",
        "Habit",
        "Category",
        "Status",
        "Current Streak",
        "Longest Streak",
        "Total Completions",
        "Completion Rate (%)",
        "Date",
        "Completed",
        "Target",
      ];

      const rows: (string | number)[][] = [];

      report.habits.forEach((habit) => {
        const stats = statsMap.get(habit.id) ?? [];

        const completed = stats.reduce(
          (sum, stat) => sum + (stat.completionCount ?? 0),
          0
        );

        const target = stats.reduce(
          (sum, stat) => sum + (stat.targetCount ?? 0),
          0
        );

        const completionRate =
          target > 0
            ? ((completed / target) * 100).toFixed(2)
            : "0.00";

        rows.push([
          "Habit Summary",
          habit.title,
          categoryMap.get(habit.categoryId) ?? "Uncategorized",
          habit.status,
          habit.currentStreak ?? 0,
          habit.longestStreak ?? 0,
          habit.totalCompletions ?? completed,
          completionRate,
          "",
          "",
          "",
        ]);

        stats
          .sort(
            (a, b) =>
              new Date(a.date).getTime() -
              new Date(b.date).getTime()
          )
          .forEach((stat) => {
            rows.push([
              "Daily Progress",
              habit.title,
              categoryMap.get(habit.categoryId) ?? "Uncategorized",
              habit.status,
              "",
              "",
              "",
              "",
              String(stat.date).slice(0, 10),
              stat.completionCount,
              stat.targetCount,
            ]);
          });
      });

      const csvContent = [
        headers.map(csvCell).join(","),
        ...rows.map((row) => row.map(csvCell).join(",")),
      ].join("\n");

      const blob = new Blob(
        ["\uFEFF" + csvContent],
        { type: "text/csv;charset=utf-8;" }
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `habitflow-report-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      toast.success("Your habit report has been downloaded.");
    } catch (error) {
      console.error("Report download error:", error);
      toast.error("Failed to generate your report.");
    } finally {
      setDownloading(false);
    }
  }

  const totalHabits = report?.habits.length ?? 0;

  const totalCompletions =
    report?.habits.reduce(
      (sum, habit) => sum + (habit.totalCompletions ?? 0),
      0
    ) ?? 0;

  const averageStreak =
    totalHabits > 0
      ? Math.round(
          report!.habits.reduce(
            (sum, habit) => sum + (habit.currentStreak ?? 0),
            0
          ) / totalHabits
        )
      : 0;

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
        <span className="text-sm text-muted-foreground">
          Preparing your report...
        </span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Please sign in to view your report.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">
              Download Report
            </h1>
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            Export your habit activity and daily progress into a
            spreadsheet.
          </p>
        </div>

        <Button
          onClick={downloadReport}
          disabled={!report || downloading}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {downloading ? "Generating..." : "Download CSV"}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Total Habits</p>
          <p className="mt-2 text-3xl font-bold">{totalHabits}</p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Total Completions
          </p>
          <p className="mt-2 text-3xl font-bold">
            {totalCompletions}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Average Current Streak
          </p>
          <p className="mt-2 text-3xl font-bold">
            {averageStreak} days
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">What's included?</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <FileSpreadsheet className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Habit summary</p>
              <p className="text-sm text-muted-foreground">
                Habit names, categories, status, streaks and
                completion totals.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FileSpreadsheet className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Daily progress</p>
              <p className="text-sm text-muted-foreground">
                Recorded completion counts and targets for each
                habit and date.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-dashed p-5">
        <p className="text-sm text-muted-foreground">
          Your report uses the data currently saved in your
          HabitFlow account. The CSV file can be opened in Excel,
          Google Sheets or Numbers.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={fetchReport}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>
    </div>
  );
}
