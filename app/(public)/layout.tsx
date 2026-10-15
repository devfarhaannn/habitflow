import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "@/lib/authOptions";
import { Animation } from "@/components/animation";
import { Navbar } from "@/components/pubic-layout/navbar";
import Footer from "@/components/pubic-layout/footer";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const session = await getServerSession(NEXT_AUTH);

    return (
        <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">

            {/* Animated background elements */}
            <Animation />

            <Navbar />

            <main className="grow">
                {children}
            </main>

            <Footer />
        </div>
    );
}
