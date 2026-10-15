export default function PrivacyPage() {
    return (
        <section className="py-8 sm:py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* <!-- Top Section --> */}
                <div className="mb-12 grid gap-16 lg:grid-cols-2">

                    {/* <!-- Left Content --> */}
                    <div className="space-y-10">

                        <div className="space-y-4">
                            <p className="text-primary text-sm font-medium uppercase">
                                Privacy Policy
                            </p>

                            <h2 className="text-2xl font-semibold md:text-3xl lg:text-4xl">
                                Your Privacy Matters
                            </h2>

                            <p className="text-muted-foreground text-lg">
                                Your privacy is important to us. Our habit tracking platform is designed to
                                help you build better routines while ensuring your personal information
                                remains secure and protected. We only collect the information that is
                                necessary to provide our core services, such as tracking your habits,
                                storing progress history, and generating insights that help you stay
                                consistent and motivated.
                                <br /><br />
                                The data you provide, including habit entries, preferences, and basic
                                account information, is used solely to improve your experience within the
                                platform. We do not sell, rent, or share your personal information with
                                third parties for marketing purposes. Any data collected is handled with
                                strict security measures and stored responsibly.
                                <br /><br />
                                By using our habit tracking service, you trust us with your personal data,
                                and we take that responsibility seriously. We continuously work to maintain
                                high standards of data protection, transparency, and user control so that
                                you can focus on building positive habits with confidence.
                            </p>
                        </div>
                    </div>

                    {/* <!-- Image --> */}
                    <img
                        src="https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/about-us/image-8.png"
                        alt="About us"
                        className="w-full h-full max-h-[600px] object-cover rounded-lg"
                    />

                </div>

            </div>
        </section>
    )
}