import prisma from "@/lib/prisma"
import { subDays, startOfDay } from "date-fns"
import { fromZonedTime, toZonedTime } from "date-fns-tz"

const habitData = [
    {
        title: "Workout",
        icon: "Dumbbell",
        color: "#FF6B6B",
        category: "health",
        currentStreak: 12,
        longestStreak: 30,
        totalCompletions: 45
    },
    {
        title: "Reading",
        icon: "BookOpen",
        color: "#4ECDC4",
        category: "learning",
        currentStreak: 5,
        longestStreak: 18,
        totalCompletions: 30
    },
    {
        title: "Meditation",
        icon: "Brain",
        color: "#00B894",
        category: "health",
        currentStreak: 20,
        longestStreak: 40,
        totalCompletions: 55
    },
    {
        title: "Code Practice",
        icon: "Code",
        color: "#0984E3",
        category: "productivity",
        currentStreak: 15,
        longestStreak: 50,
        totalCompletions: 60
    },
    {
        title: "Journal",
        icon: "NotebookPen",
        color: "#6C5CE7",
        category: "productivity",
        currentStreak: 3,
        longestStreak: 15,
        totalCompletions: 20
    },
    {
        title: "No Sugar",
        icon: "Ban",
        color: "#FDCB6E",
        category: "health",
        currentStreak: 7,
        longestStreak: 22,
        totalCompletions: 25
    }
]

export async function seedDatabase(USER_ID: string, USER_TIMEZONE: string) {

    console.log("Seeding deterministic dashboard dataset...")
    console.log("Deleting All Past Records...");

    // ------------------------------------------------
    // DELETE PAST RECORDS
    // ------------------------------------------------

    await prisma.habitCompletion.deleteMany({
        where: { userId: USER_ID }
    })

    await prisma.habitDailyStat.deleteMany({
        where: { userId: USER_ID }
    })

    await prisma.habit.deleteMany({
        where: {
            userId: USER_ID
        }
    })

    await prisma.habitCategory.deleteMany({
        where: {
            userId: USER_ID
        }
    })

    function getUserDayStartUTC(date: Date) {
        const zoned = toZonedTime(date, USER_TIMEZONE)
        const startZoned = startOfDay(zoned)
        return fromZonedTime(startZoned, USER_TIMEZONE)
    }

    // ------------------------------------------------
    // CATEGORIES
    // ------------------------------------------------
    const health = await prisma.habitCategory.create({
        data: { title: "Health", userId: USER_ID }
    })

    const learning = await prisma.habitCategory.create({
        data: { title: "Learning", userId: USER_ID }
    })

    const productivity = await prisma.habitCategory.create({
        data: { title: "Productivity", userId: USER_ID }
    })

    // ------------------------------------------------
    // 6 ACTIVE HABITS
    // ------------------------------------------------
    const habits = await Promise.all(
        habitData.map(habit =>
            prisma.habit.create({
                data: {
                    userId: USER_ID,
                    title: habit.title,
                    icon: habit.icon,
                    color: habit.color,
                    categoryId:
                        habit.category === "health"
                            ? health.id
                            : habit.category === "learning"
                                ? learning.id
                                : productivity.id,
                    currentStreak: habit.currentStreak,
                    longestStreak: habit.longestStreak,
                    totalCompletions: habit.totalCompletions
                }
            })
        )
    )

    // ------------------------------------------------
    // LAST 90 DAYS DAILY STATS (CONTROLLED DATA)
    // ------------------------------------------------
    const statsArray = []
    const completionArray = []

    for (let i = 0; i < 90; i++) {

        const dateUTC = getUserDayStartUTC(subDays(new Date(), i))

        for (const habit of habits) {

            let completion = 1

            if (habit.title === "Reading" && i % 3 === 0) completion = 0
            if (habit.title === "Journal" && i % 4 === 0) completion = 0
            if (habit.title === "No Sugar" && i % 5 === 0) completion = 0

            statsArray.push({
                habitId: habit.id,
                userId: USER_ID,
                date: dateUTC,
                completionCount: completion,
                targetCount: 1
            })

            if (completion === 1) {
                completionArray.push({
                    habitId: habit.id,
                    userId: USER_ID,
                    date: dateUTC,
                    completedAt: dateUTC
                })
            }
        }
    }

    await prisma.habitDailyStat.createMany({
        data: statsArray
    })

    await prisma.habitCompletion.createMany({
        data: completionArray
    })

    // ------------------------------------------------
    // TODAY PARTIAL COMPLETION (For skippedToday)
    // ------------------------------------------------
    const todayUTC = getUserDayStartUTC(new Date())

    await prisma.habitDailyStat.updateMany({
        where: { userId: USER_ID, date: todayUTC },
        data: { completionCount: 0 }
    })

    await prisma.habitDailyStat.update({
        where: {
            habitId_date: {
                habitId: habits.find(h => h.title === "Workout")!.id,
                date: todayUTC
            }
        },
        data: { completionCount: 1 }
    })

    console.log("Deterministic timezone-safe dataset created.")
}