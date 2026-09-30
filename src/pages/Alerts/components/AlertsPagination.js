import { Button, Input } from "reactstrap";

const PAGE_SIZE_OPTIONS = [25, 50, 100, 200];

const AlertsPagination = ({
  page,
  pageSize,
  totalPages,
  total,
  loading,
  onPageChange,
  onPageSizeChange,
}) => {
  const canPrev = page > 1 && !loading;
  const canNext = page < totalPages && !loading;
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  return (
    <div className="d-flex justify-content-between align-items-center mt-2 p-2 flex-wrap gap-2">
      <small className="text-muted">
        Showing <strong>{start}</strong>–<strong>{end}</strong> of <strong>{total}</strong>
      </small>

      <div className="d-flex gap-2 align-items-center">
        <small className="text-muted">Per page:</small>
        <Input
          type="select"
          bsSize="sm"
          style={{ width: 80 }}
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          disabled={loading}
        >
          {PAGE_SIZE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </Input>

        <Button
          color="secondary"
          outline
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!canPrev}
        >
          <i className="bx bx-chevron-left" />
        </Button>

        <small className="text-muted px-2">
          Page <strong>{page}</strong> of <strong>{totalPages || 1}</strong>
        </small>

        <Button
          color="secondary"
          outline
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!canNext}
        >
          <i className="bx bx-chevron-right" />
        </Button>
      </div>
    </div>
  );
};

export default AlertsPagination;
