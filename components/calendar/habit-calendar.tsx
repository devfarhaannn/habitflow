
"use client";

import { useState } from "react";
import { formatInTimeZone } from "date-fns-tz";

import {
    Calendar,
    CalendarCurrentDate,
    CalendarDayView,
    CalendarMonthView,
    CalendarNextTrigger,
    CalendarPrevTrigger,
    CalendarTodayTrigger,
    CalendarViewTrigger,
    CalendarWeekView,
    CalendarYearView,
    type CalendarEvent,
} from "@/components/full-calender";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

type Habit = {
    id: string;
    title: string;
    color: string;
    goalType: "DAILY" | "WEEKLY" | "MONTHLY";
    targetPerDay: number;
    startDate: string;
    endDate: string | null;
};

type DailyStat = {
    id: string;
    habitId: string;
    dateKey: string;
    completionCount: number;
    targetCount: number;
};

type Props = {
    habits: Habit[];
    stats: DailyStat[];
    timezone: string;
};

export function HabitCalendar({
    habits,
    stats,
    timezone,
}: Props) {
    const [selectedDate, setSelectedDate] = useState(new Date());

    const selectedDateKey = formatInTimeZone(
        selectedDate,
        timezone,
        "yyyy-MM-dd"
    );

    const events: CalendarEvent[] = stats.map((stat) => {
        const start = new Date(`${stat.dateKey}T09:00:00`);
        const end = new Date(start);

        end.setMinutes(end.getMinutes() + 30);

        const habit = habits.find((item) => item.id === stat.habitId);

        const color: CalendarEvent["color"] =
            stat.completionCount >= stat.targetCount
                ? "green"
                : stat.completionCount > 0
                    ? "blue"
                    : "default";

        return {
            id: stat.id,
            start,
            end,
            title: `${habit?.title ?? "Habit"} (${stat.completionCount}/${stat.targetCount})`,
            color,
        };
    });

    const selectedHabits = habits.filter((habit) => {
        const startDate = formatInTimeZone(
            new Date(habit.startDate),
            timezone,
            "yyyy-MM-dd"
        );

        const endDate = habit.endDate
            ? formatInTimeZone(
                new Date(habit.endDate),
                timezone,
                "yyyy-MM-dd"
            )
            : null;

        const isWithinActiveDates =
            startDate <= selectedDateKey &&
            (!endDate || endDate >= selectedDateKey);

        const hasHistoricalRecord = stats.some(
            (stat) =>
                stat.habitId === habit.id &&
                stat.dateKey === selectedDateKey
        );

        return isWithinActiveDates || hasHistoricalRecord;
    });
    const selectedStats = selectedHabits.map((habit) => {
        const stat = stats.find(
            (item) =>
                item.habitId === habit.id &&
                item.dateKey === selectedDateKey
        );

        return {
            ...habit,
            completionCount: stat?.completionCount ?? 0,
            targetCount: stat?.targetCount ?? habit.targetPerDay,
            hasRecord: Boolean(stat),
        };
    });

    return (
        <div className="flex flex-col gap-6 py-4 md:py-6">
            <Calendar
                events={events}
                view="month"
                onDateClick={setSelectedDate}
            >
                <div className="flex flex-col h-[65vh] min-h-[500px]">
                    <div className="flex flex-wrap items-center gap-2 px-4 lg:px-6 mb-6">
                        <CalendarViewTrigger
                            view="day"
                            className="aria-current:bg-accent"
                        >
                            Day
                        </CalendarViewTrigger>

                        <CalendarViewTrigger
                            view="week"
                            className="aria-current:bg-accent"
                        >
                            Week
                        </CalendarViewTrigger>

                        <CalendarViewTrigger
                            view="month"
                            className="aria-current:bg-accent"
                        >
                            Month
                        </CalendarViewTrigger>

                        <CalendarViewTrigger
                            view="year"
                            className="aria-current:bg-accent"
                        >
                            Year
                        </CalendarViewTrigger>

                        <div className="flex-1" />

                        <CalendarCurrentDate />

                        <CalendarPrevTrigger>
                            <ChevronLeft size={18} />
                        </CalendarPrevTrigger>

                        <CalendarTodayTrigger>
                            Today
                        </CalendarTodayTrigger>

                        <CalendarNextTrigger>
                            <ChevronRight size={18} />
                        </CalendarNextTrigger>
                    </div>

                    <div className="flex-1 overflow-auto px-4 lg:px-6 relative">
                        <CalendarDayView />
                        <CalendarWeekView />
                        <CalendarMonthView />
                        <CalendarYearView />
                    </div>
                </div>
            </Calendar>

            {/* Selected date history */}
            <div className="max-h-72 overflow-y-auto pr-3">
                <div className="px-4 lg:px-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-5 w-5 text-muted-foreground" />

                                <CardTitle>
                                    Habit History —{" "}
                                    {formatInTimeZone(
                                        selectedDate,
                                        timezone,
                                        "MMMM d, yyyy"
                                    )}
                                </CardTitle>
                            </div>
                        </CardHeader>

                        <CardContent>
                            {selectedStats.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No habits were active on this date.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {selectedStats.map((habit) => {
                                        const isComplete =
                                            habit.completionCount >= habit.targetCount;

                                        const isPartial =
                                            habit.completionCount > 0 &&
                                            !isComplete;

                                        return (
                                            <div
                                                key={habit.id}
                                                className="flex items-center justify-between gap-4 border-b last:border-0 pb-3 last:pb-0"
                                            >
                                                <div className="min-w-0">
                                                    <p className="font-medium truncate">
                                                        {habit.title}
                                                    </p>

                                                    <p className="text-xs text-muted-foreground">
                                                        {habit.completionCount} of{" "}
                                                        {habit.targetCount} completions
                                                    </p>
                                                </div>

                                                {!habit.hasRecord ? (
                                                    <Badge variant="outline">
                                                        No record
                                                    </Badge>
                                                ) : isComplete ? (
                                                    <Badge className="bg-green-600 hover:bg-green-600">
                                                        Completed
                                                    </Badge>
                                                ) : isPartial ? (
                                                    <Badge className="bg-blue-600 hover:bg-blue-600">
                                                        Partial
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary">
                                                        Not completed
                                                    </Badge>
                                                )}
                                            </div>
                                        );
                                    })}

                                </div>

                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
