"use client";

import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GithubIcon, Globe, Instagram, Linkedin } from "lucide-react";

const SERVICES = [
    { id: "website-design", label: "Website Design" },
    { id: "ux-design", label: "UX Design" },
    { id: "content-creation", label: "Content Creation" },
    { id: "strategy", label: "Strategy & Consulting" },
] as const;

export default function ContactSection() {
    return (
        <section className="relative overflow-hidden py-12 sm:py-16 z-10">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
                    {/* Left: form */}
                    <div className="animate-slide-up">
                        <Badge variant="secondary" className="mb-3 animate-pulse-glow">
                            Get in Touch
                        </Badge>
                        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
                            Connect With Me
                        </h1>

                        <Card className="mt-8 glass-effect hover-lift">
                            <CardContent className="p-6 sm:p-8">
                                <form
                                    className="space-y-5"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        toast.success("Message queued — I’ll get back to you soon.");
                                    }}
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" placeholder="Enter your name here..." autoComplete="name" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter your Email here..."
                                            autoComplete="email"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="budget">Budget</Label>
                                        <Input id="budget" inputMode="numeric" placeholder="Enter the amount" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message</Label>
                                        <Textarea id="message" placeholder="Enter your message" className="min-h-28" />
                                    </div>

                                    <div className="space-y-3">
                                        <p className="text-sm font-medium">Services</p>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            {SERVICES.map((s) => (
                                                <div key={s.id} className="flex items-center gap-3">
                                                    <Checkbox id={s.id} />
                                                    <Label htmlFor={s.id} className="font-normal text-muted-foreground">
                                                        {s.label}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Button type="submit" size="lg" className="w-full hover-lift animate-pulse-glow">
                                        Send Message
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: profile card */}
                    <div className="animate-slide-up animate-delay-100">
                        <p className="text-muted-foreground text-lg leading-8 max-w-xl">
                            Whether you&apos;re looking for more information, have a suggestion, or need help with something,
                            we&apos;re here for you.
                        </p>

                        <Card className="mt-8 overflow-hidden glass-effect hover-lift">
                            <div className="relative aspect-4/3 w-full">
                                <Image src="/avatar-hi.png" alt="Profile photo" fill className="object-cover" priority />

                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                                    <Badge className="gap-2 px-3 py-1.5 shadow-sm">
                                        <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                                        Available for hire
                                    </Badge>
                                </div>
                            </div>

                            <CardHeader className="space-y-4">
                                <div className="text-center">
                                    <CardTitle className="text-2xl">Farhan Bhatt</CardTitle>
                                    <p className="text-muted-foreground mt-1">Full Stack Developer</p>
                                </div>

                                <div className="flex items-center justify-center gap-2">
                                    <Button asChild size="icon" variant="ghost" className="hover:bg-primary/10 hover:text-primary">
                                        <Link href="#" aria-label="Instagram">
                                            <Instagram className="h-5 w-5" />
                                        </Link>
                                    </Button>
                                    <Button asChild size="icon" variant="ghost" className="hover:bg-primary/10 hover:text-primary">
                                        <Link href="#" aria-label="Website">
                                            <Globe className="h-5 w-5" />
                                        </Link>
                                    </Button>
                                    <Button asChild size="icon" variant="ghost" className="hover:bg-primary/10 hover:text-primary">
                                        <Link href="#" aria-label="LinkedIn">
                                            <Linkedin className="h-5 w-5" />
                                        </Link>
                                    </Button>
                                    <Button asChild size="icon" variant="ghost" className="hover:bg-primary/10 hover:text-primary">
                                        <Link href="#" aria-label="GitHub">
                                            <GithubIcon className="h-5 w-5" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground opacity-80">
                                    <span>Sense</span>
                                    <span>Shemaroo</span>
                                    <span>Mercedes-Benz</span>
                                    <span>University</span>
                                    <span>Star</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    );
}


