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
import { OctagonAlert, RefreshCcw, Undo } from "lucide-react"
import { IconRenderer } from "../icon-picker/icon-picker"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { HabitPageSchema } from "@/types/zod"
import { ActionCell } from "./habit-action-cell"
import { CompletionButton } from "./completion-button"
import { startOfDay } from "date-fns"
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

  React.useEffect(() => {
    setCompletions(
      Object.fromEntries(
        data.map(item => [item.id, item.todaysCompletion])
      )
    )
  }, [data])

  const incrementCompletion = React.useCallback(
    (id: string, target: number) => {
      setCompletions(prev => {
        const current = prev[id] ?? 0;
        const newValue = current + 1 > target ? 0 : current + 1;

        return { ...prev, [id]: newValue }
      })

      const current = completions[id] ?? 0
      const newValue = current + 1 > target ? 0 : current + 1

      sendCompletionToDB(id, newValue, current, target)

    },
    [sendCompletionToDB]
  )

  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
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

    setPendingOrderChanges((prev) => {
      const updated = { ...prev }

      reordered.forEach((item, index) => {
        const newOrder = index + 1

        const originalItem = originalDataRef.current.find((d) => d.id === item.id)

        if (originalItem?.order !== newOrder) {
          updated[item.id] = newOrder
        } else {
          delete updated[item.id] // if user moved it back
        }
      })

      return updated
    })

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

  function sendCompletionToDB(id: string, newValue: number, oldValue: number, target: number) {
    const updateHabit = async () => {
      try {
        await fetch(`/api/${userId}/habit/${id}/completions`, {
          method: "PATCH",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ newValue, oldValue, target })
        });

      } catch (error) {
        console.error(error);
      }
    };

    updateHabit();
  }

  return (
    <Tabs
      defaultValue="table"
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

      <TabsContent value="heat-map"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed">
          <div className="flex w-full h-full items-center justify-center">
            <div className="flex flex-col item-center justify-center gap-4">
              <OctagonAlert className="mx-auto" size={40} />
              <span className="text-xl">This view is currently not available</span>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="card"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed">
          <div className="flex w-full h-full items-center justify-center">
            <div className="flex flex-col item-center justify-center gap-4">
              <OctagonAlert className="mx-auto" size={40} />
              <span className="text-xl">This view is currently not available</span>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="focus"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed">
          <div className="flex w-full h-full items-center justify-center">
            <div className="flex flex-col item-center justify-center gap-4">
              <OctagonAlert className="mx-auto" size={40} />
              <span className="text-xl">This view is currently not available</span>
            </div>
          </div>
        </div>
      </TabsContent>

    </Tabs>
  )
}

