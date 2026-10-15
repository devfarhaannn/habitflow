"use client";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { redirect } from "next/navigation";


export default function HeroSection() {

    const { login, error } = useAuth();


    async function onSubmit() {
        toast("Loging in with demo data")

        const result = await login("credentials", "demo@habitkit.com", "randomPassword");

        if (!error && result) {
            redirect("/dashboard");
        }
    }

    if (error) {
        toast.error(error);
    }


    const languages = [
        { name: 'NextJS', icon: '/logo/nextjs.svg' },
        { name: 'TypeScript', icon: '/logo/typescript.svg' },
        { name: 'Tailwind', icon: '/logo/tailwind.svg' },
        { name: 'Shadcn', icon: '/logo/shadcn.svg' },
        { name: 'nextAuth', icon: '/logo/nextauth.svg' },
        { name: 'Prisma', icon: '/logo/prisma.svg' },
        { name: 'postgreSQL', icon: '/logo/postgresql.svg' },
        { name: 'Recharts', icon: '/logo/react.svg' },
    ]

    return (
        <section className="relative overflow-hidden py-20 sm:py-32 z-10">

            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center animate-slide-up">
                    <Badge variant="secondary" className="mb-4 animate-pulse-glow">
                        🚀 The Ultimate tracking App
                    </Badge>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-7xl animate-slide-up animate-delay-100">
                        Track Habits,{' '}
                        <br />
                        <span className="bg-linear-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent animate-gradient">
                            Build Discipline
                        </span>
                    </h1>
                    <p className="mt-6 text-xl leading-8 text-muted-foreground animate-slide-up animate-delay-200 max-w-3xl mx-auto">
                        A powerful habit tracking platform designed to help you stay consistent and achieve your goals.
                        Track daily habits, build streaks, visualize your progress with analytics, and stay motivated
                        with a clean, distraction-free experience.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6 animate-slide-up animate-delay-300">
                        <Button asChild size="lg" className="hover-lift animate-pulse-glow">
                            <Link href="/dashboard">
                                Start tracking Now <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button variant="outline" size="lg" className="hover-lift"
                            onClick={() => onSubmit()}
                        >
                            See Demo
                        </Button>
                    </div>

                    {/* Language Support */}
                    <div className="mt-16 animate-slide-up animate-delay-400">
                        <p className="text-sm text-muted-foreground mb-4">Technology used to build this</p>
                        <div className="flex flex-wrap justify-center gap-3">
                            {languages.map((lang, index) => (
                                <div
                                    key={lang.name}
                                    className="flex items-center gap-2 px-3 py-2 bg-white rounded-full hover-lift glass-effect group"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <Image src={lang.icon} width={24} height={24} alt={lang.name} className='group-hover:scale-125 transition-transform duration-300 rounded' />
                                    <span className="text-sm font-medium group-hover:text-primary transition-colors duration-300">{lang.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

        </section>


    );
}