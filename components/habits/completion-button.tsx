"use client"

import { Check, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMemo } from "react"

interface CompletionButtonProps {
    completionCount: number
    targetPerDay: number
    color?: string
    onIncrement: () => void
}

export function CompletionButton({
    completionCount,
    targetPerDay,
    color = "#10b981",
    onIncrement,
}: CompletionButtonProps) {
    const isComplete = completionCount >= targetPerDay

    const radius = 18
    const stroke = 4
    const normalizedRadius = radius - stroke
    const circumference = normalizedRadius * 2 * Math.PI

    const progress = Math.min(completionCount / targetPerDay, 1)

    const strokeDashoffset = useMemo(() => {
        return circumference - progress * circumference
    }, [progress, circumference])

    return (
        <button
            onClick={onIncrement}
            className="relative h-11 w-11 flex items-center justify-center"
        >
            <svg
                height={radius * 2}
                width={radius * 2}
                className="absolute"
            >
                {/* Background ring */}
                <circle
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={stroke}
                    className="text-muted"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />

                {/* Progress ring */}
                <circle
                    stroke={color}
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className="transition-all duration-300"
                    transform={`rotate(-90 ${radius} ${radius})`}
                />
            </svg>

            <div
                className="h-12 w-12 rounded-xl flex items-center justify-center transition-colors duration-300"
            >
                {isComplete ? <Check size={14} /> : <Plus size={14} />}
            </div>
        </button>
    )
}