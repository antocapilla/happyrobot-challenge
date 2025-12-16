"use client";

import { useMemo, useState } from "react";
import { useLoads } from "@/features/loads/use-queries";
import { DataTable } from "@/components/ui/data-table";
import { getLoadsColumns } from "@/features/loads/components/loads-columns";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoadsPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");

  const { loads, isLoading, isError, error } = useLoads();

  const columns = useMemo(() => getLoadsColumns(), []);

  const filteredLoads = useMemo(() => {
    if (!search) return loads;
    const q = search.toLowerCase();
    return loads.filter(
      (l) =>
        l.load_id.toLowerCase().includes(q) ||
        l.origin.toLowerCase().includes(q) ||
        l.destination.toLowerCase().includes(q) ||
        l.equipment_type.toLowerCase().includes(q)
    );
  }, [loads, search]);

  const paginatedLoads = useMemo(() => {
    const start = page * pageSize;
    const end = start + pageSize;
    return filteredLoads.slice(start, end);
  }, [filteredLoads, page, pageSize]);

  const totalPages = Math.ceil(filteredLoads.length / pageSize);

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <p className="text-destructive font-medium mb-2">Error loading data</p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 pb-3 space-y-3 flex-shrink-0">
        <h1 className="text-xl font-semibold">Loads</h1>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="pl-9 h-9"
            />
          </div>

          {search && (
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => { setSearch(""); setPage(0); }}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 px-6 pb-6 min-h-0">
        <DataTable
          columns={columns}
          data={paginatedLoads}
          isLoading={isLoading}
          pageCount={totalPages}
          pageIndex={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
        />
      </div>
    </div>
  );
}

