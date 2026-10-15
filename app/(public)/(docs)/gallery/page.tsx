import { cn } from "@/lib/utils"

const sections = [
    {
        images: [
            {
                src: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/gallery/image-10.png',
                alt: 'Coastal cliffs and ocean view'
            }
        ]
    },
    {
        type: 'grid',
        images: [
            {
                src: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/gallery/image-9.png',
                alt: 'Silhouettes on beach'
            },
            {
                src: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/gallery/image-8.png',
                alt: 'Snowy mountain peaks'
            },
            {
                src: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/gallery/image-7.png',
                alt: 'Rolling green hills'
            },
            {
                src: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/gallery/image-6.png',
                alt: 'Sunset landscape'
            }
        ]
    },
    {
        type: 'grid',
        images: [
            {
                src: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/gallery/image-4.png',
                alt: 'Silhouettes on beach'
            },
            {
                src: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/gallery/image-3.png',
                alt: 'Snowy mountain peaks'
            },
            {
                src: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/gallery/image-2.png',
                alt: 'Rolling green hills'
            },
            {
                src: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/gallery/image-1.png',
                alt: 'Sunset landscape'
            }
        ]
    },
    {
        images: [
            {
                src: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/gallery/image-5.png',
                alt: 'Coastal cliffs and ocean view'
            }
        ]
    }
]

export default function GalleryPage() {
    return (
        <section className='py-8 sm:py-16 lg:py-24'>
            <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                {/* Header */}
                <div className='mb-12 space-y-4 text-center sm:mb-16 lg:mb-24'>
                    <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>
                        <span className='relative z-1'>
                            Explore our
                            <span className='bg-primary absolute bottom-1 left-0 -z-1 h-px w-full' aria-hidden='true'></span>
                        </span>{' '}
                        Gallery
                    </h2>
                    <p className='text-muted-foreground text-xl'>
                        Explore our gallery to learn more about our amazing products and their features.
                    </p>
                </div>

                {/* Gallery Grid */}
                <div className='grid gap-6 md:grid-cols-2'>
                    {sections.map((section, sectionIndex) => (
                        <div key={sectionIndex} className={cn({ 'grid grid-cols-2 gap-6': section.type === 'grid' })}>
                            {section.images.map((image, imageIndex) => (
                                <img key={imageIndex} src={image.src} alt={image.alt} className='rounded-lg object-cover' />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}