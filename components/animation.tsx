export function Animation() {
    return (
        <>
            <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-50" />
            <div className="pointer-events-none absolute top-0 left-1/4 w-96 h-96 bg-gradient-radial animate-float" />
            <div className="pointer-events-none absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-radial animate-float " style={{ animationDelay: '3s' }} />
        </>
    )
}