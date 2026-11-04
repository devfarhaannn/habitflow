
"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
    Database,
    Download,
    Upload,
    FileJson,
    ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DataPage() {
    const { user } = useAuth();

    const fileRef = useRef<HTMLInputElement>(null);

    const [exporting, setExporting] = useState(false);
    const [importing, setImporting] = useState(false);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    // EXPORT DATA
    async function exportData() {
        if (!user?.id) return;

        setExporting(true);

        try {
            const response = await fetch(`/api/${user.id}/data`);

            if (!response.ok) {
                throw new Error("Could not export your data.");
            }

            const backup = await response.json();

            const blob = new Blob(
                [JSON.stringify(backup, null, 2)],
                { type: "application/json" }
            );

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = `habitflow-backup-${new Date().toISOString().slice(0, 10)}.json`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            URL.revokeObjectURL(url);

            toast.success("Your backup has been downloaded.");
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Export failed."
            );
        } finally {
            setExporting(false);
        }
    }

    // SELECT BACKUP FILE
    function handleFileSelect(file?: File) {
        if (!file) return;

        if (!file.name.toLowerCase().endsWith(".json")) {
            toast.error("Please select a JSON backup file.");

            if (fileRef.current) {
                fileRef.current.value = "";
            }

            return;
        }

        setSelectedFile(file);
        setConfirmOpen(true);
    }

    // IMPORT DATA
    async function importData() {
        if (!user?.id || !selectedFile) return;

        setImporting(true);

        try {
            const content = await selectedFile.text();
            const backup = JSON.parse(content);

            const response = await fetch(`/api/${user.id}/data`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(backup),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Import failed.");
            }

            toast.success(
                `Imported ${result.imported.habits} habits and ${result.imported.reminders} reminders.`
            );

            setConfirmOpen(false);
            setSelectedFile(null);

        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Invalid backup file."
            );
        } finally {
            setImporting(false);

            if (fileRef.current) {
                fileRef.current.value = "";
            }
        }
    }

    return (
        <div className="space-y-6 p-4 md:p-6">

            {/* PAGE HEADER */}
            <div>
                <h1 className="text-2xl font-semibold">
                    Export / Import Data
                </h1>

                <p className="text-sm text-muted-foreground">
                    Keep a backup of your HabitFlow data or restore it whenever needed.
                </p>
            </div>

            {/* EXPORT CARD */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-3 text-primary">
                            <Download className="size-5" />
                        </div>

                        <div>
                            <CardTitle>Export your data</CardTitle>

                            <CardDescription>
                                Download a JSON backup of your HabitFlow account.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="rounded-lg bg-muted p-4 text-sm">
                        <p className="mb-2 font-medium">
                            Your backup includes:
                        </p>

                        <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                            <li>Habits and categories</li>
                            <li>Habit completion history</li>
                            <li>Daily progress statistics</li>
                            <li>Reminder schedules</li>
                        </ul>
                    </div>

                    <Button
                        onClick={exportData}
                        disabled={exporting}
                    >
                        <Download className="mr-2 size-4" />

                        {exporting
                            ? "Preparing backup..."
                            : "Download JSON Backup"}
                    </Button>
                </CardContent>
            </Card>

            {/* IMPORT CARD */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-3 text-primary">
                            <Upload className="size-5" />
                        </div>

                        <div>
                            <CardTitle>Import your data</CardTitle>

                            <CardDescription>
                                Restore your data from a previous HabitFlow JSON backup.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 rounded-lg border p-4">
                        <FileJson className="size-8 text-muted-foreground" />

                        <div>
                            <p className="text-sm font-medium">
                                JSON backup file
                            </p>

                            <p className="text-xs text-muted-foreground">
                                Select a backup previously exported from HabitFlow.
                            </p>
                        </div>
                    </div>

                    <input
                        ref={fileRef}
                        type="file"
                        accept=".json,application/json"
                        disabled={importing}
                        className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-primary-foreground"
                        onChange={(event) =>
                            handleFileSelect(event.target.files?.[0])
                        }
                    />

                    <p className="flex items-start gap-2 text-xs text-muted-foreground">
                        <ShieldCheck className="size-4 shrink-0" />

                        Import merges records using their IDs. Keep your original
                        backup file safe before restoring.
                    </p>

                    {importing && (
                        <p className="text-sm text-muted-foreground">
                            Importing your data...
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* DATA SECURITY CARD */}
            <Card>
                <CardContent className="flex items-center gap-3 p-5">
                    <Database className="size-5 text-muted-foreground" />

                    <div>
                        <p className="font-medium">
                            Your data, your control
                        </p>

                        <p className="text-sm text-muted-foreground">
                            Export a copy of your information whenever you need it.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* IMPORT CONFIRMATION DIALOG */}
            <AlertDialog
                open={confirmOpen}
                onOpenChange={(open) => {
                    if (!importing) {
                        setConfirmOpen(open);

                        if (!open) {
                            setSelectedFile(null);

                            if (fileRef.current) {
                                fileRef.current.value = "";
                            }
                        }
                    }
                }}
            >
                <AlertDialogContent>

                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <ShieldCheck className="size-5 text-primary" />
                            Confirm Data Import
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            Are you sure you want to import this backup into your HabitFlow account?
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-2 rounded-lg border bg-muted/50 p-4 text-sm">
                        <p className="font-medium text-foreground">
                            Before you continue:
                        </p>

                        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                            <li>
                                Existing records with matching IDs may be updated.
                            </li>

                            <li>
                                New records will be added.
                            </li>

                            <li>
                                Unrelated existing records will remain unchanged.
                            </li>

                            <li>
                                Your backup will be validated before saving.
                            </li>
                        </ul>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={importing}>
                            Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                            onClick={(event) => {
                                event.preventDefault();
                                importData();
                            }}
                            disabled={importing || !selectedFile}
                        >
                            {importing
                                ? "Importing..."
                                : "Import Backup"}
                        </AlertDialogAction>
                    </AlertDialogFooter>

                </AlertDialogContent>
            </AlertDialog>

        </div>
    );
}
