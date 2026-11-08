// export default async function HabidIdPage({ params }: { params: { habitId: string } }) {
//     const value = await params; // Access the parameter by its key
//     // console.log(value);

//     // URL -> /next-page?keyName=someValue
//     // value -> 'someValue'
//     return <p>Value: {value.habitId}</p>;
// }


import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

import { NEXT_AUTH } from "@/lib/authOptions";
import { getHabitsData } from "@/lib/server/habits";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconRenderer } from "@/components/icon-picker/icon-picker";

export default async function HabitIdPage({
    params,
}: {
    params: Promise<{ habitId: string[] }>;
}) {
    const { habitId } = await params;
    const id = habitId[0];

    const session = await getServerSession(NEXT_AUTH);

    if (!session?.user?.id) {
        redirect("/login");
    }

    const habits = await getHabitsData(
        session.user.id,
        session.user.timezone ?? "Asia/Kolkata"
    );

    const habit = habits.find((item) => item.id === id);

    if (!habit) {
        notFound();
    }

    const progress = habit.targetPerDay > 0
        ? Math.min(
            (habit.todaysCompletion / habit.targetPerDay) * 100,
            100
        )
        : 0;

    return (
        <div className="flex flex-col gap-6 p-4 lg:p-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Link
                        href="/habits"
                        className="text-sm text-muted-foreground hover:text-foreground"
                    >
                        ← Back to Habits
                    </Link>

                    <h1 className="mt-3 text-2xl font-bold">
                        Habit Details
                    </h1>
                </div>

                <Badge variant="outline">
                    {habit.status}
                </Badge>
            </div>

            {/* Habit Information */}
            <div className="rounded-xl border bg-card p-6">
                <div className="flex items-center gap-4">
                    <div
                        className="flex size-14 items-center justify-center rounded-xl"
                        style={{
                            backgroundColor: `${habit.color}20`,
                        }}
                    >
                        <IconRenderer
                            icon={habit.icon}
                            className="size-8"
                            style={{ color: habit.color }}
                        />
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold">
                            {habit.title}
                        </h2>

                        <p className="text-sm text-muted-foreground">
                            {habit.description || "No description available"}
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                    <Badge variant="secondary">
                        {habit.category?.title ?? "Uncategorized"}
                    </Badge>

                    <Badge variant="secondary">
                        {habit.goalType}
                    </Badge>
                </div>
            </div>

            {/* Today's Progress */}
            <div className="rounded-xl border bg-card p-6 space-y-4">
                <div className="flex justify-between">
                    <h2 className="font-semibold">
                        Today&apos;s Progress
                    </h2>

                    <span className="font-medium">
                        {habit.todaysCompletion}/{habit.targetPerDay}
                    </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div
                        className="h-full rounded-full transition-all"
                        style={{
                            width: `${progress}%`,
                            backgroundColor: habit.color,
                        }}
                    />
                </div>

                <p className="text-sm text-muted-foreground">
                    {Math.round(progress)}% completed today
                </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                    {
                        title: "Current Streak",
                        value: habit.currentStreak,
                    },
                    {
                        title: "Longest Streak",
                        value: habit.longestStreak,
                    },
                    {
                        title: "Total Completions",
                        value: habit.totalCompletions,
                    },
                ].map((stat) => (
                    <div
                        key={stat.title}
                        className="rounded-xl border bg-card p-5"
                    >
                        <p className="text-sm text-muted-foreground">
                            {stat.title}
                        </p>

                        <p className="mt-2 text-3xl font-bold">
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Dates */}
            <div className="rounded-xl border bg-card p-6">
                <h2 className="mb-4 font-semibold">
                    Habit Schedule
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Start Date
                        </p>
                        <p className="font-medium">
                            {new Date(habit.startDate).toLocaleDateString()}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">
                            End Date
                        </p>
                        <p className="font-medium">
                            {habit.endDate
                                ? new Date(habit.endDate).toLocaleDateString()
                                : "No end date"}
                        </p>
                    </div>
                </div>
            </div>

            <div>
                <Button asChild variant="outline">
                    <Link href="/habits">
                        Back to All Habits
                    </Link>
                </Button>
            </div>
        </div>
    );
}
