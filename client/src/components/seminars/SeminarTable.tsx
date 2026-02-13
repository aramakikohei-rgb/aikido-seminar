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
import { Trash2, Pencil, Plus, ExternalLink, ArrowUp, ArrowDown } from "lucide-react";
import SeminarFormDialog from "./SeminarFormDialog";
import { useFilters } from "@/context/FilterContext";
import { applyFilters } from "@/lib/filters";

const levelColors: Record<string, string> = {
  all: "bg-[#1c1c24] text-[#8a8578] border-[#2a2a35]",
  beginner: "bg-[#1a2e1a] text-[#6db86d] border-[#2a4a2a]",
  intermediate: "bg-[#2a1a10] text-[#b8960b] border-[#3a2a1a]",
  advanced: "bg-[#2a1010] text-[#c73e1d] border-[#3a1a1a]",
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
        <span
          className="font-semibold text-[#f5f0e8]"
          style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem" }}
        >
          {row.getValue("title")}
        </span>
      ),
    },
    {
      accessorKey: "instructor",
      header: "Instructor",
      cell: ({ row }) => (
        <div>
          <div className="text-[#d4c8b8] font-medium">{row.original.instructor}</div>
          {row.original.instructorRank && (
            <div className="text-xs text-[#8a8578] mt-0.5">
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
        const start = format(new Date(row.original.startDate), "MMM d, yyyy");
        const end = format(new Date(row.original.endDate), "MMM d, yyyy");
        return (
          <span className="text-sm text-[#8a8578] tabular-nums">
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
          <div className="text-[#d4c8b8]">{row.original.city}</div>
          <div className="text-xs text-[#8a8578] mt-0.5">
            {row.original.country}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "organization",
      header: "Org",
      cell: ({ row }) => (
        <span className="text-sm text-[#8a8578]">
          {row.original.organization || "—"}
        </span>
      ),
    },
    {
      accessorKey: "level",
      header: "Level",
      cell: ({ row }) => {
        const level = row.original.level;
        if (!level) return null;
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
              levelColors[level] ?? levelColors.all
            }`}
          >
            {level}
          </span>
        );
      },
    },
    {
      accessorKey: "fee",
      header: "Fee",
      cell: ({ row }) => (
        <span className="text-sm text-[#b8960b] font-medium tabular-nums">
          {row.original.fee || "—"}
        </span>
      ),
    },
    {
      id: "link",
      header: "",
      cell: ({ row }) => {
        const url = row.original.registrationUrl || row.original.sourceUrl;
        if (!url) return null;
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#c73e1d] hover:text-[#e04a2a] transition-colors inline-flex items-center gap-1 text-sm"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            className="h-8 w-8 rounded-md flex items-center justify-center text-[#8a8578] hover:text-[#d4c8b8] hover:bg-[#1c1c24] transition-all"
            onClick={() => onEdit(row.original)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            className="h-8 w-8 rounded-md flex items-center justify-center text-[#8a8578] hover:text-[#c73e1d] hover:bg-[#2a1010] transition-all"
            onClick={() => onDelete(row.original)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
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
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#c73e1d] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[#8a8578]">Loading seminars...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="bg-[#2a1010] border border-[#3a1a1a] rounded-lg px-6 py-4 text-[#c73e1d]">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Toolbar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <span
            className="text-2xl text-[#f5f0e8]"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
          >
            Seminars
          </span>
          <span className="text-sm text-[#8a8578]">
            {filtered.length} of {seminars.length}
          </span>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#c73e1d] hover:bg-[#d44a28] text-[#f5f0e8] rounded-lg text-sm font-medium transition-all duration-200 shadow-lg shadow-[#c73e1d]/15 hover:shadow-[#c73e1d]/25"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <Plus className="h-4 w-4" />
          Add Seminar
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-[#2a2a35] bg-[#16161e]/50 overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-[#2a2a35] hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`text-[10px] uppercase tracking-[0.15em] text-[#8a8578] font-semibold py-3 bg-[#12121a] ${
                      header.column.getCanSort() ? "cursor-pointer select-none hover:text-[#d4c8b8]" : ""
                    }`}
                    style={{ fontFamily: "var(--font-body)" }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1.5">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === "asc" && <ArrowUp className="h-3 w-3 text-[#c73e1d]" />}
                      {header.column.getIsSorted() === "desc" && <ArrowDown className="h-3 w-3 text-[#c73e1d]" />}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row, i) => (
                <TableRow
                  key={row.id}
                  className="group border-b border-[#1c1c24] hover:bg-[#1a1a24] transition-colors duration-150 stagger-row"
                  style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3.5" style={{ fontFamily: "var(--font-body)" }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-[#8a8578]"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem" }}>
                      No seminars found
                    </span>
                    <span className="text-xs">Try adjusting your filters</span>
                  </div>
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
