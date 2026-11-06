"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconArchive,
  IconChevronDown,
  IconCircleCheckFilled,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
} from "@tabler/icons-react"
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { z } from "zod"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group"
import { RefreshCcw, Undo } from "lucide-react"
import { IconRenderer } from "../icon-picker/icon-picker"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { HabitPageSchema } from "@/types/zod"
import { ActionCell } from "./habit-action-cell"
import { CompletionButton } from "./completion-button"
/*
todo
3. create the check button such that it have checkbox in the number of targetPerDay
*/

type SortableRowContextValue = Pick<
  ReturnType<typeof useSortable>,
  "attributes" | "listeners"
>

const SortableRowContext = React.createContext<SortableRowContextValue | null>(
  null
)

// Create a separate component for the drag handle
function DragHandle() {
  const context = React.useContext(SortableRowContext)

  if (!context) return null

  const { attributes, listeners } = context

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

function DraggableRow({ row }: { row: Row<z.infer<typeof HabitPageSchema>> }) {
  const sortable = useSortable({
    id: row.original.id,
  })

  const { transform, transition, setNodeRef, isDragging } = sortable

  return (
    <SortableRowContext.Provider
      value={{
        attributes: sortable.attributes,
        listeners: sortable.listeners,
      }}
    >
      <TableRow
        data-state={row.getIsSelected() && "selected"}
        data-dragging={isDragging}
        ref={setNodeRef}
        className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
        style={{
          transform: CSS.Transform.toString(transform),
          transition: transition,
        }}
      >
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    </SortableRowContext.Provider>
  )
}


function HabitHeatMap({
  habits,
}: {
  habits: z.infer<typeof HabitPageSchema>[];
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Display the last 12 weeks
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - today.getDay() - 11 * 7);

  const weeks = Array.from({ length: 12 }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + weekIndex * 7 + dayIndex);
      return date;
    })
  );

  const getDateKey = (date: Date) => date.toISOString().slice(0, 10);

  const getIntensity = (completed: number, target: number) => {
    if (completed <= 0) return 0;

    const ratio = target > 0 ? completed / target : 0;

    if (ratio >= 1) return 4;
    if (ratio >= 0.75) return 3;
    if (ratio >= 0.5) return 2;

    return 1;
  };

  const intensityColors = [
    "bg-muted",
    "bg-emerald-200 dark:bg-emerald-950",
    "bg-emerald-300 dark:bg-emerald-800",
    "bg-emerald-400 dark:bg-emerald-600",
    "bg-emerald-600 dark:bg-emerald-400",
  ];

  if (habits.length === 0) {
    return (
      <div className="rounded-lg border p-10 text-center text-muted-foreground">
        No habits available. Create a habit to see your activity.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {habits.map((habit) => {
        const completionMap = new Map(
          habit.heatmap.map((entry) => [
            getDateKey(new Date(entry.date)),
            entry,
          ])
        );

        return (
          <div key={habit.id} className="rounded-xl border p-4 space-y-4">
            <div className="flex items-center gap-2">
              <IconRenderer
                icon={habit.icon}
                style={{ color: habit.color }}
              />

              <span className="font-medium">{habit.title}</span>

              <Badge variant="outline" className="ml-auto">
                {habit.currentStreak} day streak
              </Badge>
            </div>

            <div className="overflow-x-auto pb-2">
              <div className="flex min-w-fit gap-1.5">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((date) => {
                      const key = getDateKey(date);
                      const entry = completionMap.get(key);

                      const completed = entry?.completionCount ?? 0;
                      const target = entry?.targetCount ?? habit.targetPerDay;

                      const isFuture = date > today;
                      const intensity = getIntensity(completed, target);

                      return (
                        <div
                          key={key}
                          title={`${date.toLocaleDateString()}: ${completed}/${target} completed`}
                          className={`size-3.5 rounded-[3px] ${isFuture
                            ? "bg-transparent"
                            : intensityColors[intensity]
                            }`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Last 12 weeks</span>

              <div className="flex items-center gap-1.5">
                <span>Less</span>
                {intensityColors.map((color, index) => (
                  <div
                    key={index}
                    className={`size-3 rounded-sm ${color}`}
                  />
                ))}
                <span>More</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


function HabitFocusView({
  habits,
  completions,
  onIncrement,
}: {
  habits: z.infer<typeof HabitPageSchema>[];
  completions: Record<string, number>;
  onIncrement: (id: string, target: number) => void;
}) {
  const activeHabits = habits.filter(
    (habit) => habit.status === "ACTIVE"
  );

  const totalTarget = activeHabits.reduce(
    (total, habit) => total + habit.targetPerDay,
    0
  );

  const totalCompleted = activeHabits.reduce(
    (total, habit) =>
      total + (completions[habit.id] ?? habit.todaysCompletion),
    0
  );

  const progress =
    totalTarget > 0
      ? Math.min((totalCompleted / totalTarget) * 100, 100)
      : 0;

  if (activeHabits.length === 0) {
    return (
      <div className="rounded-xl border p-10 text-center">
        <h3 className="font-semibold">No active habits</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Create or activate a habit to start your daily focus.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Daily Overview */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Today&apos;s Focus</h2>
            <p className="text-sm text-muted-foreground">
              Stay consistent and complete your daily habits.
            </p>
          </div>

          <Badge variant="outline">
            {activeHabits.length} Active Habits
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Overall Progress
            </span>
            <span className="font-semibold">
              {totalCompleted}/{totalTarget}
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-right text-xs text-muted-foreground">
            {Math.round(progress)}% completed
          </p>
        </div>
      </div>

      {/* Active Habit List */}
      <div className="space-y-3">
        <h3 className="font-semibold">Your Daily Habits</h3>

        {activeHabits.map((habit) => {
          const completed =
            completions[habit.id] ?? habit.todaysCompletion;

          const target = habit.targetPerDay;

          const habitProgress =
            target > 0
              ? Math.min((completed / target) * 100, 100)
              : 0;

          return (
            <div
              key={habit.id}
              className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center"
            >
              {/* Habit Information */}
              <div className="flex flex-1 items-center gap-3">
                <div
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${habit.color}20` }}
                >
                  <IconRenderer
                    icon={habit.icon}
                    className="size-6"
                    style={{ color: habit.color }}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="truncate font-medium">
                    {habit.title}
                  </h4>

                  <p className="text-xs text-muted-foreground">
                    {habit.category?.title ?? "Uncategorized"}
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div className="w-full space-y-1 sm:max-w-40">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Progress
                  </span>
                  <span>
                    {completed}/{target}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${habitProgress}%`,
                      backgroundColor: habit.color,
                    }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <CompletionButton
                  completionCount={completed}
                  targetPerDay={target}
                  color={habit.color}
                  onIncrement={() => onIncrement(habit.id, target)}
                />

                <Button variant="outline" size="sm" asChild>
                  <Link href={`/habits/${habit.id}`}>
                    Details
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


export function DataTable1({
  data: initialData,
  userId
}: {
  data: z.infer<typeof HabitPageSchema>[],
  userId: string
}) {
  const [data, setData] = React.useState(() => initialData)
  // Original data ref
  const originalDataRef = React.useRef(initialData)
  const [completions, setCompletions] = React.useState<Record<string, number>>({})
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const handleViewChange = (value: string) => {
    setActiveView(value);

    const params = new URLSearchParams(searchParams.toString());

    if (value === "table") {
      params.delete("view");
    } else {
      params.set("view", value);
    }

    const query = params.toString();

    router.replace(
      query ? `${pathname}?${query}` : pathname,
      { scroll: false }
    );
  };

  const allowedViews = ["table", "heat-map", "card", "focus"];

  const requestedView = searchParams.get("view");

  const initialView = allowedViews.includes(requestedView ?? "")
    ? requestedView!
    : "table";

  const [activeView, setActiveView] = React.useState(initialView);

  React.useEffect(() => {
    setActiveView(initialView);
  }, [initialView]);

  React.useEffect(() => {
    setCompletions(
      Object.fromEntries(
        data.map(item => [item.id, item.todaysCompletion])
      )
    )
  }, [data])
  const sendCompletionToDB = React.useCallback(
  async (id: string, newValue: number, oldValue: number, target: number) => {
    try {
      const response = await fetch(
        `/api/${userId}/habit/${id}/completions`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newValue, oldValue, target }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update habit completion");
      }
    } catch (error) {
      console.error("Completion update failed:", error);
    }
  },
  [userId]
);


  const incrementCompletion = React.useCallback(
  (id: string, target: number) => {
    const current =
      completions[id] ??
      data.find((habit) => habit.id === id)?.todaysCompletion ??
      0;

    const newValue = current + 1 > target ? 0 : current + 1;

    setCompletions((prev) => ({
      ...prev,
      [id]: newValue,
    }));

    void sendCompletionToDB(id, newValue, current, target);
  },
  [completions, data, sendCompletionToDB]
);


  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})

  const [columnPreferencesLoaded, setColumnPreferencesLoaded] =
    React.useState(false)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )
  const [categories, setCategories] = React.useState<{ id: string; title: string }[]>([]);

  React.useEffect(() => {
    const savedPreferences = localStorage.getItem(
      `habitflow-columns-${userId}`
    )

    if (savedPreferences) {
      try {
        setColumnVisibility(JSON.parse(savedPreferences))
      } catch {
        localStorage.removeItem(`habitflow-columns-${userId}`)
      }
    }

    setColumnPreferencesLoaded(true)
  }, [userId])

  React.useEffect(() => {
    if (!columnPreferencesLoaded) return

    localStorage.setItem(
      `habitflow-columns-${userId}`,
      JSON.stringify(columnVisibility)
    )
  }, [columnVisibility, columnPreferencesLoaded, userId])

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`/api/${userId}/categories`);

        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error(error);
      }
    };

    if (userId) fetchCategories();
  }, [userId]);

  const columns: ColumnDef<z.infer<typeof HabitPageSchema>>[] = [
    {
      id: "drag",
      header: () => null,
      cell: () => <DragHandle />,
    },
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllRowsSelected() ||
              (table.getIsSomeRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        return (
          <Link href={`/habits/${row.original.id}`}>
            <Button variant="link" className="text-foreground px-0 text-start w-fit">
              <IconRenderer
                icon={row.original.icon ?? "ClipboardCheck"}
                style={{ color: row.original.color ?? "#345456" }}
              />
              {row.original.title}
            </Button>
          </Link>
        )
      },
      enableHiding: false,
    },
    {
      accessorKey: "goalType",
      header: "Frequency",
      cell: ({ row }) => (
        <div>
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            {row.original.goalType}
          </Badge>
        </div>
      ),
    },
    {
      id: "category",
      accessorKey: "category.title",
      header: "Category",
      cell: ({ row }) => (
        <div>
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            {row.original.category?.title}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            {status === "ACTIVE" && (<IconCircleCheckFilled className="size-3 fill-green-500" />)}
            {status === "INACTIVE" && <IconLoader className="size-3" />}
            {status === "ARCHIVED" && <IconArchive className="size-3" />}
            {status === "COMPLETED" && (<IconCircleCheckFilled className="size-3 fill-blue-500" />)}
            {status}
          </Badge>
        )
      }
      ,
    },
    {
      accessorKey: "targetPerDay",
      header: () => <div className="w-full text-center">Target</div>,
      cell: ({ row }) => (
        <div className="text-center w-16">
          {row.original.targetPerDay}
        </div>
      ),
    },
    {
      accessorKey: "currentStreak",
      header: () => <div className="w-full text-center">Streak</div>,
      cell: ({ row }) => (
        <div className="text-center w-16">
          {row.original.currentStreak}
        </div>
      ),
    },
    {
      accessorKey: "longestStreak",
      header: () => <div className="w-full text-center">Best</div>,
      cell: ({ row }) => (
        <div className="text-center w-16">
          {row.original.longestStreak}
        </div>
      ),
    },
    {
      accessorKey: "totalCompletions",
      header: () => <div className="w-full text-center">Completions</div>,
      cell: ({ row }) => (
        <div className="text-center w-16">
          {row.original.totalCompletions}
        </div>
      ),
    },
    {
      accessorKey: "todaysCompletion",
      header: () => <div className="w-full text-center">Mark</div>,
      cell: ({ row }) => {

        return (
          <CompletionButton
            completionCount={completions[row.original.id] ?? 0}
            targetPerDay={row.original.targetPerDay}
            color={row.original.color}
            onIncrement={() => incrementCompletion(row.original.id, row.original.targetPerDay)}
          />
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <ActionCell row={row} categories={categories} />
      ),
    },
  ]

  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => a.order - b.order)
  }, [data])

  // Order change
  const [pendingOrderChanges, setPendingOrderChanges] = React.useState<
    Record<string, number>
  >({})
  React.useEffect(() => {
    setData(initialData);
    originalDataRef.current = initialData;
    setPendingOrderChanges({});
  }, [initialData]);

  // swith for submit and reset button
  // Add controls after adding habit data
  const hasPendingChanges = Object.keys(pendingOrderChanges).length > 0

  const table = useReactTable({
    data: sortedData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const isFiltered = table.getFilteredRowModel().rows.length !== data.length;
  const isSorted =
    table.getState().sorting.length > 0 &&
    table.getState().sorting[0].id !== "order"

  const disableDrag = isFiltered || isSorted;

  // Filter column for type
  const typeColumn = table.getColumn("category");
  const selectedCategory = typeColumn?.getFilterValue() as string | undefined;

  const filteredHabits = React.useMemo(() => {
    if (!selectedCategory) return data;

    return data.filter(
      (habit) => habit.category?.title === selectedCategory
    );
  }, [data, selectedCategory]);
  const uniqueTypes = React.useMemo(() => {
    if (!typeColumn) return []
    return Array.from(typeColumn.getFacetedUniqueValues().keys())
  }, [typeColumn])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = sortedData.findIndex(item => item.id === active.id)
    const newIndex = sortedData.findIndex(item => item.id === over.id)

    const newData = arrayMove(sortedData, oldIndex, newIndex)

    const reordered = newData.map((item, index) => ({
      ...item,
      order: index + 1,
    }))


    setData(reordered)
  }

  function handleSubmitOrderChanges() {
    const orderChange = Object.entries(pendingOrderChanges).map(
      ([id, order]) => ({
        id,
        order,
      })
    )

    const payload = {
      orderChange: orderChange
    }

    console.log("Sending to backend:", payload);

    // await updateOrderInDatabase(payload)

    const updateHabits = async () => {
      try {
        await fetch(`/api/${userId}/habits`, {
          method: "PATCH",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

      } catch (error) {
        console.error(error);
      }
    };

    updateHabits();

    originalDataRef.current = data

    setPendingOrderChanges({})
  }

  function handleResetChanges() {
    setData(originalDataRef.current)
    setPendingOrderChanges({})
  }

  return (
    <Tabs
      value={activeView}
      onValueChange={handleViewChange}
      className="w-full flex-col justify-start gap-6"
    >

      {/* Tab views */}
      <div className="flex items-center justify-between px-4 lg:px-6">
        <TabsList
          className="**:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex"
        >
          <TabsTrigger value="table">
            Table
          </TabsTrigger>
          <TabsTrigger value="heat-map">
            HeatMap
          </TabsTrigger>
          <TabsTrigger value="card">
            Card
          </TabsTrigger>
          <TabsTrigger value="focus">
            Focus
          </TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-2">

          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCcw />
            <span className="hidden lg:inline">Refresh Data</span>
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between px-4 lg:px-6">

        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>

        <Select
          defaultValue="outline"
          value={(typeColumn?.getFilterValue() as string) ?? "all"}
          onValueChange={(value) => {
            if (value === "all") {
              typeColumn?.setFilterValue(undefined)
            } else {
              typeColumn?.setFilterValue(value)
            }
          }}
        >
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All</SelectItem>

            {uniqueTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <ToggleGroup
          type="single"
          value={(typeColumn?.getFilterValue() as string) ?? "all"}
          onValueChange={(value) => {
            if (!value || value === "all") {
              typeColumn?.setFilterValue(undefined)
            } else {
              typeColumn?.setFilterValue(value)
            }
          }}
          className="hidden @4xl/main:flex border"
        // className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex"
        >

          <ToggleGroupItem value="all">
            All
          </ToggleGroupItem>

          {uniqueTypes.map((type) => (
            <ToggleGroupItem key={type} value={type}>
              {type}
            </ToggleGroupItem>
          ))}

        </ToggleGroup>

        <div className="flex items-center gap-2">

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          {hasPendingChanges && (
            <Button variant="outline" size="sm" onClick={handleResetChanges}>
              <Undo />
              <span className="hidden lg:inline">Reset Changes</span>
            </Button>
          )}

          <Button
            variant={hasPendingChanges ? "default" : "outline"}
            size="sm"
            onClick={handleSubmitOrderChanges}
            disabled={!hasPendingChanges}
          >
            <IconPlus />
            <span className="hidden lg:inline">Submit Changes</span>
          </Button>
        </div>
      </div>

      <TabsContent value="table"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>

              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    // items={dataIds}
                    items={sortedData.map(item => item.id)}
                    strategy={verticalListSortingStrategy}
                    disabled={disableDrag}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>

            </Table>

          </DndContext>

        </div>

        {/* <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div> */}
      </TabsContent>

      <TabsContent
        value="heat-map"
        className="flex flex-col gap-4 px-4 lg:px-6"
      >
        <HabitHeatMap habits={filteredHabits} />
      </TabsContent>


      <TabsContent
        value="card"
        className="flex flex-col gap-4 px-4 lg:px-6"
      >
        {filteredHabits.length === 0 ? (
          <div className="rounded-lg border p-10 text-center text-muted-foreground">
            No habits found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredHabits.map((habit) => {
              const completed = completions[habit.id] ?? habit.todaysCompletion;
              const target = habit.targetPerDay;
              const progress = target > 0
                ? Math.min((completed / target) * 100, 100)
                : 0;

              return (
                <div
                  key={habit.id}
                  className="flex flex-col gap-4 rounded-xl border bg-card p-5 transition-shadow hover:shadow-md"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex size-11 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${habit.color}20` }}
                      >
                        <IconRenderer
                          icon={habit.icon}
                          className="size-6"
                          style={{ color: habit.color }}
                        />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">
                          {habit.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {habit.category?.title ?? "Uncategorized"}
                        </p>
                      </div>
                    </div>

                    <Badge variant="outline">
                      {habit.status}
                    </Badge>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Today&apos;s progress
                      </span>
                      <span className="font-medium">
                        {completed}/{target}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: habit.color,
                        }}
                      />
                    </div>

                    <p className="text-right text-xs text-muted-foreground">
                      {Math.round(progress)}% completed
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/50 p-3">
                    <div className="text-center">
                      <p className="text-lg font-semibold">
                        {habit.currentStreak}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Streak
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-lg font-semibold">
                        {habit.longestStreak}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Best
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-lg font-semibold">
                        {habit.totalCompletions}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Total
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <CompletionButton
                        completionCount={completed}
                        targetPerDay={target}
                        color={habit.color}
                        onIncrement={() =>
                          incrementCompletion(habit.id, target)
                        }
                      />
                    </div>

                    <Button variant="outline" asChild>
                      <Link href={`/habits/${habit.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </TabsContent>

      <TabsContent
        value="focus"
        className="flex flex-col gap-4 px-4 lg:px-6"
      >
        <HabitFocusView
          habits={filteredHabits}
          completions={completions}
          onIncrement={incrementCompletion}
        />
      </TabsContent>

    </Tabs>
  )
}

