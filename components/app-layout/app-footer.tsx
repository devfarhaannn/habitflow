import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { FacebookIcon, GithubIcon, InstagramIcon, LinkedinIcon, TwitterIcon } from "lucide-react"

export function AppFooter() {
    return (
        <footer>
            <div className='text-muted-foreground mx-auto flex size-full max-w-7xl items-center justify-between gap-3 px-4 py-3 max-sm:flex-col sm:gap-6 sm:px-6'>
                <p className='text-sm text-balance max-sm:text-center'>
                    {`©${new Date().getFullYear()}`}{' '}
                    <a href='#' className='text-primary'>
                        Farhan Bhatt
                    </a>
                    , Made for better web understanding
                </p>
                <div className='flex items-center gap-5'>
                    <a href='#'>
                        <FacebookIcon className='size-4' />
                    </a>
                    <a href='https://github.com/devfarhaannn'>
                        <GithubIcon className='size-4' />
                    </a>
                    <a href='https://www.linkedin.com/in/farhanbhatt'>
                        <LinkedinIcon className='size-4' />
                    </a>
                    <a href='https://x.com/farhanbhatt07'>
                        <TwitterIcon className='size-4' />
                    </a>
                </div>
            </div>
        </footer>
    )
}
