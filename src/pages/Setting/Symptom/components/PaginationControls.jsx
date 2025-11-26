import React from "react";
import { Button, Input } from "reactstrap";

const PaginationControls = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onItemsPerPageChange,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  return (
    <div className="d-flex justify-content-between align-items-center p-3">
      <div className="d-flex align-items-center">
        <span className="text-muted me-2">Show</span>
        <Input
          type="select"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="form-select form-select-sm me-2"
          style={{ width: "auto" }}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </Input>
        <span className="text-muted">of {totalItems} entries</span>
      </div>
      <div className="d-flex gap-1">
        <Button
          color="light"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            color={currentPage === page ? "primary" : "light"}
            size="sm"
            onClick={() => onPageChange(page)}
            className="px-3"
          >
            {page}
          </Button>
        ))}
        <Button
          color="light"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default PaginationControls;
