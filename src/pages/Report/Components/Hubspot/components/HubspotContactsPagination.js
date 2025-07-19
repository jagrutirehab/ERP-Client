import React from "react";
import {
  Row,
  Col,
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";

const HubspotContactsPagination = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // Function to generate page numbers with ellipsis
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    // Always show first page
    range.push(1);

    // Calculate start and end of the range around current page
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    // Add pages before current page
    if (start > 2) {
      range.push("...");
    }

    // Add pages around current page
    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    // Add pages after current page
    if (end < totalPages - 1) {
      range.push("...");
    }

    // Always show last page (if not already included)
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

  const pageNumbers = getPageNumbers();

  return (
    <Row className="mt-3">
      <Col className="d-flex justify-content-center">
        <Pagination>
          {/* Previous button */}
          <PaginationItem disabled={currentPage === 1}>
            <PaginationLink
              previous
              onClick={() => onPageChange(currentPage - 1)}
            />
          </PaginationItem>

          {/* Page numbers */}
          {pageNumbers.map((pageNum, index) => (
            <PaginationItem
              key={index}
              active={currentPage === pageNum}
              disabled={pageNum === "..."}
            >
              <PaginationLink
                onClick={() => {
                  if (pageNum !== "...") {
                    onPageChange(pageNum);
                  }
                }}
                style={{ cursor: pageNum === "..." ? "default" : "pointer" }}
              >
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          ))}

          {/* Next button */}
          <PaginationItem disabled={currentPage === totalPages}>
            <PaginationLink
              next
              onClick={() => onPageChange(currentPage + 1)}
            />
          </PaginationItem>
        </Pagination>
      </Col>
    </Row>
  );
};

export default HubspotContactsPagination;
