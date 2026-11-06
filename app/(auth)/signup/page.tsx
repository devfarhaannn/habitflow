
import { SignupForm } from "@/components/forms/signup-form";
import { NEXT_AUTH } from "@/lib/authOptions";
import { GalleryVerticalEnd } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
    const session = await getServerSession(NEXT_AUTH);

    if (session?.user) {
        redirect("/dashboard");
    }

    return (
        <main className="flex min-h-svh w-full items-center justify-center px-4 py-8">
            <div className="flex w-full max-w-xl flex-col gap-6">
                <a
                    href="/"
                    className="flex items-center justify-center gap-2 self-center font-medium"
                >
                    <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-lg">
                        <GalleryVerticalEnd className="size-4" />
                    </div>
                    HabitFFlow Inc.
                </a>

                <SignupForm />
            </div>
        </main>
    );
}
