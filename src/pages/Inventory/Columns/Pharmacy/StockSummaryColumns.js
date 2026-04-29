import { normalizeUnderscores } from "../../../../utils/normalizeUnderscore";
import { display } from "../../../../utils/display";
import { ListGroup, ListGroupItem, Button } from "reactstrap";

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
                {display(row.medicineName)}
            </span>
        ),
    },
    {
        header: "Generic Name",
        accessor: "genericName",
        cell: (row) => <span>{row.medicine?.genericName?.toUpperCase() || "-"}</span>,
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
        header: "Base Unit",
        accessor: "baseUnit",
        cell: (row) => <span>{normalizeUnderscores(row.medicine?.baseUnit)}</span>,
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
        header: "Total Reserved",
        accessor: "totalReservedQty",
        cell: (row) => (
            <span>
                {row.totalReservedQty ? `-${row.totalReservedQty}` : 0}
            </span>
        ),
    },
    {
        header: "Total In-Transit",
        accessor: "totalInTransitQty",
        cell: (row) => (
            <span>
                {row.totalInTransitQty ? `+${row.totalInTransitQty}` : 0}
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
                    hiddenItems.forEach((item) => {
                        item.classList.add("d-none");
                        item.classList.remove("d-flex");
                    });
                    button.innerText = `View all (+${hiddenCount})`;
                    button.setAttribute("data-expanded", "false");
                } else {
                    hiddenItems.forEach((item) => {
                        item.classList.remove("d-none");
                        item.classList.add("d-flex");
                    });
                    button.innerText = "View less";
                    button.setAttribute("data-expanded", "true");
                }
            };

            return (
                <div
                    style={{ minWidth: "320px", whiteSpace: "normal" }}
                    className="py-1"
                    id={containerId}
                >
                    {centers.length > 0 ? (
                        <>
                            <div className="d-flex align-items-center border-bottom border-2 pb-1 mb-1 fw-bold" style={{ fontSize: "0.75rem", gap: "4px" }}>
                                <span className="flex-grow-1 text-nowrap">Center</span>
                                <span className="text-end text-nowrap" style={{ width: "52px" }}>Total</span>
                                <span className="text-end text-nowrap" style={{ width: "62px" }}>Reserved</span>
                                <span className="text-end text-nowrap" style={{ width: "66px" }}>In-Transit</span>
                            </div>
                            <ListGroup flush className="p-0 m-0 border-0 bg-transparent">
                                {centers.map((item, index) => {
                                    const isHidden = index >= initialCount;
                                    return (
                                        <ListGroupItem
                                            key={index}
                                            className={`p-1 border-0 ${index < centers.length - 1 ? 'border-bottom' : ''} ${isHidden ? "hidden-center-item d-none" : "d-flex"} align-items-center bg-transparent`}
                                            style={{ gap: "4px" }}
                                        >
                                            <span className="flex-grow-1 fw-semibold text-primary" style={{ fontSize: "0.85rem" }}>
                                                {display(item?.centerInfo?.title)}
                                            </span>
                                            <span className="text-end fw-medium" style={{ width: "52px", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                                                {display(item?.stock)}
                                            </span>
                                            <span className="text-end fw-medium" style={{ width: "62px", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                                                {item?.reservedQty ? `-${item.reservedQty}` : 0}
                                            </span>
                                            <span className="text-end fw-medium" style={{ width: "66px", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                                                {item?.inTransitQty ? `+${item.inTransitQty}` : 0}
                                            </span>
                                        </ListGroupItem>
                                    );
                                })}
                            </ListGroup>
                        </>
                    ) : (
                        "-"
                    )}

                    {hiddenCount > 0 && (
                        <Button
                            color="link"
                            className="p-0 mt-1 text-primary shadow-none fw-medium text-decoration-none"
                            style={{ fontSize: "0.8rem" }}
                            onClick={toggleCenters}
                            data-expanded="false"
                        >
                            {`View all (+${hiddenCount})`}
                        </Button>
                    )}
                </div>
            );
        },
    },
    {
        header: "Form",
        accessor: "form",
        cell: (row) => <span>{normalizeUnderscores(row.medicine?.form)}</span>,
    },
    {
        header: "Category",
        accessor: "category",
        cell: (row) => <span>{normalizeUnderscores(row.medicine?.category)}</span>,
    },
];