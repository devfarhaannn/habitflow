"use client"


import { motion } from "framer-motion"
import { Code, FlaskConical, Github, Rocket, Triangle } from "lucide-react"

const steps = [
    {
        title: "Develop Features",
        desc: "Build new features or improve existing ones in your local development environment.",
        icon: Code,
    },
    {
        title: "Test & Debug",
        desc: "Run the application locally, fix bugs, and verify that everything works as expected.",
        icon: FlaskConical,
    },
    {
        title: "Commit & Push Code",
        desc: "Save your changes with commits and push them to your GitHub repository.",
        icon: Github,
    },
    {
        title: "Automatic Deployment",
        desc: "The project is automatically built and deployed online through Vercel.",
        icon: Triangle,
    },
]

export default function DevTimeline() {
    return (
        <section className="py-20">
            <div className="max-w-7xl mx-auto px-6">

                {/* Header */}
                <div className="text-center mb-16">
                    <p className="text-primary text-sm uppercase font-medium">
                        Development Process
                    </p>

                    <h2 className="text-3xl font-semibold mt-2">
                        Project Deployment Timeline
                    </h2>

                    <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
                        From building your project locally to deploying it live.
                    </p>
                </div>

                <div className="relative">

                    {/* Timeline Line */}
                    {/* <div className="absolute left-6 top-0 h-full w-[2px] bg-border md:left-0 md:top-7 md:h-[2px] md:w-full"></div> */}

                    <div className="absolute left-6 top-0 h-full w-[2px] bg-border md:left-0 md:top-7 md:h-[2px] md:w-full overflow-hidden">

                        <motion.div
                            className="absolute bg-primary origin-top md:origin-left"
                            initial={{
                                scaleY: 0,
                                scaleX: 0
                            }}
                            whileInView={{
                                scaleY: 1,
                                scaleX: 1
                            }}
                            transition={{
                                duration: 1.2,
                                ease: "easeOut"
                            }}
                            viewport={{ once: true }}

                            style={{
                                height: "100%",
                                width: "100%"
                            }}
                        />

                    </div>

                    {/* Steps */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

                        {steps.map((step, index) => {
                            const Icon = step.icon

                            return (
                                <div key={index} className="relative flex md:block">

                                    {/* Icon */}
                                    <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white dark:text-black shadow-md md:mx-auto">
                                        <Icon size={20} />
                                    </div>

                                    {/* Content */}
                                    <div className="ml-6 md:ml-0 md:text-center md:mt-6 max-w-sm">
                                        <h3 className="font-semibold text-lg">
                                            {step.title}
                                        </h3>

                                        <p className="text-muted-foreground text-sm mt-2">
                                            {step.desc}
                                        </p>
                                    </div>

                                </div>
                            )
                        })}

                    </div>

                </div>

            </div>
        </section>
    )
}