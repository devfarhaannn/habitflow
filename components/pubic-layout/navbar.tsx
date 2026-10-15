"use client"
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuGroup,
    DropdownMenuPortal,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
    Moon,
    Sun,
    User,
    Settings,
    LogOut,
    GalleryVerticalEnd,
    Bell,
    MenuIcon,
    TwitterIcon,
    GithubIcon,
    LinkedinIcon
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import * as React from "react"

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { useAuth } from '@/hooks/useAuth'

export function Navbar() {
    const { theme, setTheme } = useTheme()
    const { logOut } = useAuth();
    const userData = useSession();
    const user = userData?.data?.user;

    return (
        <header className="sticky top-0 z-50 w-full pt-4">
            <div className="flex h-14 items-center px-4 justify-between">
                <div className="flex items-center gap-4 animate-slide-in-left">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground group-hover:scale-110 transition-transform duration-300 animate-pulse-glow">
                            <GalleryVerticalEnd className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                        </div>
                        <span className="font-semibold group-hover:text-primary transition-colors duration-300">HabitKit</span>
                    </Link>
                </div>

                <div className='animate-slide-in-left hidden lg:block absolute left-1/2 -translate-x-1/2'>
                    <Navigation />
                </div>


                <div className="flex items-center justify-end gap-4 animate-slide-in-left animate-delay-100">

                    {/* notification popover */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 hover:text-primary transition-all duration-300 group">
                                <Bell className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                                <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs animate-pulse-glow">
                                    3
                                </Badge>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" align="center">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="leading-none font-medium">Notifications</h4>
                                    <p className="text-muted-foreground text-sm">
                                        Get notified when a new problem is posted
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    <div className=" items-center gap-4">
                                        No notifications for now
                                    </div>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* theme button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="hover:bg-primary/10 hover:text-primary transition-all duration-300 hidden lg:flex"
                    >
                        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100" />
                    </Button>

                    {/* github button */}
                    <Button asChild className="hover-lift animate-pulse-glow hidden lg:block">
                        <Link href="https://github.com/SajalDBansal/habitkit">Github</Link>
                    </Button>

                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:scale-110 transition-transform duration-300">
                                    <Avatar className="h-8 w-8 hover-lift dark:bg-white/20 dark:text-primary">
                                        <AvatarImage src={user.image || "/avatar.png"} alt={user?.name ?? undefined} />
                                        <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 glass-effect animate-scale-in" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.name}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild className="hover:bg-primary/10 hover:text-primary transition-colors duration-200">
                                    <Link href="/settings" className="cursor-pointer">
                                        <User className="mr-2 h-4 w-4" />
                                        Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="hover:bg-primary/10 hover:text-primary transition-colors duration-200">
                                    <Link href="/settings" className="cursor-pointer">
                                        <Settings className="mr-2 h-4 w-4" />
                                        Settings
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={logOut} className="cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors duration-200">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex gap-2">
                            <Button asChild variant="ghost" className="hover-lift">
                                <Link href="/login">Log in</Link>
                            </Button>
                            <Button asChild className="hover-lift animate-pulse-glow">
                                <Link href="/signup">Sign up</Link>
                            </Button>
                        </div>
                    )}

                    <div className='block lg:hidden'>
                        <Dropdown />
                    </div>
                </div>
            </div>
        </header>
    )
}

const components: { title: string; href: string; description: string }[] = [
    {
        title: "Habits",
        href: "/habits",
        description:
            "Track and build positive daily habits. Stay consistent and monitor your progress over time.",
    },
    {
        title: "Analytics",
        href: "/analytics",
        description:
            "Visualize your activity and performance with detailed insights and statistics.",
    },
    {
        title: "Calender",
        href: "/calender",
        description:
            "Plan and organize your schedule. View and manage upcoming events and tasks.",
    },
    {
        title: "Onboarding",
        href: "/onboarding",
        description:
            "Get started quickly with a guided setup to personalize your experience.",
    },
    {
        title: "Reminders",
        href: "/reminder",
        description:
            "Set reminders for important tasks and never miss deadlines or commitments.",
    },
    {
        title: "Community",
        href: "/community",
        description:
            "Connect with others, share ideas, and collaborate within the community.",
    },
];

