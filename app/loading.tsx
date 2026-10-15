import { Spinner } from '@/components/ui/spinner';

export default function LoadingPage() {
    return (
        <div className='flex items-center justify-center h-screen gap-4'>
            <Spinner className='size-10 animate-spin' />
            Loading...
        </div>

    )
}