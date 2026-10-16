import ContactSection from "@/components/pubic-layout/contact-section";
import { GithubIcon, LinkedinIcon, Mail, TwitterIcon } from "lucide-react";
import Image from "next/image";

export default function ContactPage() {
    return (
        <>
            {/* <ContactSection /> */}
            <section className="py-8 sm:py-16 lg:py-24">
                <div className="mx-auto max-w-6xl space-y-9 px-4 sm:px-6 lg:px-8">

                    {/* <!-- Header --> */}
                    <div className="space-y-3">
                        <span className="inline-flex w-fit items-center border px-2 py-1 text-xs font-medium rounded">
                            Get in Touch
                        </span>

                        <div className="flex justify-between gap-4 max-md:flex-col">

                            <div className="max-w-xl">
                                <h2 className="text-2xl font-semibold sm:text-3xl lg:text-4xl">
                                    Connect With Me 👋
                                </h2>
                            </div>

                            <p className="text-muted-foreground max-w-xl text-lg">
                                Whether you're looking for more information, have a suggestion, or
                                need help with something, we're here for you.
                            </p>

                        </div>
                    </div>

                    {/* <!-- Grid --> */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                        {/* <!-- Contact Form --> */}
                        <div className="bg-card rounded-xl border shadow-sm p-6">

                            <form className="space-y-6">

                                <div>
                                    <label className="text-sm font-medium">Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter your name"
                                        className="w-full mt-1 h-10 rounded-md border px-3"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Email</label>
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        className="w-full mt-1 h-10 rounded-md border px-3"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Message</label>
                                    <textarea
                                        placeholder="Enter your message"
                                        className="w-full mt-1 min-h-[100px] rounded-md border px-3 py-2"
                                    ></textarea>
                                </div>

                                {/* <!-- Services --> */}
                                <div className="space-y-3">
                                    <label className="text-base font-medium">Services</label>

                                    <div className="grid grid-cols-2 gap-4">

                                        <label className="flex items-center gap-2 text-sm">
                                            <input type="checkbox" />
                                            Website Design
                                        </label>

                                        <label className="flex items-center gap-2 text-sm">
                                            <input type="checkbox" />
                                            UX Design
                                        </label>

                                        <label className="flex items-center gap-2 text-sm">
                                            <input type="checkbox" />
                                            Content Creation
                                        </label>

                                        <label className="flex items-center gap-2 text-sm">
                                            <input type="checkbox" />
                                            Strategy & Consulting
                                        </label>

                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-primary text-primary-foreground h-10 rounded-lg font-medium"
                                >
                                    Send Message
                                </button>

                            </form>

                        </div>

                        {/* <!-- Profile --> */}
                        <div className="space-y-6">

                            {/* <!-- Profile Card --> */}
                            <div className="group relative overflow-hidden rounded-xl lg:rounded-3xl">

                                <img
                                    src="/new-avatar.png"
                                    alt="John Doe"
                                    className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />

                                {/* <!-- Hire Badge --> */}
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-card px-3 py-1 text-xs rounded-t-md flex items-center gap-2">

                                    <span className="relative flex size-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                                        <span className="relative inline-flex size-2 rounded-full bg-green-600"></span>
                                    </span>

                                    Available for Hire
                                </div>

                            </div>

                            {/* <!-- Profile Info --> */}
                            <div className="text-center space-y-3">

                                <div className="flex items-center justify-center gap-2">
                                    <h3 className="text-xl font-semibold">Farhan Bhatt</h3>
                                    <span className="size-2 bg-primary/30 rounded-full"></span>
                                    <p className="text-muted-foreground">Full Stack Developer</p>
                                </div>

                                {/* <!-- Social Icons --> */}
                                <div className="flex justify-center gap-4">

                                    <a href="#" className="hover:text-muted-foreground transition">
                                        <GithubIcon size={20} />
                                    </a>

                                    <a href="#" className="hover:text-muted-foreground transition">
                                        <TwitterIcon size={20} />
                                    </a>

                                    <a href="#" className="hover:text-muted-foreground transition">
                                        <LinkedinIcon size={20} />
                                    </a>

                                    <a href="#" className="hover:text-muted-foreground transition">
                                        <Mail size={20} />
                                    </a>

                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </>
    );
}