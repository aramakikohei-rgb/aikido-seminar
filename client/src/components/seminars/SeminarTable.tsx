import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import {
  fetchSeminars,
  createSeminar,
  updateSeminar,
  deleteSeminar,
} from "@/lib/api";
import type { Seminar, SeminarFormData } from "@/types/seminar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil } from "lucide-react";
import SeminarFormDialog from "./SeminarFormDialog";
import { useFilters } from "@/context/FilterContext";
import { applyFilters } from "@/lib/filters";

const levelColors: Record<string, "default" | "secondary" | "outline"> = {
  all: "secondary",
  beginner: "outline",
  intermediate: "default",
  advanced: "default",
};

function makeColumns(
  onEdit: (s: Seminar) => void,
  onDelete: (s: Seminar) => void
): ColumnDef<Seminar>[] {
  return [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("title")}</span>
      ),
    },
    {
      accessorKey: "instructor",
      header: "Instructor",
      cell: ({ row }) => (
        <div>
          <div>{row.original.instructor}</div>
          {row.original.instructorRank && (
            <div className="text-xs text-muted-foreground">
              {row.original.instructorRank}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "startDate",
      header: "Dates",
      cell: ({ row }) => {
        const start = format(
          new Date(row.original.startDate),
          "MMM d, yyyy"
        );
        const end = format(new Date(row.original.endDate), "MMM d, yyyy");
        return (
          <span className="text-sm">
            {start} — {end}
          </span>
        );
      },
    },
    {
      id: "location",
      header: "Location",
      accessorFn: (row) => `${row.city}, ${row.country}`,
      cell: ({ row }) => (
        <div>
          <div>{row.original.city}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.country}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "organization",
      header: "Organization",
    },
    {
      accessorKey: "level",
      header: "Level",
      cell: ({ row }) => {
        const level = row.original.level;
        if (!level) return null;
        return (
          <Badge variant={levelColors[level] ?? "secondary"}>{level}</Badge>
        );
      },
    },
    {
      accessorKey: "fee",
      header: "Fee",
    },
    {
      id: "link",
      header: "Link",
      cell: ({ row }) => {
        const url =
          row.original.registrationUrl || row.original.sourceUrl;
        if (!url) return null;
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-primary/80 text-sm"
          >
            View
          </a>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(row.original)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
}

export default function SeminarTable() {
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "startDate", desc: false },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSeminar, setEditingSeminar] = useState<Seminar | null>(null);
  const { filters } = useFilters();

  const loadSeminars = useCallback(() => {
    setLoading(true);
    fetchSeminars()
      .then(setSeminars)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadSeminars();
  }, [loadSeminars]);

  const handleAdd = () => {
    setEditingSeminar(null);
    setDialogOpen(true);
  };

  const handleEdit = useCallback((seminar: Seminar) => {
    setEditingSeminar(seminar);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async (seminar: Seminar) => {
    if (!window.confirm(`Delete "${seminar.title}"?`)) return;
    try {
      await deleteSeminar(seminar.id);
      loadSeminars();
    } catch {
      alert("Failed to delete seminar.");
    }
  }, [loadSeminars]);

  const handleSave = useCallback(async (data: SeminarFormData) => {
    if (editingSeminar) {
      await updateSeminar(editingSeminar.id, data);
    } else {
      await createSeminar(data);
    }
    loadSeminars();
  }, [editingSeminar, loadSeminars]);

  const filtered = useMemo(() => applyFilters(seminars, filters), [seminars, filters]);
  const columns = useMemo(() => makeColumns(handleEdit, handleDelete), [handleEdit, handleDelete]);
  const tableState = useMemo(() => ({ sorting }), [sorting]);
  const coreRowModel = useMemo(() => getCoreRowModel<Seminar>(), []);
  const sortedRowModel = useMemo(() => getSortedRowModel<Seminar>(), []);

  const table = useReactTable({
    data: filtered,
    columns,
    state: tableState,
    onSortingChange: setSorting,
    getCoreRowModel: coreRowModel,
    getSortedRowModel: sortedRowModel,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Loading seminars...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12 text-destructive">
        Error: {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {filtered.length} of {seminars.length} seminars
        </span>
        <Button onClick={handleAdd}>+ Add Seminar</Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={
                      header.column.getCanSort()
                        ? "cursor-pointer select-none"
                        : ""
                    }
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {{
                        asc: " \u2191",
                        desc: " \u2193",
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No seminars found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <SeminarFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        seminar={editingSeminar}
        onSave={handleSave}
      />
    </div>
  );
}
