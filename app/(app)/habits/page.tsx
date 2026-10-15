import { DataTable1 } from "@/components/habits/data-table";
import { NEXT_AUTH } from "@/lib/authOptions";
import { getHabitsData } from "@/lib/server/habits";
import { getServerSession } from "next-auth";

export default async function HabitsPage() {
    const session = await getServerSession(NEXT_AUTH);
    if (!session?.user.id) {
        return
    }
    const habitData = await getHabitsData(session?.user.id, session.user.timezone);

    return (
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <DataTable1 data={habitData} userId={session.user.id} />
        </div>
    )
}