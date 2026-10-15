import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { STATISTICS_CARD_DATA } from '@/public/data/dashboard-data';
import { HabitMetricBackendDTO } from '@/types/types';

type HabitMetricCardProps = {
  metrics: HabitMetricBackendDTO
}

export function HabitMetricCards({ metrics }: HabitMetricCardProps) {
  return (
    <div className='col-span-full grid gap-6 sm:grid-cols-3 md:max-lg:grid-cols-1'>
      {STATISTICS_CARD_DATA.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card className='gap-4' key={index}>
            <CardHeader className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md'>
                  <Icon />
                </div>
                <span className='font-semibold text-sm'>{stat.title}</span>
              </div>
              <span className='text-2xl'>{metrics[stat.key]}</span>
            </CardHeader>
          </Card>
        )
      })}
    </div>
  )
}
