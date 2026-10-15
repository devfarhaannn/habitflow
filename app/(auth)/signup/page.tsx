import { SignupForm } from '@/components/forms/signup-form'
import { NEXT_AUTH } from '@/lib/authOptions';
import { GalleryVerticalEnd } from 'lucide-react'
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function RegisterPage() {
    const session = await getServerSession(NEXT_AUTH);

    if (session?.user) {
        redirect("/dashboard");
    }

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <a href="#" className="flex items-center gap-2 self-center font-medium">
                    <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                        <GalleryVerticalEnd className="size-4" />
                    </div>
                    HabitKit Inc.
                </a>
                <SignupForm />
            </div>
        </div>

    )
}