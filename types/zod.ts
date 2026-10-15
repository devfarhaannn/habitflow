import * as z from "zod"

export const signupFormSchema = z.object({
    fullName: z
        .string()
        .min(5, "Full name must be at least 5 characters.")
        .max(32, "Full name must be at most 32 characters."),
    email: z
        .email("Please enter a valid email address."),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters."),
    confirmPassword: z
        .string()
        .min(8, "Confirm password must be same as password."),
    terms: z.boolean().refine((value) => value === true, {
        message: "You must accept the terms and conditions.",
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
});

export const loginFormSchema = z.object({
    email: z
        .email("Please enter a valid email address."),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters."),
})

export const CreateHabitformSchema = z.object({
    title: z.string().min(2),
    description: z.string(),
    icon: z.string(),
    color: z.string(),
    goal: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
    target: z.number().min(1),
    categoryId: z.string(),
    startDate: z.date(),
})

export const CategorySchema = z.object({
    id: z.string(),
    title: z.string(),
});

export const HeatMapSchema = z.object({
    habitId: z.string(),
    date: z.date(),
    completionCount: z.number(),
    targetCount: z.number(),
});

export const CurrentWeekSchema = z.object({
    habitId: z.string(),
    date: z.date(),
    completionCount: z.number(),
    targetCount: z.number(),
});

export const HabitPageSchema = z.object({
    id: z.string(),
    order: z.number(),
    title: z.string(),
    description: z.string().nullable(),
    targetPerDay: z.number(),
    color: z.string(),
    icon: z.string(),
    goalType: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
    status: z.enum(["ACTIVE", "INACTIVE", "COMPLETED", "ARCHIVED"]),
    startDate: z.date(),
    endDate: z.date().nullable(),
    reminderEnabled: z.boolean(),
    currentStreak: z.number(),
    longestStreak: z.number(),
    totalCompletions: z.number(),
    todaysCompletion: z.number(),
    categoryId: z.string(),
    category: CategorySchema,
    currentWeek: z.array(CurrentWeekSchema),
    heatmap: z.array(HeatMapSchema),
});

export const editHabitSchema = HabitPageSchema.pick({
    id: true,
    title: true,
    description: true,
    goalType: true,
    targetPerDay: true,
    status: true,
    categoryId: true,
    icon: true,
    color: true,
    endDate: true,
})