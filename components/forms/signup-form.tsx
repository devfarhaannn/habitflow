
"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { signupFormSchema } from "@/types/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import * as z from "zod";

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
    const { register, login, loading, error } = useAuth();
    const router = useRouter();

    function handleGoogleSignup() {
        const detectedTimezone =
            Intl.DateTimeFormat().resolvedOptions().timeZone;

        const timezone =
            detectedTimezone === "Asia/Calcutta"
                ? "Asia/Kolkata"
                : detectedTimezone;

        document.cookie = `habitflow-timezone=${encodeURIComponent(timezone)}; path=/; max-age=300; SameSite=Lax`;

        login("google", "", "");
    }

    useEffect(() => {
        if (!error) return;

        const messages: Record<string, string> = {
            USER_ALREADY_EXISTS: "This email is already registered.",
            MISSING_FIELDS: "Please fill in all required fields.",
            INVALID_CREDENTIALS: "Invalid credentials.",
            USER_NOT_FOUND: "User not found.",
            OAUTH_ACCOUNT_EXISTS: "This account is already linked to Google.",
            UNKNOWN_ERROR: "Something went wrong. Please try again.",
        };

        toast.error(messages[error] ?? "Unable to create your account.");
    }, [error]);

    const form = useForm<z.infer<typeof signupFormSchema>>({
        resolver: zodResolver(signupFormSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
            terms: true,
        },
    });

    async function onSubmit(data: z.infer<typeof signupFormSchema>) {
        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

            const result = await register(
                data.fullName,
                data.email,
                data.password,
                timezone
            );

            if (!result) return;

            toast.success("Account created successfully!", {
                description: "Welcome to HabitFlow!",
            });

            router.push("/dashboard");
        } catch {
            toast.error("Something went wrong. Please try again.");
        }
    }

    return (
        <Card
            {...props}
            className="w-full border-border/70 bg-card shadow-xl shadow-black/10"
        >
            <CardHeader className="space-y-2 pb-5 text-center">
                <CardTitle className="text-2xl font-semibold tracking-tight">
                    Create your account
                </CardTitle>

                <CardDescription className="text-sm">
                    Get started with HabitFlow and build better habits.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form
                    id="form-rhf-demo"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <FieldGroup className="gap-5">
                        {/* Name and email */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Controller
                                name="fullName"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="form-rhf-demo-fullName">
                                            Full Name
                                        </FieldLabel>

                                        <Input
                                            {...field}
                                            id="form-rhf-demo-fullName"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Enter your full name"
                                            autoComplete="name"
                                            type="text"
                                        />

                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="email"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="form-rhf-demo-email">
                                            Email Address
                                        </FieldLabel>

                                        <Input
                                            {...field}
                                            id="form-rhf-demo-email"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="m@example.com"
                                            autoComplete="email"
                                            type="email"
                                        />

                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                        </div>

                        {/* Password fields */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Controller
                                name="password"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="form-rhf-demo-password">
                                            Password
                                        </FieldLabel>

                                        <Input
                                            {...field}
                                            id="form-rhf-demo-password"
                                            aria-invalid={fieldState.invalid}
                                            autoComplete="new-password"
                                            placeholder="Enter password"
                                            type="password"
                                        />

                                        <FieldDescription>
                                            At least 8 characters.
                                        </FieldDescription>

                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="confirmPassword"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="form-rhf-demo-confirmPassword">
                                            Confirm Password
                                        </FieldLabel>

                                        <Input
                                            {...field}
                                            id="form-rhf-demo-confirmPassword"
                                            aria-invalid={fieldState.invalid}
                                            autoComplete="new-password"
                                            placeholder="Confirm password"
                                            type="password"
                                        />

                                        <FieldDescription>
                                            Re-enter your password.
                                        </FieldDescription>

                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                        </div>

                        {/* Terms and conditions */}
                        <Controller
                            name="terms"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <FieldSet data-invalid={fieldState.invalid}>
                                    <Field orientation="horizontal" className="gap-2">
                                        <Checkbox
                                            id="form-rhf-demo-terms"
                                            name={field.name}
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />

                                        <FieldLabel
                                            htmlFor="form-rhf-demo-terms"
                                            className="text-sm font-normal"
                                        >
                                            I agree to the terms and conditions
                                        </FieldLabel>
                                    </Field>

                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </FieldSet>
                            )}
                        />

                        {/* Action buttons */}
                        <FieldGroup className="gap-3">
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => form.reset()}
                                    disabled={loading}
                                >
                                    Reset
                                </Button>

                                <Button type="submit" disabled={loading}>
                                    {loading ? "Creating..." : "Create Account"}
                                </Button>
                            </div>

                            <Button
                                variant="outline"
                                type="button"
                                onClick={handleGoogleSignup}
                                disabled={loading}
                                className="w-full"
                            >
                                Sign up with Google
                            </Button>

                            <FieldDescription className="pt-1 text-center">
                                Already have an account?{" "}
                                <a
                                    href="/login"
                                    className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                                >
                                    Sign in
                                </a>
                            </FieldDescription>
                        </FieldGroup>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    );
}
