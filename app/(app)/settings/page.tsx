
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
    User,
    Save,
    Globe,
    Palette,
    Lock,
    Eye,
    EyeOff,
    ShieldCheck,
    Trash2,
    AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

import { signOut } from "next-auth/react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
    const { user, loading } = useAuth();
    const { update } = useSession();

    const [name, setName] = useState(user?.name ?? "");
    const [timezone, setTimezone] = useState(user?.timezone ?? "UTC");
    const [loadedUserId, setLoadedUserId] = useState<string | null>(null);

    // Synchronize form values when a different user loads.
    if (user?.id && user.id !== loadedUserId) {
        setLoadedUserId(user.id);
        setName(user.name ?? "");
        setTimezone(user.timezone ?? "UTC");
    }

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [changingPassword, setChangingPassword] = useState(false);
    const [showPasswords, setShowPasswords] = useState(false);

    const [deleting, setDeleting] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState("");

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

    async function handleDeleteAccount() {
        if (deleteConfirmation !== "DELETE") {
            toast.error("Please type DELETE to confirm.");
            return;
        }

        try {
            setDeleting(true);

            const response = await fetch("/api/profile/delete", {
                method: "DELETE",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to delete account.");
            }

            toast.success("Your account has been deleted.");

            await signOut({ callbackUrl: "/" });
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Something went wrong."
            );
        } finally {
            setDeleting(false);
        }
    }

    if (loading) {
        return <div className="p-6">Loading settings...</div>;
    }

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
                        <User className="size-5" />
                        Profile Information
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
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
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
                        <Globe className="size-5" />
                        Regional Preferences
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
                        <Palette className="size-5" />
                        Appearance
                    </CardTitle>
                    <CardDescription>
                        Change the appearance of HabitFlow.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Use the theme button in the sidebar to switch between
                        Light, Dark and System modes.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="size-5" />
                        Account Security
                    </CardTitle>
                    <CardDescription>
                        Update your password to keep your account secure.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Current password
                        </label>
                        <Input
                            type={showPasswords ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            New password
                        </label>
                        <Input
                            type={showPasswords ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Confirm new password
                        </label>
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

            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="size-5" />
                        Danger Zone
                    </CardTitle>
                    <CardDescription>
                        Permanently delete your HabitFlow account and all
                        associated data.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <AlertDialog
                        onOpenChange={(open) => {
                            if (!open) setDeleteConfirmation("");
                        }}
                    >
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                <Trash2 className="mr-2 size-4" />
                                Delete Account
                            </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Are you absolutely sure?
                                </AlertDialogTitle>

                                <AlertDialogDescription>
                                    This action cannot be undone. Your account,
                                    habits, reminders, completion history, and
                                    associated data will be permanently deleted.
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Type DELETE to confirm
                                </label>

                                <Input
                                    value={deleteConfirmation}
                                    onChange={(e) =>
                                        setDeleteConfirmation(e.target.value)
                                    }
                                    placeholder="Type DELETE"
                                />
                            </div>

                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={deleting}>
                                    Cancel
                                </AlertDialogCancel>

                                <AlertDialogAction
                                    disabled={
                                        deleting || deleteConfirmation !== "DELETE"
                                    }
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleDeleteAccount();
                                    }}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    {deleting
                                        ? "Deleting..."
                                        : "Permanently Delete"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>
        </div>
    );
}
