import { useState } from "react";
import { normalizeUnderscores } from "../../../../utils/normalizeUnderscore";
import { display } from "../../../../utils/display";

const CENTER_PREVIEW_COUNT = 2;

const CenterStockList = ({ centers = [] }) => {
    const [expanded, setExpanded] = useState(false);
    if (centers.length === 0) return "-";

    const hiddenCount = centers.length - CENTER_PREVIEW_COUNT;
    const visible = expanded ? centers : centers.slice(0, CENTER_PREVIEW_COUNT);

    return (
        <div>
            <table style={{ borderCollapse: "collapse", width: "100%", tableLayout: "fixed" }}>
                <colgroup>
                    <col />
                    <col style={{ width: 60 }} />
                    <col style={{ width: 70 }} />
                    <col style={{ width: 70 }} />
                    <col style={{ width: 80 }} />
                </colgroup>
                <tbody>
                    {visible.map((item, index) => (
                        <tr key={index}>
                            <td className="fw-semibold text-primary pe-2" style={{ fontSize: 11 }}>
                                {display(item?.centerInfo?.title)}
                            </td>
                            <td className="text-end fw-bold" style={{ fontSize: 11 }}>
                                {display(item?.stock)}
                            </td>
                            <td className="text-end" style={{ fontSize: 11 }}>
                                {item?.requestedQty || 0}
                            </td>
                            <td className="text-end" style={{ fontSize: 11 }}>
                                {item?.reservedQty ? `-${item.reservedQty}` : 0}
                            </td>
                            <td className="text-end" style={{ fontSize: 11 }}>
                                {item?.inTransitQty ? `+${item.inTransitQty}` : 0}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {hiddenCount > 0 && (
                <button
                    type="button"
                    className="btn btn-link p-0 text-primary text-decoration-none"
                    style={{ fontSize: 11 }}
                    onClick={() => setExpanded((prev) => !prev)}
                >
                    {expanded ? "View less" : `View all (+${hiddenCount})`}
                </button>
            )}
        </div>
    );
};

export const getStockSummaryGridColumns = () => [
    {
        key: "medicineId",
        header: "Medicine ID",
        minWidth: 100,
        render: (row) => display(row.medicine?.id),
    },
    {
        key: "medicineName",
        header: "Medicine Name",
        minWidth: 160,
        render: (row) => <span className="fw-bold text-primary">{display(row.medicineName)}</span>,
    },
    {
        key: "genericName",
        header: "Generic Name",
        minWidth: 140,
        render: (row) => row.medicine?.genericName?.toUpperCase() || "-",
    },
    {
        key: "type",
        header: "Type",
        minWidth: 90,
        render: (row) => normalizeUnderscores(row.medicine?.type),
    },
    {
        key: "strength",
        header: "Strength",
        minWidth: 90,
        render: (row) => display(row.medicine?.strength),
    },
    {
        key: "baseUnit",
        header: "Base Unit",
        minWidth: 90,
        render: (row) => normalizeUnderscores(row.medicine?.baseUnit),
    },
    {
        key: "totalStock",
        header: "Total Stock",
        align: "right",
        minWidth: 90,
        render: (row) => row.totalStock || 0,
    },
    {
        key: "totalReserved",
        header: "Total Reserved",
        align: "right",
        minWidth: 100,
        render: (row) => (row.totalReservedQty ? `-${row.totalReservedQty}` : 0),
    },
    {
        key: "totalInTransit",
        header: "Total In-Transit",
        align: "right",
        minWidth: 100,
        render: (row) => (row.totalInTransitQty ? `+${row.totalInTransitQty}` : 0),
    },
    {
        key: "totalRequested",
        header: "Total Requested",
        align: "right",
        minWidth: 100,
        render: (row) => row.totalRequestedQty || 0,
    },
    {
        key: "centers",
        header: (
            <table style={{ borderCollapse: "collapse", width: "100%", tableLayout: "fixed" }}>
                <colgroup>
                    <col />
                    <col style={{ width: 60 }} />
                    <col style={{ width: 70 }} />
                    <col style={{ width: 70 }} />
                    <col style={{ width: 80 }} />
                </colgroup>
                <tbody>
                    <tr>
                        <td style={{ fontWeight: 700 }}>Center</td>
                        <td className="text-end" style={{ fontWeight: 700 }}>Total</td>
                        <td className="text-end" style={{ fontWeight: 700 }}>Requested</td>
                        <td className="text-end" style={{ fontWeight: 700 }}>Reserved</td>
                        <td className="text-end" style={{ fontWeight: 700 }}>In-Transit</td>
                    </tr>
                </tbody>
            </table>
        ),
        minWidth: 380,
        render: (row) => <CenterStockList centers={row.centers} />,
    },
    {
        key: "form",
        header: "Form",
        minWidth: 100,
        render: (row) => normalizeUnderscores(row.medicine?.form),
    },
    {
        key: "category",
        header: "Category",
        minWidth: 110,
        render: (row) => normalizeUnderscores(row.medicine?.category),
    },
];
