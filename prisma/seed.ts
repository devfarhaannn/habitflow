import prisma from "@/lib/prisma";
import { startOfDay, subDays } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import bcrypt from "bcrypt";

const habitData = [
    {
        title: "Workout",
        icon: "Dumbbell",
        color: "#FF6B6B",
        category: "health",
        currentStreak: 12,
        longestStreak: 30,
        totalCompletions: 45,
    },
    {
        title: "Reading",
        icon: "BookOpen",
        color: "#4ECDC4",
        category: "learning",
        currentStreak: 5,
        longestStreak: 18,
        totalCompletions: 30,
    },
    {
        title: "Meditation",
        icon: "Brain",
        color: "#00B894",
        category: "health",
        currentStreak: 20,
        longestStreak: 40,
        totalCompletions: 55,
    },
    {
        title: "Code Practice",
        icon: "Code",
        color: "#0984E3",
        category: "productivity",
        currentStreak: 15,
        longestStreak: 50,
        totalCompletions: 60,
    },
    {
        title: "Journal",
        icon: "NotebookPen",
        color: "#6C5CE7",
        category: "productivity",
        currentStreak: 3,
        longestStreak: 15,
        totalCompletions: 20,
    },
    {
        title: "No Sugar",
        icon: "Ban",
        color: "#FDCB6E",
        category: "health",
        currentStreak: 7,
        longestStreak: 22,
        totalCompletions: 25,
    },
];

async function main() {
    const totalStart = performance.now();

    const passwordHash = await bcrypt.hash("randomPassword", 10);

    const user = await prisma.user.upsert({
        where: {
            email: "demo@habitflow.com",
        },
        update: {},
        create: {
            email: "demo@habitflow.com",
            name: "DemoUser",
            firstName: "Demo",
            lastName: "User",
            timezone: "Asia/Kolkata",
            passwordHash,
        },
    });

    console.log("Seeding deterministic dashboard dataset...");

    function getUserDayStartUTC(date: Date) {
        const zoned = toZonedTime(date, user.timezone);
        const startZoned = startOfDay(zoned);

        return fromZonedTime(startZoned, user.timezone);
    }

    const seedStart = performance.now();

    await prisma.$transaction(async (tx) => {
        // 1. Delete existing records.
        await tx.habitCompletion.deleteMany({
            where: { userId: user.id },
        });

        await tx.habitDailyStat.deleteMany({
            where: { userId: user.id },
        });

        await tx.habit.deleteMany({
            where: { userId: user.id },
        });

        await tx.habitCategory.deleteMany({
            where: { userId: user.id },
        });

        // 2. Create categories in one query.
        const categories = await tx.habitCategory.createManyAndReturn({
            data: [
                { title: "Health", userId: user.id },
                { title: "Learning", userId: user.id },
                { title: "Productivity", userId: user.id },
            ],
        });

        const categoryMap = new Map(
            categories.map((category) => [
                category.title.toLowerCase(),
                category.id,
            ])
        );

        // 3. Create habits in one query.
        const habits = await tx.habit.createManyAndReturn({
            data: habitData.map((habit) => ({
                userId: user.id,
                title: habit.title,
                icon: habit.icon,
                color: habit.color,
                categoryId: categoryMap.get(habit.category)!,
                currentStreak: habit.currentStreak,
                longestStreak: habit.longestStreak,
                totalCompletions: habit.totalCompletions,
            })),
        });

        // 4. Generate 90 days of dashboard data.
        const statsArray = [];
        const completionArray = [];

        const now = new Date();

        for (let i = 0; i < 90; i++) {
            const dateUTC = getUserDayStartUTC(
                subDays(now, i)
            );

            for (const habit of habits) {
                let completion = 1;

                if (habit.title === "Reading" && i % 3 === 0) {
                    completion = 0;
                }

                if (habit.title === "Journal" && i % 4 === 0) {
                    completion = 0;
                }

                if (habit.title === "No Sugar" && i % 5 === 0) {
                    completion = 0;
                }

                statsArray.push({
                    habitId: habit.id,
                    userId: user.id,
                    date: dateUTC,
                    completionCount: completion,
                    targetCount: 1,
                });

                if (completion === 1) {
                    completionArray.push({
                        habitId: habit.id,
                        userId: user.id,
                        date: dateUTC,
                        completedAt: dateUTC,
                    });
                }
            }
        }

        // 5. Bulk insert daily statistics.
        await tx.habitDailyStat.createMany({
            data: statsArray,
        });

        // 6. Bulk insert completions.
        await tx.habitCompletion.createMany({
            data: completionArray,
        });

        // 7. Set today's partial completion.
        const todayUTC = getUserDayStartUTC(now);

        await tx.habitDailyStat.updateMany({
            where: {
                userId: user.id,
                date: todayUTC,
            },
            data: {
                completionCount: 0,
            },
        });

        const workout = habits.find(
            (habit) => habit.title === "Workout"
        );

        if (workout) {
            await tx.habitDailyStat.update({
                where: {
                    habitId_date: {
                        habitId: workout.id,
                        date: todayUTC,
                    },
                },
                data: {
                    completionCount: 1,
                },
            });
        }
    });

    console.log(
        `Database seeding completed in ${(
            (performance.now() - seedStart) /
            1000
        ).toFixed(2)} seconds`
    );

    console.log("Deterministic timezone-safe dataset created.");

    console.log(
        `Total seed time: ${(
            (performance.now() - totalStart) /
            1000
        ).toFixed(2)} seconds`
    );
}

main()
    .catch((error) => {
        console.error("Seeding failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });