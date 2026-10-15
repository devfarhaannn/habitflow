'use client'

import { useEffect, useState } from 'react'
import { CalendarIcon, MessageSquareTextIcon, PlusIcon } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog'
import { format } from "date-fns"
import { cn } from '@/lib/utils'
import { IconCirclePlusFilled } from '@tabler/icons-react'
import { Form, FormControl } from '../ui/form'
import z from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Field, FieldError, FieldLabel } from '../ui/field'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Calendar } from '../ui/calendar'
import { IconRenderer } from '../icon-picker/icon-picker'
import { IconPickerDialog } from '../icon-picker/new-picker'
import { ColorPickerDialog } from '../color-picker/color-dailog'
import LoadingPage from '@/app/loading'
import { useAuth } from '@/hooks/useAuth'
import { CreateHabitformSchema } from '@/types/zod'


type Props = {
    defaultOpen?: boolean
    className?: string
}



export function CreateHabitDailog({ defaultOpen = false, className }: Props) {
    const [open, setOpen] = useState(defaultOpen);
    const { user, loading } = useAuth();
    const [categories, setCategories] = useState<{ id: string; title: string }[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`/api/${user?.id}/categories`);

                const data = await res.json();
                setCategories(data);
            } catch (error) {
                console.error(error);
            }
        };

        if (user) fetchCategories();
    }, [user]);

    const form = useForm<z.infer<typeof CreateHabitformSchema>>({
        resolver: zodResolver(CreateHabitformSchema),
        defaultValues: {
            title: "",
            description: "",
            icon: "ListTodo",
            color: "#ffffff",
            goal: "DAILY",
            target: 1,
            startDate: new Date()
        }
    })

    useEffect(() => {
        if (categories.length > 0) {
            form.setValue("categoryId", categories[0].id);
        }
    }, [categories]);

    function onSubmit(values: z.infer<typeof CreateHabitformSchema>) {
        const createHabit = async () => {
            try {
                const res = await fetch(`/api/${user?.id}/habit`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json; charset=UTF-8",
                    },
                    body: JSON.stringify(values)
                });
            } catch (error) {
                console.error(error);
            }
        };

        createHabit();
        setOpen(false);
    }

    return (
        <Dialog open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    form.reset(); // 🔥 resets entire form to defaultValues
                }
                setOpen(isOpen);
            }}>

            <DialogTrigger asChild onClick={() => setOpen(true)}>
                <Button variant='outline' className='w-full'>
                    <IconCirclePlusFilled />
                    <span>Create Habit</span>
                </Button>
            </DialogTrigger>

            <DialogContent className={cn('sm:max-w-200 [&>[data-slot=dialog-close]>svg]:size-5', className)}>

                <DialogHeader className='flex-row items-center gap-4'>
                    <Avatar className='size-11 rounded-md'>
                        <AvatarFallback className='shrink-0 rounded-md border bg-transparent'>
                            <PlusIcon className='size-6' />
                        </AvatarFallback>
                    </Avatar>
                    <div className='space-y-1 text-left'>
                        <DialogTitle className='m-0 text-lg'>Create Habit</DialogTitle>
                        <DialogDescription>Create a new habit that matches your goals and preferences.</DialogDescription>
                    </div>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* Top Section */}
                        <div className="flex gap-6">
                            <div className={`flex items-center gap-2 h-24 w-24 rounded-xl bg-background dark:bg-foreground`}
                                style={{ backgroundColor: form.watch("color") }}>
                                <IconRenderer
                                    icon={form.watch("icon")}
                                    className="size-16 w-full text-foreground dark:text-background"
                                />
                            </div>

                            <div className="flex-1 space-y-5">
                                <Controller
                                    name="title"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
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

                                <Controller
                                    name="description"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <Input
                                                {...field}
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
                        </div>

                        {/* Grid Section */}
                        <div className="grid grid-cols-2 gap-6">
                            {/* icon */}
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

                            {/* color */}
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

                            {/* Goal */}
                            <Controller
                                name="goal"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="form-rhf-demo-goal">
                                            Streak Goal
                                        </FieldLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="DAILY">Daily</SelectItem>
                                                <SelectItem value="WEEKLY">Weekly</SelectItem>
                                                <SelectItem value="MONTHLY">Monthly</SelectItem>
                                            </SelectContent>
                                        </Select>

                                    </Field>
                                )}
                            />

                            {/* Counts */}
                            <Controller
                                name="target"
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
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                field.onChange(value === "" ? undefined : Number(value));
                                            }}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            {/* Category */}
                            <Controller
                                name="categoryId"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="form-rhf-demo-category">
                                            Category
                                        </FieldLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
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

                            {/* Calender */}
                            <Controller
                                name="startDate"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="form-rhf-demo-startDate">
                                            Start Date
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
                                                    selected={field.value}
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

                        <DialogFooter className='gap-4 max-sm:flex-col sm:justify-between'>
                            <Button size='lg' className='bg-primary/10 text-primary hover:bg-primary/20'>
                                <MessageSquareTextIcon />
                                Chat with us
                            </Button>
                            <div className='flex justify-between gap-4'>
                                <DialogClose asChild>
                                    <Button variant='outline' size='lg'>
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button size='lg' type='submit'>Create</Button>
                            </div>
                        </DialogFooter>

                    </form>
                </Form>

            </DialogContent>
        </Dialog>
    )
}
