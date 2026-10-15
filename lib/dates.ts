import {
    startOfDay,
    subDays,
    startOfMonth,
    endOfMonth,
    subMonths,
    addDays,
    addMonths,
} from "date-fns"
import { toZonedTime, fromZonedTime } from "date-fns-tz"

export function getDateRanges(timezone: string) {

    const nowUTC = new Date()
    const zonedNow = toZonedTime(nowUTC, timezone)

    const startOfTodayZoned = startOfDay(zonedNow)
    const tomorrowStartZoned = addDays(startOfTodayZoned, 1)

    const sevenDaysStartZoned = subDays(startOfTodayZoned, 6)
    const fourteenDaysStartZoned = subDays(startOfTodayZoned, 13)

    const currentMonthStartZoned = startOfMonth(zonedNow)
    const nextMonthStartZoned = startOfMonth(addMonths(zonedNow, 1))

    const prevMonthStartZoned = startOfMonth(subMonths(zonedNow, 1))

    const threeMonthsAgoStartZoned = startOfMonth(
        subMonths(zonedNow, 3)
    )

    const fiveMonthsAgoStartZoned = startOfMonth(
        subMonths(zonedNow, 5)
    )

    // ---- Convert back to UTC (for DB queries) ----
    return {
        current: fromZonedTime(zonedNow, timezone),
        todayStart: fromZonedTime(startOfTodayZoned, timezone),
        tomorrowStart: fromZonedTime(tomorrowStartZoned, timezone),

        sevenDaysStart: fromZonedTime(sevenDaysStartZoned, timezone),
        fourteenDaysStart: fromZonedTime(fourteenDaysStartZoned, timezone),

        currentMonthStart: fromZonedTime(currentMonthStartZoned, timezone),
        nextMonthStart: fromZonedTime(nextMonthStartZoned, timezone),

        prevMonthStart: fromZonedTime(prevMonthStartZoned, timezone),

        threeMonthsAgoStart: fromZonedTime(
            threeMonthsAgoStartZoned,
            timezone
        ),

        fiveMonthsAgoStart: fromZonedTime(
            fiveMonthsAgoStartZoned,
            timezone
        ),
    }
}

export function getUserDayBounds(timezone: string, date = new Date()) {
    const zonedDate = toZonedTime(date, timezone)

    const startZoned = startOfDay(zonedDate)
    const endZoned = addDays(startZoned, 1)

    return {
        startUtc: fromZonedTime(startZoned, timezone),
        endUtc: fromZonedTime(endZoned, timezone)
    }
}

export function getUserMonthBounds(timezone: string, date = new Date()) {
    const zoned = toZonedTime(date, timezone)

    const startZoned = startOfMonth(zoned)
    const nextMonthZoned = startOfMonth(addMonths(zoned, 1))

    return {
        startUtc: fromZonedTime(startZoned, timezone),
        endUtc: fromZonedTime(nextMonthZoned, timezone)
    }
}