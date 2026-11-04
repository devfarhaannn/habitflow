import { Users, MessageCircle, Trophy, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
    {
        icon: Users,
        title: "Connect with people",
        description: "Meet others who are building better habits.",
    },
    {
        icon: Trophy,
        title: "Share achievements",
        description: "Celebrate your consistency and milestones.",
    },
    {
        icon: MessageCircle,
        title: "Share experiences",
        description: "Exchange ideas, motivation and helpful tips.",
    },
    {
        icon: Heart,
        title: "Stay motivated",
        description: "Build a positive environment for personal growth.",
    },
];

export default function CommunityPage() {
    return (
        <div className="space-y-6 p-4 md:p-6">
            <div>
                <h1 className="text-2xl font-semibold">Community</h1>
                <p className="text-sm text-muted-foreground">
                    Grow together and celebrate consistency.
                </p>
            </div>

            <div className="rounded-xl border bg-card p-8 text-center">
                <Users className="mx-auto mb-4 size-12 text-primary" />
                <h2 className="text-xl font-semibold">A community is coming soon!</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                    We're preparing a space where HabitFlow users can connect,
                    share progress and motivate one another.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {features.map((feature) => (
                    <Card key={feature.title}>
                        <CardContent className="flex gap-4 p-5">
                            <feature.icon className="size-6 shrink-0 text-primary" />
                            <div>
                                <h3 className="font-semibold">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {feature.description}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}