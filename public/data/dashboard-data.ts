import { HabitMetricCardKey, HabitMetricCardStaticConfig, HabitOverviewCardStaticConfig, HabitOverviewCardsKey, HabitProgressCardKey, HabitProgressCardStaticConfig } from "@/types/types";
import { BadgePercentIcon, CalendarX2Icon, DollarSignIcon, ShoppingBagIcon, TrendingUpIcon, TriangleAlertIcon, TruckIcon } from "lucide-react";

export const habitOverviewCardsConfig: HabitOverviewCardStaticConfig = [
    {
        key: HabitOverviewCardsKey.Streak,
        title: "Current Streak",
        description: "Your longest active streak",
        footer: "Based on daily completion",
    },
    {
        key: HabitOverviewCardsKey.Compeletion,
        title: "Completed Habits",
        description: "Habits completed today",
        footer: "Compared to yesterday",
    },
    {
        key: HabitOverviewCardsKey.ActiveHabits,
        title: "Active Habits",
        description: "Habits Currently Active",
        footer: "Across all tracked habits",
    },
    {
        key: HabitOverviewCardsKey.SuccessRate,
        title: "Success Rate",
        description: "Percentage of completions",
        footer: "Based on total attempts",
    },
];

export const STATISTICS_CARD_DATA: HabitMetricCardStaticConfig = [
    {
        key: HabitMetricCardKey.LargestStreak,
        icon: TruckIcon,
        title: "Largest Streak Ever",
    },
    {
        key: HabitMetricCardKey.MissedHabit,
        icon: TriangleAlertIcon,
        title: "Missed Habit (This Month)",
    },
    {
        key: HabitMetricCardKey.SkippedToday,
        icon: CalendarX2Icon,
        title: "Skipped Today",
    },
];

export const progressCardData: HabitProgressCardStaticConfig = [
    {
        key: HabitProgressCardKey.MonthlyCompleteion,
        icon: TrendingUpIcon,
        title: 'Monthly Completion',
    },
    {
        key: HabitProgressCardKey.TotalStreak,
        icon: BadgePercentIcon,
        title: 'Total Streak Days',
    },
    {
        key: HabitProgressCardKey.GoalAchieved,
        icon: DollarSignIcon,
        title: 'Goal Achieved',
    },
    {
        key: HabitProgressCardKey.totalHabitLog,
        icon: ShoppingBagIcon,
        title: 'Total Habit Logs',
    }
]
