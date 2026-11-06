
import { Animation } from "@/components/animation";
import { Navbar } from "@/components/pubic-layout/navbar";
import Footer from "@/components/pubic-layout/footer";

export default function AppLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
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
