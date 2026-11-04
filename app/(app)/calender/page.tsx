
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

import { ChevronLeft, ChevronRight } from "lucide-react";
import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

export default async function CalenderPage() {
    const session = await getServerSession(NEXT_AUTH);

    if (!session?.user?.id) {
        return null;
    }

    // Fetch actual habit activity belonging to the logged-in user.
    const stats = await prisma.habitDailyStat.findMany({
        where: {
            userId: session.user.id,
        },
        include: {
            habit: {
                select: {
                    id: true,
                    title: true,
                    color: true,
                },
            },
        },
        orderBy: {
            date: "asc",
        },
    });

    // Convert database records into calendar events.
    const events: CalendarEvent[] = stats.map((stat) => {
        const start = new Date(stat.date);
        start.setHours(9, 0, 0, 0);

        const end = new Date(start);
        end.setMinutes(30);

        let color: CalendarEvent["color"] = "default";

        if (stat.completionCount >= stat.targetCount) {
            color = "green";
        } else if (stat.completionCount > 0) {
            color = "blue";
        }

        return {
            id: stat.id,
            start,
            end,
            title: `${stat.habit.title} (${stat.completionCount}/${stat.targetCount})`,
            color,
        };
    });

    return (
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <Calendar events={events} view="month">
                <div className="flex flex-col h-[calc(100vh-8rem)]">
                    {/* Calendar toolbar */}
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

                    {/* Calendar views */}
                    <div className="flex-1 overflow-auto px-4 lg:px-6 relative">
                        <CalendarDayView />
                        <CalendarWeekView />
                        <CalendarMonthView />
                        <CalendarYearView />
                    </div>
                </div>
            </Calendar>
        </div>
    );
}
