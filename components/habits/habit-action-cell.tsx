
import { habitBackendDTO } from "@/types/types";
import { Row } from "@tanstack/react-table";
import React from "react";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { IconDotsVertical } from "@tabler/icons-react";
import { HabitUpdaterViewer } from "./habit-updater";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../ui/alert-dialog";

export function ActionCell({
    row,
    categories,
}: {
    row: Row<habitBackendDTO[number]>;
    categories: { id: string; title: string }[];
}) {
    const [open, setOpen] = React.useState(false);
    const [deleteOpen, setDeleteOpen] = React.useState(false);
    const [deleting, setDeleting] = React.useState(false);
    const [copying, setCopying] = React.useState(false);

    const router = useRouter();
    const { user } = useAuth();

    async function handleDeleteHabit() {
        if (!user?.id) {
            toast.error("Please login to delete this habit");
            return;
        }

        try {
            setDeleting(true);

            const response = await fetch(
                `/api/${user.id}/habit/${row.original.id}`,
                {
                    method: "DELETE",
                }
            );

            const responseText = await response.text();

            let result: { error?: string; message?: string } = {};

            if (responseText) {
                try {
                    result = JSON.parse(responseText);
                } catch {
                    throw new Error("Invalid response received from server");
                }
            }

            if (!response.ok) {
                throw new Error(result.error || "Failed to delete habit");
            }

            toast.success("Habit deleted successfully");

            setDeleteOpen(false);
            router.refresh();

        } catch (error) {
            console.error("Delete habit error:", error);

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Something went wrong"
            );
        } finally {
            setDeleting(false);
        }
    }

    async function handleCopyHabit() {
        if (!user?.id) {
            toast.error("Please login to copy this habit");
            return;
        }

        try {
            setCopying(true);

            const response = await fetch(`/api/${user.id}/habit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: `Copy of ${row.original.title}`,
                    description: row.original.description,
                    icon: row.original.icon,
                    color: row.original.color,
                    goal: row.original.goalType,
                    target: row.original.targetPerDay,
                    categoryId: row.original.categoryId,
                    startDate: new Date().toISOString(),
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to copy habit");
            }

            toast.success("Habit copied successfully");
            router.refresh();

        } catch (error) {
            console.error("Copy habit error:", error);

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Something went wrong"
            );
        } finally {
            setCopying(false);
        }
    }
    async function handleToggleFavorite() {
        if (!user?.id) {
            toast.error("Please login first");
            return;
        }

        try {
            const response = await fetch(
                `/api/${user.id}/habit/${row.original.id}`,
                {
                    method: "POST",
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to update favorite");
            }

            toast.success(result.message);
            router.refresh();

        } catch (error) {
            console.error("Favorite error:", error);

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Something went wrong"
            );
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                        size="icon"
                    >
                        <IconDotsVertical />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem
                        onSelect={() => setOpen(true)}
                    >
                        Edit
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onSelect={() => handleCopyHabit()}
                        disabled={copying}
                    >
                        {copying ? "Copying..." : "Make a copy"}
                    </DropdownMenuItem>

                    <DropdownMenuItem onSelect={handleToggleFavorite}>
                        {row.original.isFavorite
                            ? "Remove from favorites"
                            : "Favorite"}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => setDeleteOpen(true)}
                    >
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Edit Habit */}
            <HabitUpdaterViewer
                item={row.original}
                open={open}
                onOpenChange={setOpen}
                categories={categories}
            />

            {/* Delete Confirmation */}
            <AlertDialog
                open={deleteOpen}
                onOpenChange={(value) => {
                    if (!deleting) setDeleteOpen(value);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete this habit?
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            Are you sure you want to delete
                            <strong> {row.original.title}</strong>?
                            This action cannot be undone. Its associated
                            completion history and reminders may also be deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>
                            Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                            onClick={(event) => {
                                event.preventDefault();
                                handleDeleteHabit();
                            }}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? "Deleting..." : "Delete Habit"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
