export default function TermsPage() {
    return (
        <section className="py-8 sm:py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* <!-- Top Section --> */}
                <div className="mb-12 grid gap-16 lg:grid-cols-2">

                    {/* <!-- Left Content --> */}
                    <div className="space-y-10">

                        <div className="space-y-4">
                            <p className="text-primary text-sm font-medium uppercase">
                                Terms & Conditions
                            </p>

                            <h2 className="text-2xl font-semibold md:text-3xl lg:text-4xl">
                                Terms of Use
                            </h2>

                            <p className="text-muted-foreground text-lg">
                                By accessing and using our habit tracking platform, you agree to comply
                                with and be bound by the following terms and conditions. These terms are
                                designed to ensure a safe, reliable, and positive experience for all users
                                while using our services to build and maintain healthy habits.
                                <br /><br />
                                Our platform allows users to create, manage, and track personal habits and
                                routines. You are responsible for maintaining the confidentiality of your
                                account and ensuring that the information you provide is accurate and
                                up to date. You agree not to misuse the service, attempt unauthorized
                                access, or use the platform for activities that may harm the system,
                                other users, or the integrity of the service.
                                <br /><br />
                                We reserve the right to update, modify, or discontinue certain features
                                of the platform at any time in order to improve performance, security,
                                and overall user experience. Continued use of the platform after such
                                updates indicates your acceptance of the revised terms.
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