"use client";

import { useState } from "react";
import {
    Bell,
    BellOff,
    CalendarDays,
    Clock,
    Pencil,
    Plus,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { IconRenderer } from "@/components/icon-picker/icon-picker";

type Habit = {
    id: string;
    title: string;
    color: string;
    icon: string;
};

type Reminder = {
    id: string;
    userId: string;
    habitId: string;
    time: string | Date;
    daysOfWeek: number[];
    enabled: boolean;
    habit: Habit;
};

type Props = {
    userId: string;
    habits: Habit[];
    initialReminders: Reminder[];
};

const WEEKDAYS = [
    { value: 0, short: "Sun", full: "Sunday" },
    { value: 1, short: "Mon", full: "Monday" },
    { value: 2, short: "Tue", full: "Tuesday" },
    { value: 3, short: "Wed", full: "Wednesday" },
    { value: 4, short: "Thu", full: "Thursday" },
    { value: 5, short: "Fri", full: "Friday" },
    { value: 6, short: "Sat", full: "Saturday" },
];

// The API stores time as a UTC time-of-day.
// Read UTC values so the displayed time doesn't shift with the browser timezone.
function getTimeValue(time: string | Date) {
    const date = new Date(time);

    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
}

function formatTime(time: string | Date) {
    const value = getTimeValue(time);
    const [hours, minutes] = value.split(":").map(Number);

    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;

    return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function ReminderDashboard({
    userId,
    habits,
    initialReminders,
}: Props) {
    const [reminders, setReminders] = useState(initialReminders);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
    const [saving, setSaving] = useState(false);

    const [habitId, setHabitId] = useState("");
    const [time, setTime] = useState("08:00");
    const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 0]);

    const [deleteTarget, setDeleteTarget] = useState<Reminder | null>(null);
    const [deleting, setDeleting] = useState(false);

    function resetForm() {
        setHabitId(habits[0]?.id ?? "");
        setTime("08:00");
        setDays([0, 1, 2, 3, 4, 5, 6]);
        setEditingReminder(null);
    }

    function openCreateDialog() {
        resetForm();
        setDialogOpen(true);
    }

    function openEditDialog(reminder: Reminder) {
        setEditingReminder(reminder);
        setHabitId(reminder.habitId);
        setTime(getTimeValue(reminder.time));
        setDays(reminder.daysOfWeek);
        setDialogOpen(true);
    }

    function toggleDay(day: number) {
        setDays((current) =>
            current.includes(day)
                ? current.filter((item) => item !== day)
                : [...current, day].sort()
        );
    }

    async function saveReminder() {
        if (!habitId) {
            toast.error("Please select a habit.");
            return;
        }

        if (!time) {
            toast.error("Please select a reminder time.");
            return;
        }

        if (days.length === 0) {
            toast.error("Please select at least one day.");
            return;
        }

        setSaving(true);

        try {
            const isEditing = Boolean(editingReminder);

            const url = isEditing
                ? `/api/${userId}/reminders/${editingReminder!.id}`
                : `/api/${userId}/reminders`;

            const response = await fetch(url, {
                method: isEditing ? "PATCH" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    habitId,
                    time,
                    daysOfWeek: days,
                }),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => null);
                throw new Error(error?.error || "Could not save reminder.");
            }

            const selectedHabit = habits.find((habit) => habit.id === habitId);

            if (isEditing && editingReminder && selectedHabit) {
                setReminders((current) =>
                    current.map((reminder) =>
                        reminder.id === editingReminder.id
                            ? {
                                ...reminder,
                                habitId,
                                time: `1970-01-01T${time}:00.000Z`,
                                daysOfWeek: days,
                                habit: selectedHabit,
                            }
                            : reminder
                    )
                );
            } else {
                const data = await response.json();

                const newReminder = data.reminder ?? data;

                if (newReminder?.id && selectedHabit) {
                    setReminders((current) => [
                        ...current,
                        {
                            ...newReminder,
                            habit: newReminder.habit ?? selectedHabit,
                        },
                    ]);
                }
            }

            toast.success(isEditing ? "Reminder updated." : "Reminder created.");
            setDialogOpen(false);
            resetForm();
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Something went wrong."
            );
        } finally {
            setSaving(false);
        }
    }

    async function toggleReminder(reminder: Reminder) {
        try {
            const response = await fetch(
                `/api/${userId}/reminders/${reminder.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        enabled: !reminder.enabled,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Could not update reminder.");
            }

            setReminders((current) =>
                current.map((item) =>
                    item.id === reminder.id
                        ? { ...item, enabled: !item.enabled }
                        : item
                )
            );

            toast.success(
                reminder.enabled ? "Reminder disabled." : "Reminder enabled."
            );
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Something went wrong."
            );
        }
    }

    async function deleteReminder() {
        if (!deleteTarget) return;

        setDeleting(true);

        try {
            const response = await fetch(
                `/api/${userId}/reminders/${deleteTarget.id}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                throw new Error("Could not delete reminder.");
            }

            setReminders((current) =>
                current.filter((item) => item.id !== deleteTarget.id)
            );

            toast.success("Reminder deleted.");
            setDeleteTarget(null);
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Something went wrong."
            );
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div className="space-y-6 px-4 md:px-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Reminders
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Stay consistent with your habits by setting reminders.
                    </p>
                </div>

                <Button onClick={openCreateDialog} disabled={habits.length === 0}>
                    <Plus className="mr-2 size-4" />
                    Create Reminder
                </Button>
            </div>

            {/* Summary */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardContent className="flex items-center gap-3 p-5">
                        <div className="rounded-lg bg-primary/10 p-3 text-primary">
                            <Bell className="size-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Total reminders
                            </p>
                            <p className="text-2xl font-semibold">
                                {reminders.length}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center gap-3 p-5">
                        <div className="rounded-lg bg-green-500/10 p-3 text-green-600">
                            <Bell className="size-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Active reminders
                            </p>
                            <p className="text-2xl font-semibold">
                                {reminders.filter((item) => item.enabled).length}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center gap-3 p-5">
                        <div className="rounded-lg bg-muted p-3">
                            <BellOff className="size-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Disabled reminders
                            </p>
                            <p className="text-2xl font-semibold">
                                {reminders.filter((item) => !item.enabled).length}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Reminder list */}
            <div className="space-y-4">
                <div>
                    <h2 className="text-lg font-semibold">Your reminders</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage the schedule for each of your habits.
                    </p>
                </div>

                {reminders.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center gap-3 py-14 text-center">
                            <div className="rounded-full bg-muted p-4">
                                <Bell className="size-7 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold">No reminders yet</h3>
                                <p className="text-sm text-muted-foreground">
                                    Create your first reminder to stay on track.
                                </p>
                            </div>
                            <Button
                                onClick={openCreateDialog}
                                disabled={habits.length === 0}
                            >
                                <Plus className="mr-2 size-4" />
                                Create Reminder
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {reminders.map((reminder) => (
                            <Card key={reminder.id}>
                                <CardContent className="space-y-4 p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div
                                                className="flex size-12 shrink-0 items-center justify-center rounded-xl"
                                                style={{
                                                    backgroundColor: reminder.habit.color,
                                                }}
                                            >
                                                <IconRenderer
                                                    icon={reminder.habit.icon}
                                                    className="size-7 text-foreground"
                                                />
                                            </div>

                                            <div className="min-w-0">
                                                <h3 className="truncate font-semibold">
                                                    {reminder.habit.title}
                                                </h3>
                                                <p className="text-xs text-muted-foreground">
                                                    Habit reminder
                                                </p>
                                            </div>
                                        </div>

                                        <span
                                            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${reminder.enabled
                                                ? "bg-green-500/10 text-green-600"
                                                : "bg-muted text-muted-foreground"
                                                }`}
                                        >
                                            {reminder.enabled ? "Active" : "Disabled"}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Clock className="size-4 text-muted-foreground" />
                                        <span className="text-2xl font-semibold">
                                            {formatTime(reminder.time)}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <CalendarDays className="size-4" />
                                            Repeat
                                        </div>

                                        <div className="flex flex-wrap gap-1.5">
                                            {WEEKDAYS.map((day) => (
                                                <span
                                                    key={day.value}
                                                    className={`rounded-md px-2 py-1 text-xs ${reminder.daysOfWeek.includes(day.value)
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-muted text-muted-foreground"
                                                        }`}
                                                >
                                                    {day.short}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border-t pt-3">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => toggleReminder(reminder)}
                                        >
                                            {reminder.enabled ? (
                                                <>
                                                    <BellOff className="mr-2 size-4" />
                                                    Disable
                                                </>
                                            ) : (
                                                <>
                                                    <Bell className="mr-2 size-4" />
                                                    Enable
                                                </>
                                            )}
                                        </Button>

                                        <div className="flex gap-2">
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                onClick={() => openEditDialog(reminder)}
                                                aria-label="Edit reminder"
                                            >
                                                <Pencil className="size-4" />
                                            </Button>

                                            <Button
                                                size="icon"
                                                variant="outline"
                                                onClick={() => setDeleteTarget(reminder)}
                                                aria-label="Delete reminder"
                                            >
                                                <Trash2 className="size-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {habits.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    Create a habit first before setting a reminder.
                </p>
            )}

            {/* Create / Edit dialog */}
            <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) resetForm();
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingReminder ? "Edit Reminder" : "Create Reminder"}
                        </DialogTitle>
                        <DialogDescription>
                            Choose a habit, time and the days you want to be reminded.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 py-2">
                        {/* Habit */}
                        <div className="space-y-2">
                            <label
                                htmlFor="reminder-habit"
                                className="text-sm font-medium"
                            >
                                Select habit
                            </label>

                            <select
                                id="reminder-habit"
                                value={habitId}
                                onChange={(event) => setHabitId(event.target.value)}
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                            >
                                <option value="" disabled>
                                    Choose a habit
                                </option>

                                {habits.map((habit) => (
                                    <option key={habit.id} value={habit.id}>
                                        {habit.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Time */}
                        <div className="space-y-2">
                            <label
                                htmlFor="reminder-time"
                                className="text-sm font-medium"
                            >
                                Reminder time
                            </label>

                            <input
                                id="reminder-time"
                                type="time"
                                value={time}
                                onChange={(event) => setTime(event.target.value)}
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                            />
                        </div>

                        {/* Days */}
                        <div className="space-y-3">
                            <p className="text-sm font-medium">Repeat on</p>

                            <div className="grid grid-cols-7 gap-1.5">
                                {WEEKDAYS.map((day) => {
                                    const selected = days.includes(day.value);

                                    return (
                                        <button
                                            key={day.value}
                                            type="button"
                                            onClick={() => toggleDay(day.value)}
                                            className={`rounded-md border py-2 text-xs font-medium transition-colors ${selected
                                                ? "border-primary bg-primary text-primary-foreground"
                                                : "border-input bg-background text-muted-foreground hover:bg-muted"
                                                }`}
                                            aria-pressed={selected}
                                            title={day.full}
                                        >
                                            {day.short}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="button"
                            onClick={saveReminder}
                            disabled={saving || habits.length === 0}
                        >
                            {saving
                                ? "Saving..."
                                : editingReminder
                                    ? "Save Changes"
                                    : "Create Reminder"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog
                open={!!deleteTarget}
                onOpenChange={(open) => {
                    if (!open && !deleting) {
                        setDeleteTarget(null);
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Reminder?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the reminder for{" "}
                            <span className="font-semibold text-foreground">
                                {deleteTarget?.habit.title}
                            </span>
                            ? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteTarget(null)}
                            disabled={deleting}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={deleteReminder}
                            disabled={deleting}
                        >
                            {deleting ? "Deleting..." : "Delete Reminder"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}