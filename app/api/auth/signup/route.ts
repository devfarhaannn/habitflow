import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
    const { name, email, password, timezone } = await req.json();
    const normalizedTimezone =
        timezone === "Asia/Calcutta" ? "Asia/Kolkata" : timezone;

    if (!name || !email || !password || !timezone) {
        return Response.json(
            { error: "MISSING_FIELDS", code: "MISSING_FIELDS" },
            { status: 400 }
        );
    }

    try {
        new Intl.DateTimeFormat("en-US", {
            timeZone: normalizedTimezone
        });
    } catch {
        return Response.json(
            { error: "INVALID_TIMEZONE", code: "INVALID_TIMEZONE" },
            { status: 400 }
        );
    }

    const CheckExisting = await prisma.user.findUnique({ where: { email } });
    if (CheckExisting) {
        return Response.json(
            { message: "User already exists", code: "USER_EXISTS" },
            { status: 409 }
        );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const basUsername = name.split(" ")[0] || "user";
    const randomSuffix = Math.floor(Math.random() * 1000);
    const firstName = name.split(" ")[0] || null;
    const lastName = name.split(" ").splice(1).join(" ") || null;

    await prisma.user.create({
        data: {
            name: `${basUsername}${randomSuffix}`,
            firstName: firstName,
            lastName: lastName,
            timezone: normalizedTimezone,
            email,
            passwordHash,
            habitCategories: {
                create: [
                    { title: "Health" },
                    { title: "Fitness" },
                    { title: "Productivity" },
                ]
            }
        },
    });

    return Response.json({ message: "User created successfully", success: true }, { status: 201 });
}