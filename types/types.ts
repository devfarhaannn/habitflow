export type AuthError =
    | "INVALID_CREDENTIALS"
    | "USER_NOT_FOUND"
    | "USER_ALREADY_EXISTS"
    | "OAUTH_ACCOUNT_EXISTS"
    | "UNKNOWN_ERROR"
    | "MISSING_FIELDS";

export enum HabitOverviewCardsKey {
    Streak = "streak",
    Compeletion = "compeletion",
    ActiveHabits = "activeHabits",
    SuccessRate = "successRate",
}

export type HabitOverviewCardStaticConfig = {
    key: HabitOverviewCardsKey;
    title: string;
    description: string;
    footer: string;
}[];

export enum HabitMetricCardKey {
    LargestStreak = "largestStreak",
    MissedHabit = "missedHabit",
    SkippedToday = "skippedToday"
}

export type HabitMetricCardStaticConfig = {
    key: HabitMetricCardKey;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
}[];


export enum HabitProgressCardKey {
    MonthlyCompleteion = "monthlyCompletion",
    TotalStreak = "totalStreak",
    GoalAchieved = "goalAchieved",
    totalHabitLog = "totalHabitLog"
}

export type HabitProgressCardStaticConfig = {
    key: HabitProgressCardKey;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
}[];

export type DashboardBackendDTO = {
    topHabitsData: TopHabitsBackendDTO
    habitPerformanceData: HabitPerformanceBackendDTO
    habitInsightsData: HabitInsightBackendDTO
    habitMetricData: HabitMetricBackendDTO
    habitOverviewData: HabitOverviewBackendDTO
}

export type AnalyticsBackendDTO = {
    habitOverviewData: HabitOverviewBackendDTO
    habitCompletionChart: habitCompletionChartBackendDTO
    consistencyChart: habitConsistencyChartBackendDTO
    categoryChart: habitCategoryChartBackendDTO
    monthlyTarget: monthlyTargetBanckedDTO
}

export type monthlyTargetBanckedDTO = {
    habitId: string,
    title: string,
    completedCount: number,
    color: string,
    toComplete: number
}[]


export type habitCompletionChartBackendDTO = {
    date: string;
    completions: number;
}[]

export type habitConsistencyChartBackendDTO = {
    date: string;
    consistency: number;
}[]

export type habitCategoryChartBackendDTO = {
    category: string;
    completions: number;
}[]

export type HabitPerformanceBackendDTO = {
    summary: {
        [key in HabitProgressCardKey]: number
    }

    monthlyTarget: {
        habitId: string,
        title: string,
        completedCount: number,
        color: string,
        toComplete: number
    }[]

    consistencyBar: {
        sevenDayStreak: {
            completed: number
            total: number
        }
        weeklyPerformance: {
            completed: number
            total: number
        }
    }

    consistencyMetrics: {
        percentage: number
        dailyData: {
            date: string
            value: number
        }[]
    }
}

export type TopHabitsBackendDTO = {
    icon: string;
    title: string;
    streak: number;
    progressPercentage: number;
}[]

export type HabitInsightBackendDTO = {
    totalHabitsCreated: number;
    categoriesUsed: number;
    totalCompletions: number;
    averageCompletionRate: number;
    chartData: {
        month: string;
        completed: number
    }[];
}

export type HabitMetricBackendDTO = {
    [key in HabitMetricCardKey]: number
}

export type HabitOverviewBackendDTO = {
    [key in HabitOverviewCardsKey]: {
        value: string;
        percentage: number;
        isPositive: boolean;
    }
}

export type HabitFrequency = "DAILY" | "WEEKLY" | "MONTHLY"

export type HabitStatus = "ACTIVE" | "INACTIVE" | "COMPLETED" | "ARCHIVED"

export type HabitCategoryInHabitDTO = {
    id: string;
    title: string;
}

export type habitBackendDTO = {
    currentWeek: {
        habitId: string;
        date: Date;
        completionCount: number;
        targetCount: number;
    }[];
    heatmap: {
        habitId: string;
        date: Date;
        completionCount: number;
        targetCount: number;
    }[];
    todaysCompletion: number;
    id: string;
    title: string;
    order: number;
    description: string | null;
    targetPerDay: number;
    color: string;
    icon: string;
    goalType: HabitFrequency;
    status: HabitStatus;
    startDate: Date;
    endDate: Date | null;
    reminderEnabled: boolean;
    currentStreak: number;
    longestStreak: number;
    totalCompletions: number;
    categoryId: string;
    category: {
        id: string;
        title: string;
    };
}[]

