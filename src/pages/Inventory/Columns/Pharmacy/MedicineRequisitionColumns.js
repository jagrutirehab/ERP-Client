import React from "react";
import moment from "moment";
import { renderStatusBadge } from "../../../../Components/Common/renderStatusBadge";
import { ExpandableText } from "../../../../Components/Common/ExpandableText";
import { capitalizeWords } from "../../../../utils/toCapitalize";

export const getMedicineRequisitionColumns = ({
  openDetail,
  handleEdit,
  handleApprove,
  handleReject,
  handleDelete,
  hasWritePermission,
  status,
}) => {
  return [
    {
      name: <div>Date</div>,
      selector: (row) => row.createdAt,
      cell: (row) => (
        <div className="d-flex flex-column text-muted py-2" style={{ fontSize: 13, gap: "2px" }}>
          {row.createdAt ? (
            <>
              <span className="fw-medium text-dark">{moment(row.createdAt).format("DD MMM YYYY")}</span>
              <span style={{ fontSize: 11 }}>{moment(row.createdAt).format("hh:mm A")}</span>
            </>
          ) : (
            "—"
          )}
        </div>
      ),
      wrap: true,
      minWidth: "110px",
    },
    {
      name: <div>Requisition ID</div>,
      selector: (row) => row.requisitionNumber,
      cell: (row) => (
        <span className="fw-medium text-primary text-nowrap">
          {row.requisitionNumber || "—"}
        </span>
      ),
      wrap: true,
      center: true,
    },
    {
      name: <div>Medicine ID</div>,
      selector: (row) => row.approvedMedicineId?.id,
      cell: (row) => (
        <span className="fw-medium text-primary text-nowrap">
          {row.approvedMedicineId?.id || "—"}
        </span>
      ),
      wrap: true,
      center: true,
      minWidth: "120px",
      omit: status !== "APPROVED",
    },
    {
      name: <div>Requesting Center</div>,
      selector: (row) => row.requestingCenter?.title,
      cell: (row) => row.requestingCenter?.title || "—",
      wrap: true,
    },
    {
      name: <div>Proposed Medicine</div>,
      selector: (row) => row.proposedMedicine?.name,
      cell: (row) => {
        const med = row.proposedMedicine;
        if (!med) return "—";
        return (
          <div className="d-flex flex-column py-1">
            <span className="fw-medium">
              {[med.type, med.name, med.strength].filter(Boolean).join(" ")}
            </span>
            {med.genericName && (
              <span className="text-muted" style={{ fontSize: 11 }}>
                {capitalizeWords(med.genericName)}
              </span>
            )}
          </div>
        );
      },
      wrap: true,
      minWidth: "220px",
    },
    {
      name: <div>Status</div>,
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => renderStatusBadge(row?.status),
      wrap: true,
      minWidth: "110px",
    },
    {
      name: <div>Remarks</div>,
      cell: (row) => {
        const reviewRemarks = row.review?.remarks;
        const cancelRemarks = row.cancellationReason;
        const text = reviewRemarks || cancelRemarks;
        return <ExpandableText text={capitalizeWords(text) || "-"} />;
      },
      wrap: true,
      minWidth: "150px",
      omit: status !== "APPROVED" || status !== "REJECTED",
    },
    {
      name: <div>Action</div>,
      cell: (row) => {
        return (
          <div className="d-flex align-items-center gap-1 flex-wrap">
            {hasWritePermission && row.status === "PENDING" && (
              <>
                <button
                  type="button"
                  className="btn btn-sm btn-success text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (handleApprove) handleApprove(row);
                  }}
                  title="Approve"
                >
                  <i className="bx bx-check" />
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-danger text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (handleReject) handleReject(row);
                  }}
                  title="Reject"
                >
                  <i className="bx bx-x" />
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (handleEdit) handleEdit(row);
                  }}
                  title="Edit"
                >
                  <i className="bx bx-pencil" />
                </button>
              </>
            )}

            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={(e) => {
                e.stopPropagation();
                if (openDetail) openDetail(row);
              }}
              title="Details"
            >
              <i className="bx bx-show" />
            </button>

            {hasWritePermission && ["PENDING", "REJECTED"].includes(row.status) && (
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={(e) => {
                  e.stopPropagation();
                  if (handleDelete) handleDelete(row);
                }}
                title="Delete"
              >
                <i className="bx bx-trash" />
              </button>
            )}
          </div>
        );
      },
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "220px",
    },
  ];
};
