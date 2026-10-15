import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SwatchBookIcon, SearchIcon, StarIcon, SmartphoneIcon, LockKeyholeIcon, ShieldBanIcon } from 'lucide-react'

const featuresList = [
    {
        icon: SwatchBookIcon,
        title: "Simple Habit Creation",
        description:
            "Create and customize habits easily with a clean and intuitive interface. Define daily, weekly, or custom routines to build consistent habits that fit your lifestyle.",
        cardBorderColor: "border-primary/40 hover:border-primary",
        avatarTextColor: "text-primary",
        avatarBgColor: "bg-primary/10",
    },
    {
        icon: ShieldBanIcon,
        title: "Private & Secure Data",
        description:
            "Your habit data and personal information are securely stored. We use modern security practices to ensure that your progress and account details remain protected.",
        cardBorderColor:
            "border-green-600/40 hover:border-green-600 dark:border-green-400/40 dark:hover:border-green-400",
        avatarTextColor: "text-green-600 dark:text-green-400",
        avatarBgColor: "bg-green-600/10 dark:bg-green-400/10",
    },
    {
        icon: SearchIcon,
        title: "Habit Insights & Analytics",
        description:
            "Track your progress with clear statistics and insights. View streaks, completion rates, and trends to understand your habits and stay motivated.",
        cardBorderColor:
            "border-amber-600/40 hover:border-amber-600 dark:border-amber-400/40 dark:hover:border-amber-400",
        avatarTextColor: "text-amber-600 dark:text-amber-400",
        avatarBgColor: "bg-amber-600/10 dark:bg-amber-400/10",
    },
    {
        icon: StarIcon,
        title: "Streaks & Motivation",
        description:
            "Stay motivated by maintaining daily streaks and celebrating milestones. Habit Kit helps you stay consistent and build positive routines over time.",
        cardBorderColor: "border-destructive/40 hover:border-destructive",
        avatarTextColor: "text-destructive",
        avatarBgColor: "bg-destructive/10",
    },
    {
        icon: SmartphoneIcon,
        title: "Cross-Device Access",
        description:
            "Access your habits from any device. Whether on desktop, tablet, or mobile, your progress stays synced so you can track habits anytime.",
        cardBorderColor:
            "border-sky-600/40 hover:border-sky-600 dark:border-sky-400/40 dark:hover:border-sky-400",
        avatarTextColor: "text-sky-600 dark:text-sky-400",
        avatarBgColor: "bg-sky-600/10 dark:bg-sky-400/10",
    },
    {
        icon: LockKeyholeIcon,
        title: "Reliable Data Protection",
        description:
            "Your habit history and progress are stored safely with secure authentication and reliable infrastructure, ensuring your data is always accessible and protected.",
        cardBorderColor: "border-primary/40 hover:border-primary",
        avatarTextColor: "text-primary",
        avatarBgColor: "bg-primary/10",
    },
]

export default function FeaturesPage() {
    return (
        <section className='py-8 sm:py-16 lg:py-24'>
            <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                {/* Header */}
                <div className='mb-12 space-y-4 sm:mb-16 lg:mb-24'>
                    <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>Discover the Exclusive Perks Today</h2>
                    <p className='text-muted-foreground text-xl'>
                        Explore key features designed to enhance your shopping experience with intuitive navigation, robust
                        security, and seamless functionality.
                    </p>
                </div>

                <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                    {featuresList.map((features, index) => (
                        <Card key={index} className={cn('shadow-none transition-colors duration-300', features.cardBorderColor)}>
                            <CardContent>
                                <Avatar className='mb-6 size-10 rounded-md'>
                                    <AvatarFallback
                                        className={cn('rounded-md [&>svg]:size-6', features.avatarBgColor, features.avatarTextColor)}
                                    >
                                        <features.icon />
                                    </AvatarFallback>
                                </Avatar>
                                <h6 className='mb-2 text-lg font-semibold'>{features.title}</h6>
                                <p className='text-muted-foreground'>{features.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}