export function Navigation() {
    return (
        <NavigationMenu viewport={false}>
            <NavigationMenuList>

                <NavigationMenuItem>
                    <NavigationMenuTrigger>Home</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                            <li className="row-span-3">
                                <NavigationMenuLink asChild>
                                    <a
                                        className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline outline-hidden select-none focus:shadow-md"
                                        href="/"
                                    >
                                        <div className="mt-4 mb-2 text-lg font-medium">
                                            HabitKit
                                        </div>
                                        <p className="text-muted-foreground text-sm leading-tight">
                                            A platform to mark your habits and daily goals.
                                        </p>
                                    </a>
                                </NavigationMenuLink>
                            </li>
                            <ListItem href="/dashboard" title="Dashboard">
                                Manage your HabitKit account
                            </ListItem>
                            <ListItem href="/gallery" title="Gallery">
                                Explore screenshots and previews
                            </ListItem>
                            <ListItem href="/features" title="Features">
                                Get to know more about the features
                            </ListItem>
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                    <NavigationMenuTrigger>Components</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                            {components.map((component) => (
                                <ListItem
                                    key={component.title}
                                    title={component.title}
                                    href={component.href}
                                >
                                    {component.description}
                                </ListItem>
                            ))}
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                        <Link href="/documents">Docs</Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                    <NavigationMenuTrigger>Architecture</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid w-[300px] gap-4">
                            <li>
                                <NavigationMenuLink asChild>
                                    <Link href="/stack">
                                        <div className="font-medium">Know the Stack</div>
                                        <div className="text-muted-foreground">
                                            Explore the technologies and tools used to build HabitKit.
                                        </div>
                                    </Link>
                                </NavigationMenuLink>
                                <NavigationMenuLink asChild>
                                    <Link href="/architecture">
                                        <div className="font-medium">Services Architecture</div>
                                        <div className="text-muted-foreground">
                                            Understand the architecture that powers HabitKit.
                                        </div>
                                    </Link>
                                </NavigationMenuLink>
                                <NavigationMenuLink asChild>
                                    <Link href="/schema">
                                        <div className="font-medium">DataBase Schema & Models</div>
                                        <div className="text-muted-foreground">
                                            Learn about the database structure, schemas, and data models used in HabitKit.
                                        </div>
                                    </Link>
                                </NavigationMenuLink>
                            </li>
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                    <NavigationMenuTrigger>Stats</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid w-[150px] gap-4">
                            <li>
                                <NavigationMenuLink asChild>
                                    <Link href="#">Site Uptime</Link>
                                </NavigationMenuLink>
                                <NavigationMenuLink asChild>
                                    <Link href="/documents">Documentation</Link>
                                </NavigationMenuLink>
                                <NavigationMenuLink asChild>
                                    <Link href="/deployment">Deployment</Link>
                                </NavigationMenuLink>
                            </li>
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                    <NavigationMenuTrigger>Connect</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid w-[120px] gap-4">
                            <li>
                                <NavigationMenuLink asChild>
                                    <Link href="https://x.com/SAJALDUTTBANSAL" className="flex-row items-center gap-2">
                                        <TwitterIcon />
                                        Twiiter
                                    </Link>
                                </NavigationMenuLink>
                                <NavigationMenuLink asChild>
                                    <Link href="https://github.com/SajalDBansal" className="flex-row items-center gap-2">
                                        <GithubIcon />
                                        Github
                                    </Link>
                                </NavigationMenuLink>
                                <NavigationMenuLink asChild>
                                    <Link href="https://www.linkedin.com/in/sajalduttbansal/" className="flex-row items-center gap-2">
                                        <LinkedinIcon />
                                        Linked In
                                    </Link>
                                </NavigationMenuLink>
                            </li>
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    )
}

function ListItem({
    title,
    children,
    href,
    ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
    return (
        <li {...props}>
            <NavigationMenuLink asChild>
                <Link href={href}>
                    <div className="text-sm leading-none font-medium">{title}</div>
                    <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                        {children}
                    </p>
                </Link>
            </NavigationMenuLink>
        </li>
    )
}


function Dropdown() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <MenuIcon className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Home</DropdownMenuLabel>
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        Dashboard
                        <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        Habits
                        <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        Analytics
                        <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        Community
                        <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem>Components</DropdownMenuItem>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>Connect</DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem>Twitter</DropdownMenuItem>
                                <DropdownMenuItem>LinkedIn</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Email</DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuItem>
                        New Team
                        <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Docs</DropdownMenuItem>
                <DropdownMenuItem>Architecture</DropdownMenuItem>
                <DropdownMenuItem>Stats</DropdownMenuItem>
                <DropdownMenuItem disabled>API</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    Settings
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}