import { Animation } from "@/components/animation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CircleCheckIcon } from "lucide-react";
import Image from "next/image";
import {
    LayoutDashboard,
    ListChecks,
    Flame,
    BarChart3,
    CalendarDays,
    BellRing
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import HeroSection from "@/components/pubic-layout/hero-section";


export default async function HomePage() {

    const features = [
        {
            icon: LayoutDashboard,
            title: "Dashboard Overview",
            description:
                "See your key habits, current streaks, longest streaks, and total completions at a glance."
        },
        {
            icon: ListChecks,
            title: "Habit Management",
            description:
                "Create, organize, and categorize habits with icons and color labels for quick visual scanning."
        },
        {
            icon: Flame,
            title: "Daily Tracking & Streaks",
            description:
                "Track daily completions, build streaks, and stay motivated with consistent progress."
        },
        {
            icon: BarChart3,
            title: "Habit Analytics",
            description:
                "Analyze trends with historical habit data and visual insights from the last 90 days."
        },
        {
            icon: CalendarDays,
            title: "Smart Calendar View",
            description:
                "Visualize your habit consistency across days and weeks with an intuitive calendar layout."
        },
        {
            icon: BellRing,
            title: "Reminders & Motivation",
            description:
                "Stay on track with reminders and build routines that help you stay consistent every day."
        }
    ];

    const MainService = [
        {
            title: "Track Daily Habits with Consistent Streaks",
            description: "Monitor your daily habit completions and build powerful streaks over time"
        },
        {
            title: "Visualize Progress with Smart Analytics",
            description: "Understand your growth with habit insights and trend tracking"
        },
        {
            title: "Stay Consistent with Smart Reminders",
            description: "Never miss a habit with timely reminders and notifications"
        }
    ];

    const faqItems = [
        {
            question: "Is the habit tracker free to use?",
            answer:
                "Yes, you can start tracking your habits for free. Our free plan includes basic habit tracking, streak monitoring, and simple progress insights. We may introduce premium features in the future for advanced analytics and customization."
        },
        {
            question: "Can I track multiple habits at the same time?",
            answer:
                "Absolutely. You can create and manage multiple habits across different categories such as Health, Learning, Productivity, or Personal Growth, all from a single dashboard."
        },
        {
            question: "How do streaks work?",
            answer:
                "Every time you complete a habit on a scheduled day, your streak increases. If you miss a day, the streak resets. This helps motivate consistency and encourages you to maintain daily progress."
        },
        {
            question: "Can I see my habit progress over time?",
            answer:
                "Yes. The platform provides analytics and visual insights so you can review your habit performance over the last 90 days and understand trends in your consistency."
        },
        {
            question: "Will my data sync across devices?",
            answer:
                "Yes. Once you log in, your habits and progress are securely stored and synced so you can access them from any device."
        }
    ];

    return (
        <>
            {/* Hero Section */}
            <HeroSection />

            {/* Main Services */}
            <section className="relative overflow-hidden py-12 sm:py-16 z-10">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className='flex items-center gap-20 max-lg:flex-col'>
                        <div>
                            <div className='space-y-4'>
                                <p className='text-primary text-sm font-medium uppercase'>Habit Tracking</p>
                                <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>Build Consistency Every Day</h2>
                                <p className='text-muted-foreground text-lg'>
                                    Stay accountable and develop better routines with simple habit tracking,
                                    powerful streaks, and insights that help you stay consistent every day.
                                </p>
                            </div>

                            <ul className='mt-11 space-y-6 text-lg font-medium'>
                                {MainService.map((feature, index) => (
                                    <li key={index} className='flex gap-2'>
                                        <CircleCheckIcon className='mt-0.75 size-5' />
                                        <span>{feature.title}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className='shrink-0'>
                            <img
                                src='https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/social-proof/image-1.png'
                                alt='Social Widget'
                                className='w-142 object-contain dark:hidden'
                            />
                            <img
                                src='https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/social-proof/image-1-dark.png'
                                alt='Social Widget'
                                className='hidden w-142 object-contain dark:inline-block'
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-10 sm:py-32 relative z-10">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center animate-slide-up">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl animate-slide-up">
                            Everything You Need to Build Better Habits
                        </h2>
                        <p className="mt-6 text-lg leading-8 text-muted-foreground animate-slide-up animate-delay-100">
                            Track daily habits, maintain streaks, and gain insights into your progress - all in one beautifully simple platform.
                        </p>
                    </div>

                    <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-slide-up animate-delay-200">
                        {features.map((feature, index) => {
                            const Icon = feature.icon
                            return (
                                <Card key={feature.title} className="relative overflow-hidden hover-lift glass-effect group">
                                    <CardHeader>
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground group-hover:scale-110 transition-transform duration-300">
                                            <Icon className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                                        </div>
                                        <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">{feature.title}</CardTitle>
                                        <CardDescription className="group-hover:text-foreground/80 transition-colors duration-300">{feature.description}</CardDescription>
                                    </CardHeader>
                                    <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </Card>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="relative overflow-hidden py-12 sm:py-16 z-10">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    {/* FAQ Header */}
                    <div className='mb-12 space-y-4 text-center sm:mb-16 lg:mb-24'>
                        <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>Need Help? We&apos;ve Got Answers</h2>
                        <p className='text-muted-foreground text-xl'>
                            Explore Our Most Commonly Asked Questions and Find the Information You Need.
                        </p>
                    </div>

                    <Accordion type='single' collapsible className='w-full' defaultValue='item-1'>
                        {faqItems.map((item, index) => (
                            <AccordionItem key={index} value={`item-${index + 1}`}>
                                <AccordionTrigger className='text-lg'>{item.question}</AccordionTrigger>
                                <AccordionContent className='text-muted-foreground'>{item.answer}</AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative overflow-hidden py-12 sm:py-16 z-10">

                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <Card className='shadow-none'>
                        <CardContent>
                            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2 h-[445px]'>
                                {/* Left Column - Image */}
                                <div className='relative sm:h-80 lg:h-auto'>
                                    <Image
                                        src='/reading.jpg'
                                        fill
                                        alt='reading'
                                        className='h-full w-full rounded-lg object-cover'
                                    />
                                </div>

                                {/* Right Column - Content */}
                                <Card className='bg-muted rounded-lg border-0 shadow-none'>
                                    <CardContent className='flex h-full flex-col justify-between gap-4'>
                                        <h2 className='text-xl leading-tight font-semibold lg:text-2xl'>
                                            Start building habits that shape a better version of you.
                                        </h2>
                                        <div>
                                            <p className='text-muted-foreground mb-3 text-base'>
                                                Join thousands of people improving their routines every day. Track habits, build streaks,
                                                and stay motivated with powerful insights and a beautifully simple experience.
                                            </p>
                                            {/* Email Form */}
                                            <form className='gap-3 py-1 max-sm:space-y-2 sm:flex sm:flex-row'>
                                                <Input type='email' placeholder='Your email' className='bg-background h-10 flex-1 text-base' />
                                                <Button size='lg' className='rounded-lg text-base max-sm:w-full' type='submit'>
                                                    Get Started
                                                </Button>
                                            </form>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

        </>
    );
}
