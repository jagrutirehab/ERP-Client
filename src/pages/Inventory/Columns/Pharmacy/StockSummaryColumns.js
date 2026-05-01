import { ListGroup, ListGroupItem, Button } from "reactstrap";
import { normalizeUnderscores } from "../../../../utils/normalizeUnderscore";
import { display } from "../../../../utils/display";

export const getStockSummaryColumns = () => [
    {
        name: <div>Medicine ID</div>,
        selector: (row) => row.medicine?.id,
        cell: (row) => <span>{display(row.medicine?.id)}</span>,
        sortable: true,
        minWidth: "120px",
        wrap: true,
    },
    {
        name: <div>Medicine Name</div>,
        selector: (row) => row.medicineName,
        cell: (row) => (
            <span className="font-weight-bold text-primary">
                {display(row.medicineName)}
            </span>
        ),
        sortable: true,
        minWidth: "120px",
        wrap: true,
    },
    {
        name: <div>Generic Name</div>,
        selector: (row) => row.medicine?.genericName,
        cell: (row) => <span>{row.medicine?.genericName?.toUpperCase() || "-"}</span>,
        sortable: true,
        minWidth: "100px",
        wrap: true,
    },
    {
        name: <div>Type</div>,
        selector: (row) => row.medicine?.type,
        cell: (row) => <span>{normalizeUnderscores(row.medicine?.type)}</span>,
        sortable: true,
        minWidth: "100px",
        wrap: true,
    },
    {
        name: <div>Strength</div>,
        selector: (row) => row.medicine?.strength,
        cell: (row) => <span>{display(row.medicine?.strength)}</span>,
        sortable: true,
        minWidth: "100px",
        wrap: true,
    },
    {
        name: <div>Base Unit</div>,
        selector: (row) => row.medicine?.baseUnit,
        cell: (row) => <span>{normalizeUnderscores(row.medicine?.baseUnit)}</span>,
        sortable: true,
        minWidth: "100px",
        wrap: true,
    },
    {
        name: <div>Total Stock</div>,
        selector: (row) => row.totalStock,
        cell: (row) => (
            <span>
                {row.totalStock || 0}
            </span>
        ),
        sortable: true,
        minWidth: "100px",
        wrap: true,
    },
    {
        name: <div>Total Reserved</div>,
        selector: (row) => row.totalReservedQty,
        cell: (row) => (
            <span>
                {row.totalReservedQty ? `-${row.totalReservedQty}` : 0}
            </span>
        ),
        sortable: true,
        minWidth: "120px",
        wrap: true,
    },
    {
        name: <div>Total In-Transit</div>,
        selector: (row) => row.totalInTransitQty,
        cell: (row) => (
            <span>
                {row.totalInTransitQty ? `+${row.totalInTransitQty}` : 0}
            </span>
        ),
        sortable: true,
        minWidth: "120px",
        wrap: true,
    },
    {
        name: <div>Total Requested</div>,
        selector: (row) => row.totalRequestedQty,
        cell: (row) => (
            <span>
                {row.totalRequestedQty || 0}
            </span>
        ),
        sortable: true,
        minWidth: "120px",
        wrap: true,
    },
    {
        name: (
            <div className="d-flex align-items-center w-100 fw-bold" style={{ fontSize: "0.75rem", gap: "12px", paddingRight: "20px" }}>
                <span className="flex-grow-1 text-nowrap">Center</span>
                <span className="text-end text-nowrap" style={{ width: "60px", flexShrink: 0 }}>Total</span>
                <span className="text-end text-nowrap" style={{ width: "80px", flexShrink: 0 }}>Requested</span>
                <span className="text-end text-nowrap" style={{ width: "80px", flexShrink: 0 }}>Reserved</span>
                <span className="text-end text-nowrap" style={{ width: "100px", flexShrink: 0 }}>In-Transit</span>
            </div>
        ),
        selector: (row) => row.centers,
        width: "650px",
        minWidth: "650px",
        grow: 3,
        wrap: false,
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
                    style={{ width: "100%", paddingRight: "20px", whiteSpace: "normal", display: "flex", flexDirection: "column" }}
                    className="py-1"
                    id={containerId}
                >
                    {centers.length > 0 ? (
                        <>
                            <ListGroup flush className="p-0 m-0 border-0 bg-transparent">
                                {centers.map((item, index) => {
                                    const isHidden = index >= initialCount;
                                    return (
                                        <ListGroupItem
                                            key={index}
                                            className={`border-0 ${index < centers.length - 1 ? 'border-bottom' : ''} ${isHidden ? "hidden-center-item d-none" : ""} bg-transparent`}
                                            style={{
                                                display: isHidden ? "none" : "flex",
                                                alignItems: "center",
                                                gap: "12px",
                                                padding: "6px 0",
                                                margin: 0
                                            }}
                                        >
                                            <span className="flex-grow-1 fw-semibold text-primary" style={{ fontSize: "0.85rem", minWidth: "150px" }}>
                                                {display(item?.centerInfo?.title)}
                                            </span>
                                            <span className="text-end fw-medium" style={{ width: "60px", fontSize: "0.85rem", whiteSpace: "nowrap", flexShrink: 0 }}>
                                                {display(item?.stock)}
                                            </span>
                                            <span className="text-end fw-medium" style={{ width: "80px", fontSize: "0.85rem", whiteSpace: "nowrap", flexShrink: 0 }}>
                                                {item?.requestedQty || 0}
                                            </span>
                                            <span className="text-end fw-medium" style={{ width: "80px", fontSize: "0.85rem", whiteSpace: "nowrap", flexShrink: 0 }}>
                                                {item?.reservedQty ? `-${item.reservedQty}` : 0}
                                            </span>
                                            <span className="text-end fw-medium" style={{ width: "100px", fontSize: "0.85rem", whiteSpace: "nowrap", flexShrink: 0 }}>
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
        name: <div>Form</div>,
        selector: (row) => row.medicine?.form,
        cell: (row) => <span>{normalizeUnderscores(row.medicine?.form)}</span>,
        sortable: true,
        minWidth: "120px",
        wrap: true,
    },
    {
        name: <div>Category</div>,
        selector: (row) => row.medicine?.category,
        cell: (row) => <span>{normalizeUnderscores(row.medicine?.category)}</span>,
        sortable: true,
        minWidth: "120px",
        wrap: true,
    },
];