import React from "react";
import { Badge } from "reactstrap";
import moment from "moment";
import { renderStatusBadge } from "../../../../Components/Common/renderStatusBadge";
import { ExpandableText } from "../../../../Components/Common/ExpandableText";
import { capitalizeWords } from "../../../../utils/toCapitalize";
import { pluralizeUnit } from "../../../../utils/pluralizeUnit";

export const getInternalTransferColumns = ({ expandedRows, toggleExpand, openDetail, STATUS_COLORS, handleEdit, handleApprove, handleReject, handleRequestingApprove, handleRequestingReject, handleDispatch, handleReceive, handlePdf, statusFilter, hasWritePermission, userCenterAccess = [] }) => {
    const showRemarks = !["PENDING_REQUESTING", ""].includes(statusFilter);
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
                const isPostApproval = !["PENDING_REQUESTING", "PENDING_FULFILLING", "REJECTED", "REQUESTING_REJECTED", "FULFILLING_REJECTED"].includes(row.status);
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
                            const isPending = ["PENDING_REQUESTING", "PENDING_FULFILLING"].includes(row.status);

                            let customId, medType, medName, strength, unit;
                            const med = item.medicineId || {};
                            customId = med.id || item.customId || "";
                            medType = med.type || "";
                            medName = med.name || item.medicineName || "";
                            strength = med.strength || item.strength || "";
                            unit = med.purchaseUnit || item.unit || "";

                            const qty = isReceived
                                ? (item.receivedQty ?? item.approvedQty)
                                : isDispatched
                                    ? item.dispatchedQty
                                    : isPostApproval
                                        ? item.approvedQty
                                        : item.requestedQty;

                            return (
                                <React.Fragment key={i}>
                                    <div className="d-flex align-items-center justify-content-between py-1">
                                        <div className="fw-medium me-3" style={{ whiteSpace: "normal" }}>
                                            {customId && <span className="text-primary me-1">[{customId}]</span>}
                                            {[medType, medName, strength].filter(Boolean).join(" ") || "Unknown Item"}
                                        </div>
                                        <Badge color="light" className="text-dark border" style={{ fontSize: 10 }}>
                                            Qty: {qty} {pluralizeUnit(unit)}
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
                name: <div>
                    {statusFilter === "PENDING_FULFILLING" 
                        ? "Requesting Remarks" 
                        : (statusFilter.includes("REJECTED") ? "Remarks" : "Approval Remarks")}
                </div>,
                cell: (row) => {
                    let text = row.fulfillingCenterReview?.remarks || row.requestingCenterReview?.remarks;
                    if (statusFilter === "PENDING_FULFILLING") {
                        text = row.requestingCenterReview?.remarks;
                    } else if (statusFilter === "APPROVED" || isReceivedTab || statusFilter === "DISPATCHED") {
                        text = row.fulfillingCenterReview?.remarks;
                    } else if (statusFilter.includes("REJECTED")) {
                        if (row.status === "REQUESTING_REJECTED") text = row.requestingCenterReview?.remarks;
                        else if (row.status === "FULFILLING_REJECTED") text = row.fulfillingCenterReview?.remarks;
                    }
                    return <ExpandableText text={capitalizeWords(text) || "-"} />;
                },
                wrap: true,
                minWidth: "140px",
            },
            ...(isReceivedTab ? [
                {
                    name: <div>Dispatch Details</div>,
                    cell: (row) => {
                        const dispatch = row.dispatch;
                        if (!dispatch) return <span className="text-muted">—</span>;
                        const hasCourier = dispatch.courierName || dispatch.courierId;
                        return (
                            <div className="d-flex flex-column gap-1 py-1" style={{ fontSize: 12, minWidth: 140 }}>
                                {hasCourier && (
                                    <div className="d-flex flex-column mb-1">
                                        {dispatch.courierName && (
                                            <span className="fw-semibold" style={{ color: "#495057" }}>
                                                {capitalizeWords(dispatch.courierName)}
                                            </span>
                                        )}
                                        {dispatch.courierId && (
                                            <span className="text-primary fw-medium" style={{ fontSize: 11, textTransform: "uppercase" }}>
                                                {dispatch.courierId}
                                            </span>
                                        )}
                                    </div>
                                )}
                                {dispatch.dispatchNote ? (
                                    <ExpandableText text={capitalizeWords(dispatch.dispatchNote)} />
                                ) : (
                                    !hasCourier && <span className="text-muted">—</span>
                                )}
                            </div>
                        );
                    },
                    wrap: true,
                    minWidth: "160px",
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
            cell: (row) => {
                const reqCenterId = row.requestingCenter?._id || row.requestingCenter;
                const fulCenterId = row.fulfillingCenter?._id || row.fulfillingCenter;
                const hasRequestingAccess = userCenterAccess.includes(reqCenterId?.toString());
                const hasFulfillingAccess = userCenterAccess.includes(fulCenterId?.toString());

                // ── PENDING_REQUESTING: Requesting center internal review ──────
                if (row.status === "PENDING_REQUESTING") {
                    if (hasRequestingAccess) {
                        return (
                            <div className="d-flex align-items-center gap-1 flex-wrap">
                                {hasWritePermission && (
                                    <>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-success text-white"
                                            onClick={(e) => { e.stopPropagation(); if (handleRequestingApprove) handleRequestingApprove(row); }}
                                            title="Approve (Requesting Center)"
                                        >
                                            <i className="bx bx-check" />
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-danger text-white"
                                            onClick={(e) => { e.stopPropagation(); if (handleRequestingReject) handleRequestingReject(row); }}
                                            title="Reject (Requesting Center)"
                                        >
                                            <i className="bx bx-x" />
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={(e) => { e.stopPropagation(); if (handleEdit) handleEdit(row); }}
                                            title="Edit"
                                        >
                                            <i className="bx bx-pencil" />
                                        </button>
                                    </>
                                )}
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={(e) => { e.stopPropagation(); openDetail(row); }}
                                >
                                    <i className="bx bx-show me-1" />
                                    Details
                                </button>
                            </div>
                        );
                    }
                    return (
                        <button type="button" className="btn btn-sm btn-outline-primary"
                            onClick={(e) => { e.stopPropagation(); openDetail(row); }}>
                            <i className="bx bx-show me-1" />Details
                        </button>
                    );
                }

                // ── PENDING_FULFILLING: Fulfilling center reviews ─────────────
                if (row.status === "PENDING_FULFILLING") {
                    if (hasFulfillingAccess) {
                        return (
                            <div className="d-flex align-items-center gap-1 flex-wrap">
                                {hasWritePermission && (
                                    <>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-success text-white"
                                            onClick={(e) => { e.stopPropagation(); if (handleApprove) handleApprove(row); }}
                                            title="Approve"
                                        >
                                            <i className="bx bx-check" />
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-danger text-white"
                                            onClick={(e) => { e.stopPropagation(); if (handleReject) handleReject(row); }}
                                            title="Reject"
                                        >
                                            <i className="bx bx-x" />
                                        </button>
                                    </>
                                )}
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={(e) => { e.stopPropagation(); openDetail(row); }}
                                >
                                    <i className="bx bx-show me-1" />
                                    Details
                                </button>
                            </div>
                        );
                    }
                    // Requesting center view of PENDING_FULFILLING — read only
                    if (hasRequestingAccess) {
                        return (
                            <button type="button" className="btn btn-sm btn-outline-primary"
                                onClick={(e) => { e.stopPropagation(); openDetail(row); }}>
                                <i className="bx bx-show me-1" />Details
                            </button>
                        );
                    }
                    return (
                        <button type="button" className="btn btn-sm btn-outline-primary"
                            onClick={(e) => { e.stopPropagation(); openDetail(row); }}>
                            <i className="bx bx-show me-1" />Details
                        </button>
                    );
                }
                // ── END PENDING_FULFILLING ───────────────────────────────────

                return (
                    <div className="d-flex align-items-center gap-2">
                        {hasWritePermission && row.status === "APPROVED" && hasFulfillingAccess && (
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
                        {hasWritePermission && row.status === "DISPATCHED" && hasRequestingAccess && (
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
                        {row.status === "DISPATCHED" && (
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (handlePdf) handlePdf(row);
                                }}
                                title="View PDF"
                            >
                                <i className="bx bxs-file-pdf" />
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
                );
            },
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: "240px",
        }
    ];
};
