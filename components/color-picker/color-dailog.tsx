import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import React from "react";
import { ColorPicker } from "./colorPicker";

export function ColorPickerDialog({
    value, onChange
}: {
    value: string;
    onChange: (color: string) => void;
}) {
    const [open, setOpen] = React.useState(false);
    // const [color, setColor] = React.useState("#FFFFFF");
    return (
        <Dialog open={open} onOpenChange={(e) => setOpen(e)}>
            <DialogTrigger asChild>
                {/* <Button variant="outline">Select Color</Button> */}
                <Button variant="outline" className="min-w-37.5 gap-3">
                    {value ? (
                        <>
                            <div className="size-4 rounded" style={{ backgroundColor: value }} />
                            Select Color
                        </>
                    ) : (
                        "Select"
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Select a color</DialogTitle>
                    <DialogDescription>
                        Choose a color that vibes with your style.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-center">

                    <ColorPicker
                        value={value}
                        onChange={(color) => {
                            onChange(color);
                        }}
                    />
                </div>
                <DialogFooter className="sm:justify-end">
                    <DialogClose asChild>
                        <Button type="button">Done</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
