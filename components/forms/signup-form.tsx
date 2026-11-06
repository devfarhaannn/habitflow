"use client"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/useAuth"
import { signupFormSchema } from "@/types/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { Checkbox } from "../ui/checkbox"
import { redirect } from "next/navigation"
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
    })

    async function onSubmit(data: z.infer<typeof signupFormSchema>) {
        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

            const result = await register(
                data.fullName,
                data.email,
                data.password,
                timezone
            );

            if (!result) {
                return;
            }

            toast.success("Account created successfully!", {
                description: "Welcome to HabitFlow!",
            });

            router.push("/dashboard");
        } catch {
            toast.error("Something went wrong. Please try again.");
        }
    }

    return (
        <Card {...props} className="w-full sm:max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="text-xl">Create your account</CardTitle>
                <CardDescription>
                    Enter your email below to create your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
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
                            name="email"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-rhf-demo-email">
                                        Email
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="form-rhf-demo-email"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="m@example.com"
                                        autoComplete="off"
                                        type="email"
                                    />
                                    <FieldDescription>
                                        We'll use this to contact you. We will not share your email with anyone else.
                                    </FieldDescription>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
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
                                        autoComplete="off"
                                        type="password"
                                    />
                                    <FieldDescription>
                                        Must be at least 8 characters long.
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
                                        autoComplete="off"
                                        type="password"
                                    />
                                    <FieldDescription>
                                        Please confirm your password.
                                    </FieldDescription>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="terms"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <FieldSet data-invalid={fieldState.invalid}>
                                    <FieldGroup data-slot="checkbox-group">
                                        <Field orientation="horizontal">
                                            <Checkbox
                                                id="form-rhf-demo-terms"
                                                name={field.name}
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                            <FieldLabel
                                                htmlFor="form-rhf-demo-terms"
                                                className="font-normal"
                                            >
                                                I agree to the terms and conditions
                                            </FieldLabel>
                                        </Field>
                                    </FieldGroup>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </FieldSet>
                            )}
                        />
                        <FieldGroup>
                            <Field>
                                <Button type="button" variant="outline" onClick={() => form.reset()}>
                                    Reset
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? "Creating account..." : "Create Account"}
                                </Button>
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={handleGoogleSignup}
                                >
                                    Sign up with Google
                                </Button>
                                <FieldDescription className="px-6 text-center">
                                    Already have an account? <a href="/login">Sign in</a>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    )
}
