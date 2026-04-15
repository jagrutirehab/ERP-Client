import React from "react";
import { Badge } from "reactstrap";
import moment from "moment";
import { renderStatusBadge } from "../../../../Components/Common/renderStatusBadge";
import { ExpandableText } from "../../../../Components/Common/ExpandableText";
import { capitalizeWords } from "../../../../utils/toCapitalize";

export const getInternalTransferColumns = ({ expandedRows, toggleExpand, openDetail, STATUS_COLORS, handleEdit, handleApprove, handleReject, handleDispatch, handleReceive, statusFilter, hasWritePermission }) => {
    const showRemarks = !["PENDING", ""].includes(statusFilter);
    const isReceivedTab = statusFilter === "PARTIALLY_RECEIVED,FULFILLED";
    return [
        {
            name: <div>Req. Date</div>,
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
            minWidth: "110px"
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
            name: <div>Requesting Center</div>,
            selector: (row) => row.requestingCenter?.title,
            sortable: true,
            cell: (row) => row.requestingCenter?.title || "—",
            wrap: true,
        },
        {
            name: <div>Fulfilling Center</div>,
            selector: (row) => row.fulfillingCenter?.title,
            sortable: true,
            cell: (row) => row.fulfillingCenter?.title || "—",
            wrap: true,
        },
        {
            name: <div>Items</div>,
            minWidth: "250px",
            cell: (row) => {
                const isPostApproval = !["PENDING", "REJECTED"].includes(row.status);
                const isDispatched = ["DISPATCHED"].includes(row.status);
                const isReceived = ["FULFILLED", "PARTIALLY_RECEIVED"].includes(row.status);

                const allItems = row.items || [];
                const itemsList = isPostApproval
                    ? allItems.filter((item) => (item.approvedQty ?? 0) > 0)
                    : allItems;

                if (itemsList.length === 0) return <span className="text-muted">—</span>;

                const isExpanded = expandedRows[row._id];
                const visibleItems = isExpanded ? itemsList : itemsList.slice(0, 3);
                const hiddenCount = itemsList.length - 3;

                return (
                    <div className="d-flex flex-column w-100 my-2 gap-1 rounded">
                        {visibleItems.map((item, i) => {
                            const m = item.pharmacyId || {};
                            const customId = m.id || item.customId || "";
                            const medName = m.medicineName || item.medicineName || "";
                            const strength = m.Strength || m.strength || item.strength || "";
                            const unit = m.unitType || m.unit || item.unit || "";
                            const qty = isReceived
                                ? (item.receivedQty ?? item.dispatchedQty ?? item.approvedQty)
                                : isDispatched
                                    ? (item.dispatchedQty ?? item.approvedQty)
                                    : isPostApproval
                                        ? item.approvedQty
                                        : item.requestedQty;

                            return (
                                <React.Fragment key={i}>
                                    <div className="d-flex align-items-center justify-content-between py-1">
                                        <div className="fw-medium me-3" style={{ whiteSpace: "normal" }}>
                                            {customId && <span className="text-primary me-1">[{customId}]</span>}
                                            {[medName, strength, unit].filter(Boolean).join(" ") || "Unknown Item"}
                                        </div>
                                        <Badge color="light" className="text-dark border" style={{ fontSize: 10 }}>
                                            Qty: {qty}
                                        </Badge>
                                    </div>
                                    {i !== visibleItems.length - 1 && (
                                        <div style={{ height: "1px", background: "#000", opacity: 0.15 }} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                        {!isExpanded && hiddenCount > 0 && (
                            <>
                                <div style={{ height: "1px", background: "#000", opacity: 0.15 }} />
                                <button
                                    type="button"
                                    className="btn btn-link p-1 text-center fs-12 fw-semibold"
                                    onClick={() => toggleExpand(row._id)}
                                    style={{ textDecoration: "none" }}
                                >
                                    + {hiddenCount} more items
                                </button>
                            </>
                        )}
                        {isExpanded && hiddenCount > 0 && (
                            <>
                                <div style={{ height: "1px", background: "#000", opacity: 0.15 }} />
                                <button
                                    type="button"
                                    className="btn btn-link p-1 text-center fs-12 text-muted"
                                    onClick={() => toggleExpand(row._id)}
                                    style={{ textDecoration: "none" }}
                                >
                                    Show less
                                </button>
                            </>
                        )}
                    </div>
                );
            },
            wrap: true,
        },
        ...(showRemarks ? [
            {
                name: <div>{statusFilter === "REJECTED" ? "Remarks" : "Approval Remarks"}</div>,
                cell: (row) => {
                    return <ExpandableText text={capitalizeWords(row.review?.remarks) || "-"} />;
                },
                wrap: true,
                minWidth: "140px",
            },
            ...(isReceivedTab ? [
                {
                    name: <div>Dispatch Remarks</div>,
                    cell: (row) => {
                        const remarks = row.dispatch?.dispatchNote;
                        return <ExpandableText text={capitalizeWords(remarks) || "-"} />;
                    },
                    wrap: true,
                    minWidth: "140px",
                },
                {
                    name: <div>GRN Details</div>,
                    cell: (row) => {
                        const grn = row.receive;
                        if (!grn?.receivedAt) return <span className="text-muted">—</span>;
                        return (
                            <div className="d-flex flex-column gap-1 py-1" style={{ fontSize: 12 }}>
                                {grn.grnNumber && (
                                    <span className="fw-semibold text-primary">
                                        {grn.grnNumber}
                                    </span>
                                )}
                                {grn.receivedAt && (
                                    <span style={{ color: "#6c757d" }}>
                                        {moment(grn.receivedAt).format("DD MMM YYYY, hh:mm A")}
                                    </span>
                                )}
                            </div>
                        );
                    },
                    wrap: true,
                    minWidth: "180px",
                },
                {
                    name: <div>Receive Remarks</div>,
                    cell: (row) => {
                        return <ExpandableText text={capitalizeWords(row.receive?.receiveNote) || "-"} />;
                    },
                    wrap: true,
                    minWidth: "140px",
                },
            ] : []),
        ] : []),
        {
            name: <div>Status</div>,
            selector: (row) => row.status,
            sortable: true,
            cell: (row) => renderStatusBadge(row?.status),
            wrap: true,
        },
        {
            name: <div>Action</div>,
            cell: (row) => (
                <div className="d-flex align-items-center gap-2">
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
                    {hasWritePermission && row.status === "APPROVED" && (
                        <button
                            type="button"
                            className="btn btn-sm btn-primary text-white"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (handleDispatch) handleDispatch(row);
                            }}
                            title="Dispatch"
                        >
                            <i className="bx bx-package me-1" />
                            Dispatch
                        </button>
                    )}
                    {hasWritePermission && row.status === "DISPATCHED" && (
                        <button
                            type="button"
                            className="btn btn-sm btn-success text-white"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (handleReceive) handleReceive(row);
                            }}
                            title="Receive"
                        >
                            <i className="bx bx-check-double me-1" />
                            Receive
                        </button>
                    )}
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={(e) => {
                            e.stopPropagation();
                            openDetail(row);
                        }}
                    >
                        <i className="bx bx-show me-1" />
                        Details
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: "220px",
        }
    ];
};
