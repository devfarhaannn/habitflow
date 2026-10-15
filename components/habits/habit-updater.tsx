import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { editHabitSchema, HabitPageSchema } from "@/types/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "../ui/drawer";
import { IconRenderer } from "../icon-picker/icon-picker";
import { Form, FormControl } from "../ui/form";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { IconArchive, IconCircleCheckFilled, IconLoader } from "@tabler/icons-react";
import { IconPickerDialog } from "../icon-picker/new-picker";
import { ColorPickerDialog } from "../color-picker/color-dailog";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { Checkbox } from "../ui/checkbox";

export function HabitUpdaterViewer({ item, open, categories, onOpenChange }: {
    item: z.infer<typeof HabitPageSchema>,
    open: boolean,
    categories: { id: string; title: string }[];
    onOpenChange: React.Dispatch<React.SetStateAction<boolean>>
}) {
    const isMobile = useIsMobile()
    const { user } = useAuth();

    const form = useForm<z.infer<typeof editHabitSchema>>({
        resolver: zodResolver(editHabitSchema),
        defaultValues: {
            id: item.id,
            title: item.title,
            description: item.description,
            goalType: item.goalType,
            targetPerDay: item.targetPerDay,
            status: item.status,
            categoryId: item.categoryId,
            icon: item.icon,
            color: item.color,
            endDate: item.endDate,
        }
    })

    function onSubmit(values: z.infer<typeof editHabitSchema>) {
        const changedValues: Partial<typeof values> = {};

        (Object.keys(values) as Array<keyof typeof values>).forEach((key) => {
            const newValue = values[key];
            const oldValue = item[key];

            // Skip undefined automatically
            if (newValue === undefined) return;

            // Date comparison
            if (newValue instanceof Date && oldValue instanceof Date) {
                if (newValue.getTime() !== oldValue.getTime()) {
                    (changedValues as Record<string, unknown>)[key] = newValue;
                }
                return;
            }

            // Normal comparison
            if (newValue !== oldValue) {
                (changedValues as Record<string, unknown>)[key] = newValue;
            }
        });

        // 🚀 If nothing changed → don’t call API
        if (Object.keys(changedValues).length === 0) {
            toast("Nothing changed");
            onOpenChange(!open);
            return;
        }

        const payload = {
            id: item.id,
            ...changedValues,
        };

        const updateHabit = async () => {
            try {
                await fetch(`/api/${user?.id}/habit/${item.id}`, {
                    method: "PATCH",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });

            } catch (error) {
                console.error(error);
            }
        };

        updateHabit();
        toast("Refresh page to see changes!");
        onOpenChange(!open);
    }

    return (
        <Drawer direction={isMobile ? "bottom" : "right"} open={open} onOpenChange={(isOpen) => {
            if (!isOpen) {
                form.reset(); // 🔥 resets entire form to defaultValues
            }
            onOpenChange(isOpen);
        }}>
            <DrawerContent>

                <DrawerHeader className="gap-1">
                    <div className="flex items-center justify-start gap-4">
                        <div className={`flex items-center gap-2 h-12 w-12 rounded-xl bg-background dark:bg-foreground`}
                            style={{ backgroundColor: item.color }}>
                            <IconRenderer
                                icon={item.icon}
                                className="size-8 w-full text-foreground dark:text-background"
                            />
                        </div>
                        <div>
                            <DrawerTitle>{item.title}</DrawerTitle>
                            <DrawerDescription>
                                {item.description ? item.description : "No description available for this habit"}
                            </DrawerDescription>
                        </div>

                    </div>

                </DrawerHeader>

                <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="flex flex-col gap-4"
                        >
                            {/* title */}
                            <div className="flex flex-col gap-3">
                                <Controller name="title"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="form-rhf-demo-title">
                                                Title
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id="form-rhf-demo-title"
                                                aria-invalid={fieldState.invalid}
                                                placeholder="Title"
                                                autoComplete="off"
                                                type="text"
                                            />
                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />
                            </div>
                            {/* description */}
                            <div className="flex flex-col gap-3">
                                <Controller name="description"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="form-rhf-demo-description">
                                                Description
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                value={field.value ?? ""}
                                                id="form-rhf-demo-description"
                                                aria-invalid={fieldState.invalid}
                                                placeholder="Description"
                                                autoComplete="off"
                                                type="text"
                                            />
                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">

                                {/* staus */}
                                <div className="flex flex-col gap-3">
                                    <Controller name="status"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor="form-rhf-demo-status">
                                                    Status
                                                </FieldLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value={"ACTIVE"}>
                                                            <IconCircleCheckFilled className="size-4 fill-green-500" />
                                                            {"ACTIVE"}
                                                        </SelectItem>
                                                        <SelectItem value={"INACTIVE"}>
                                                            <IconLoader className="size-4" />
                                                            {"INACTIVE"}
                                                        </SelectItem>
                                                        <SelectItem value={"COMPLETED"}>
                                                            <IconCircleCheckFilled className="size-4 fill-blue-500" />
                                                            {"COMPLETED"}
                                                        </SelectItem>
                                                        <SelectItem value={"ARCHIVED"}>
                                                            <IconArchive className="size-4" />
                                                            {"ARCHIVED"}
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </Field>
                                        )}
                                    />
                                </div>

                                {/* Categories */}
                                <div className="flex flex-col gap-3">
                                    <Controller
                                        name="categoryId"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor="form-rhf-demo-category">
                                                    Category
                                                </FieldLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value ?? ""}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select category" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {categories.map((category) => (
                                                            <SelectItem key={category.id} value={category.id}>
                                                                {category.title}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </Field>
                                        )}
                                    />
                                </div>

                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-3">
                                    <Controller name="targetPerDay"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor="form-rhf-demo-target">
                                                    Counts per Streak
                                                </FieldLabel>
                                                <Input
                                                    {...field}
                                                    id="form-rhf-demo-target"
                                                    aria-invalid={fieldState.invalid}
                                                    placeholder="Target Count"
                                                    autoComplete="off"
                                                    type="number"
                                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                />
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]} />
                                                )}
                                            </Field>
                                        )}
                                    />
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Controller name="goalType"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor="form-rhf-demo-goalType">
                                                    Frequency
                                                </FieldLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value={"DAILY"}>{"DAILY"}</SelectItem>
                                                        <SelectItem value={"WEEKLY"}>{"WEEKLY"}</SelectItem>
                                                        <SelectItem value={"MONTHLY"}>{"MONTHLY"}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </Field>
                                        )} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-3">
                                    <Controller
                                        name="icon"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <IconPickerDialog
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </Field>
                                        )}
                                    />
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Controller
                                        name="color"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <ColorPickerDialog
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </Field>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <Controller
                                    name="endDate"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="form-rhf-demo-endDate">
                                                End Date
                                            </FieldLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className={`w-full justify-between text-left font-normal ${!field.value && "text-muted-foreground"
                                                            }`}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>

                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        // selected={field.value}
                                                        onSelect={(date) => field.onChange(date)}
                                                        disabled={(date) => {
                                                            const today = new Date()
                                                            today.setHours(0, 0, 0, 0) // normalize to start of today
                                                            return date < today
                                                        }}
                                                        initialFocus
                                                        captionLayout="dropdown"
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                <FieldGroup className="w-56" onClick={() => toast("Reminder feature is unavailable")}>
                                    <Field orientation="horizontal">
                                        <Checkbox id="terms-checkbox-basic" name="terms-checkbox-basic"
                                            disabled
                                        />
                                        <FieldLabel htmlFor="terms-checkbox-basic">
                                            Enable Reminder
                                        </FieldLabel>
                                    </Field>
                                </FieldGroup>

                            </div>

                            <DrawerFooter className="gap-4">
                                <Button type="submit">Submit</Button>
                                <DrawerClose asChild>
                                    <Button variant="outline">Camcel</Button>
                                </DrawerClose>
                            </DrawerFooter>

                        </form>
                    </Form>
                </div>


            </DrawerContent>
        </Drawer>
    )
}