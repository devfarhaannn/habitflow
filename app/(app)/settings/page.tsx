"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { User, Save, Globe, Palette, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SettingsPage() {
    const { user, loading } = useAuth();

    const [name, setName] = useState(user?.name ?? "");
    const [timezone, setTimezone] = useState(user?.timezone ?? "UTC");

    if (loading) return <div className="p-6">Loading settings...</div>;

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div>
                <h1 className="text-2xl font-semibold">Settings</h1>
                <p className="text-sm text-muted-foreground">
                    Manage your account and preferences.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="size-5" /> Profile Information
                    </CardTitle>
                    <CardDescription>Your account details.</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Full name</label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input value={user?.email ?? ""} disabled />
                    </div>

                    <Button disabled>
                        <Save className="mr-2 size-4" />
                        Profile editing requires a profile update API
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="size-5" /> Regional Preferences
                    </CardTitle>
                    <CardDescription>Choose your timezone.</CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                    <Input
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        placeholder="Asia/Kolkata"
                    />
                    <p className="text-xs text-muted-foreground">
                        Example: Asia/Kolkata, America/New_York, Europe/London.
                    </p>
                    <Button
                        onClick={() => toast.info("Timezone update API is not implemented yet.")}
                    >
                        Save timezone
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="size-5" /> Appearance
                    </CardTitle>
                    <CardDescription>Change the appearance of HabitFlow.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Use the theme button in the sidebar to switch between Light, Dark and System modes.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="size-5" /> Account Security
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Your account is authenticated using your configured login provider.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}