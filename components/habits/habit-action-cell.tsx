import { habitBackendDTO } from "@/types/types";
import { Row } from "@tanstack/react-table";
import React from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { IconDotsVertical } from "@tabler/icons-react";
import { HabitUpdaterViewer } from "./habit-updater";

export function ActionCell({ row, categories }: {
    row: Row<habitBackendDTO[number]>;
    categories: { id: string; title: string }[]
}) {
    const [open, setOpen] = React.useState(false)

    return (<>
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
                    onSelect={() => { setOpen(true) }}
                >
                    Edit
                </DropdownMenuItem>
                <DropdownMenuItem>Make a copy</DropdownMenuItem>
                <DropdownMenuItem>Favorite</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

        <HabitUpdaterViewer
            item={row.original}
            open={open}
            onOpenChange={setOpen}
            categories={categories}
        />
    </>)
}