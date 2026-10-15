import { AppSidebar } from "@/components/app-layout/app-sidebar";
import { AppHeader } from "@/components/app-layout/app-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/providers/AuthProvider";
import { AppFooter } from "@/components/app-layout/app-footer";
import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "@/lib/authOptions";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const session = await getServerSession(NEXT_AUTH);

    return (
        <AuthProvider>
            <SidebarProvider
                style={
                    {
                        "--sidebar-width": "calc(var(--spacing) * 72)",
                        "--header-height": "calc(var(--spacing) * 12)",
                    } as React.CSSProperties
                }
            >
                <AppSidebar variant="inset" />
                <SidebarInset>
                    <AppHeader userId={session?.user.id} timezone={session?.user.timezone} />
                    <div className="flex flex-1 flex-col">
                        <div className="@container/main flex flex-1 flex-col gap-2">
                            {children}
                        </div>
                    </div>
                    <AppFooter />
                </SidebarInset>
            </SidebarProvider>
        </AuthProvider>
    );
}
