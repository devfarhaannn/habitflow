import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { habitOverviewCardsConfig } from "@/public/data/dashboard-data"
import { HabitOverviewBackendDTO } from "@/types/types"

type OvervierCardProp = {
  data: HabitOverviewBackendDTO
}

export function HabitOverviewCards({ data }: OvervierCardProp) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">

      {habitOverviewCardsConfig.map((item, index) => (
        <Card key={index} className="@container/card">
          <CardHeader>
            <CardDescription>{item.title}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {data[item.key].value}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {data[item.key].isPositive ? <IconTrendingUp /> : <IconTrendingDown />}
                &nbsp;
                {data[item.key].isPositive ? "+" : "-"}
                {data[item.key].percentage}%
              </Badge>
            </CardAction>
          </CardHeader>

          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="flex gap-2 font-medium">
              {item.description}
              {data[item.key].isPositive ? (
                <IconTrendingUp className="size-4" />
              ) : (
                <IconTrendingDown className="size-4" />
              )}
            </div>
            <div className="text-muted-foreground">
              {item.footer}
            </div>
          </CardFooter>
        </Card>
      ))}

    </div>
  )
}