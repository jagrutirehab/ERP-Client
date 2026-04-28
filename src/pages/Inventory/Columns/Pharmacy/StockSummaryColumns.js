import React from "react";
import { normalizeUnderscores } from "../../../../utils/normalizeUnderscore";

const display = (v) => (v === undefined || v === null || v === "" ? "-" : v);

export const getStockSummaryColumns = () => [
    {
        header: "Medicine ID",
        accessor: "medicineId",
        cell: (row) => <span>{display(row.medicine?.id)}</span>,
    },
    {
        header: "Medicine Name",
        accessor: "medicineName",
        cell: (row) => (
            <span className="font-weight-bold text-primary">
                {display(row.medicine?.name || row.medicineName)}
            </span>
        ),
    },
    {
        header: "Generic Name",
        accessor: "genericName",
        cell: (row) => <span>{row.medicine?.genericName?.toUpperCase() || "-"}</span>,
    },
    {
        header: "Form",
        accessor: "form",
        cell: (row) => <span>{normalizeUnderscores(row.medicine?.form)}</span>,
    },
    {
        header: "Type",
        accessor: "type",
        cell: (row) => <span>{normalizeUnderscores(row.medicine?.type)}</span>,
    },
    {
        header: "Strength",
        accessor: "strength",
        cell: (row) => <span>{display(row.medicine?.strength)}</span>,
    },
    {
        header: "Total Stock",
        accessor: "totalStock",
        cell: (row) => (
            <span>
                {row.totalStock || 0}
            </span>
        ),
    },
    {
        header: "Center-wise Stock",
        accessor: "centers",
        cell: (row) => {
            const centers = row.centers || [];
            const initialCount = 2;
            const hiddenCount = centers.length - initialCount;
            const containerId = `center-stock-container-${row._id}`;

            const toggleCenters = (e) => {
                e.preventDefault();
                const container = document.getElementById(containerId);
                if (!container) return;

                const hiddenItems = container.querySelectorAll(".hidden-center-item");
                const button = e.target;
                const isExpanded = button.getAttribute("data-expanded") === "true";

                if (isExpanded) {
                    hiddenItems.forEach((item) => (item.style.display = "none"));
                    button.innerText = `View all (+${hiddenCount})`;
                    button.setAttribute("data-expanded", "false");
                } else {
                    hiddenItems.forEach((item) => (item.style.display = "flex"));
                    button.innerText = "View less";
                    button.setAttribute("data-expanded", "true");
                }
            };

            return (
                <div
                    style={{
                        whiteSpace: "normal",
                        minWidth: "180px",
                        padding: "4px 0",
                    }}
                    id={containerId}
                >
                    {centers.length > 0 ? (
                        <ul
                            style={{
                                listStyle: "none",
                                padding: 0,
                                margin: 0,
                            }}
                        >
                            {centers.map((item, index) => {
                                const isHidden = index >= initialCount;
                                return (
                                    <li
                                        key={index}
                                        className={isHidden ? "hidden-center-item" : ""}
                                        style={{
                                            display: isHidden ? "none" : "flex",
                                            justifyContent: "space-between",
                                            borderBottom: index < centers.length - 1 ? "1px solid #eee" : "none",
                                            padding: "2px 0",
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontWeight: 600,
                                                color: "#007bff",
                                                fontSize: "0.85rem",
                                            }}
                                        >
                                            {display(item?.centerInfo?.title)}
                                        </span>
                                        <span
                                            style={{
                                                fontWeight: 500,
                                                marginLeft: "10px",
                                                fontSize: "0.85rem",
                                            }}
                                        >
                                            {display(item?.stock)}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        "-"
                    )}

                    {hiddenCount > 0 && (
                        <button
                            onClick={toggleCenters}
                            data-expanded="false"
                            style={{
                                background: "none",
                                border: "none",
                                color: "#007bff",
                                cursor: "pointer",
                                padding: "2px 0",
                                marginTop: "4px",
                                fontSize: "0.8rem",
                            }}
                        >
                            {`View all (+${hiddenCount})`}
                        </button>
                    )}
                </div>
            );
        },
    },
    {
        header: "Base Unit",
        accessor: "baseUnit",
        cell: (row) => <span>{normalizeUnderscores(row.medicine?.baseUnit)}</span>,
    },
    {
        header: "Category",
        accessor: "category",
        cell: (row) => <span>{normalizeUnderscores(row.medicine?.category)}</span>,
    },
];