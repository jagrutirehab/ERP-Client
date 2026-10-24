import { useEffect, useMemo, useState } from "react";

// Shared pagination logic for the module's list pages. Resets to page 1
// whenever the filtered item count changes (new filter/search), so you never
// land on a now-empty page.
export default function usePagination(items, pageSize = 8) {
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    if (page > pageCount) setPage(1);
  }, [pageCount, page]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  return {
    page,
    setPage,
    pageCount,
    pageItems,
    totalCount: items.length,
    pageSize,
  };
}
