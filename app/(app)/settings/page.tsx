"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { User, Save, Globe, Palette, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

export default function SettingsPage() {
    const { user, loading } = useAuth();
    const { update } = useSession();

    const [name, setName] = useState(user?.name ?? "");
    const [timezone, setTimezone] = useState(user?.timezone ?? "UTC");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [changingPassword, setChangingPassword] = useState(false);
    const [showPasswords, setShowPasswords] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name ?? "");
            setTimezone(user.timezone ?? "UTC");
        }
    }, [user]);

    const [saving, setSaving] = useState(false);

    async function handleSaveProfile() {
        try {
            setSaving(true);

            const response = await fetch("/api/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, timezone }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to update profile");
            }

            await update();

            setName(data.user.name);
            setTimezone(data.user.timezone);

            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Something went wrong"
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleChangePassword() {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Please fill in all password fields.");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("New password must be at least 8 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }

        try {
            setChangingPassword(true);

            const response = await fetch("/api/profile/password", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to change password.");
            }

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            toast.success("Password changed successfully!");
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Something went wrong."
            );
        } finally {
            setChangingPassword(false);
        }
    }

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
                    <div className="flex items-center gap-4">
                        <Avatar className="size-20">
                            <AvatarImage
                                src={user?.image ?? ""}
                                alt={user?.name ?? "Profile"}
                            />
                            <AvatarFallback className="text-xl font-semibold">
                                {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                            </AvatarFallback>
                        </Avatar>

                        <div>
                            <p className="font-medium">{user?.name ?? "User"}</p>
                            <p className="text-sm text-muted-foreground">
                                Your profile picture
                            </p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Full name</label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input value={user?.email ?? ""} disabled />
                    </div>

                    <Button onClick={handleSaveProfile} disabled={saving}>
                        <Save className="mr-2 size-4" />
                        {saving ? "Saving..." : "Save Changes"}
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
                    <CardDescription>
                        Update your password to keep your account secure.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Current password</label>
                        <Input
                            type={showPasswords ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">New password</label>
                        <Input
                            type={showPasswords ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Confirm new password</label>
                        <Input
                            type={showPasswords ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                        />
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPasswords((prev) => !prev)}
                    >
                        {showPasswords ? (
                            <EyeOff className="mr-2 size-4" />
                        ) : (
                            <Eye className="mr-2 size-4" />
                        )}
                        {showPasswords ? "Hide passwords" : "Show passwords"}
                    </Button>

                    <Button
                        onClick={handleChangePassword}
                        disabled={changingPassword}
                    >
                        <Lock className="mr-2 size-4" />
                        {changingPassword ? "Updating..." : "Change Password"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}