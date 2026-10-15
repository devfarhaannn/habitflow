import { ChevronDownIcon, ChevronUpIcon, EllipsisVerticalIcon } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { Separator } from '../ui/separator'
import { IconRenderer } from '../icon-picker/icon-picker'
import { TopHabitsBackendDTO } from '@/types/types'

const TOP_HABITS_MENU_ITEMS = ['Share', 'Update', 'Refresh']

type TopHabitsCardProps = {
  habits: TopHabitsBackendDTO
}

export function TopHabitsCard({ habits }: TopHabitsCardProps) {
  return (
    <Card className="justify-between gap-5 sm:min-w-0 *:data-[slot=card-content]:space-y-7">
      <CardHeader className='flex items-center justify-between'>
        <span className='text-lg font-semibold'>Top Performing Habits</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' className='text-muted-foreground size-6 rounded'>
              <EllipsisVerticalIcon />
              <span className='sr-only'>Menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuGroup>
              {TOP_HABITS_MENU_ITEMS.map((item, index) => (
                <DropdownMenuItem key={index}>{item}</DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className='flex flex-1 flex-col gap-2'>
        <div className='text-muted-foreground text-sm mb-1'>Analyse your habit consistency over time</div>
        <Separator className='mb-1' />
        <div className='flex flex-1 flex-col justify-evenly gap-2'>
          {habits.map((habit, index) => (
            <div key={index} className='flex items-center justify-between gap-2.5'>
              <div className='flex items-center justify-between gap-2.5'>
                <Avatar className='size-11 rounded-sm'>
                  <AvatarFallback className='bg-primary/10 shrink-0 rounded-sm'>
                    <IconRenderer icon={habit.icon} className='size-6' />
                  </AvatarFallback>
                </Avatar>
                <div className='flex flex-col gap-1'>
                  <span className=' text-sm'>{habit.title}</span>
                </div>
              </div>
              <div className='space-y-2'>
                <p className='text-sm'>{habit.streak} days</p>
                <Progress value={habit.progressPercentage / 30} className='w-36' />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
