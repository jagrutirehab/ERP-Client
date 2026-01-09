import { Button } from "reactstrap";
import { capitalizeWords } from "../../../../../utils/toCapitalize";
import { Pencil } from "lucide-react";
import { format } from "date-fns";
import Highlighter from "react-highlight-words";

export const employeeReportingsColumns = ({
    onEdit,
    hasEditPermission,
    searchText
}) => [
        {
            name: <div>ECode</div>,
            selector: row => row?.employee?.eCode ?? "-",
            cell: row => (
                <Highlighter
                    highlightClassName="react-highlight"
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={`${row.employee?.eCode || ""}`}
                />
            ),
            sortable: true,
            wrap: true,
        },
        {
            name: <div>Name</div>,
            selector: row => row?.employee?.name?.toUpperCase() ?? "-",
            cell: row => (
                <Highlighter
                    highlightClassName="react-highlight"
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={`${row.employee?.name.toUpperCase() || ""}`}
                />
            ),
            wrap: true,
            minWidth: "160px",
        },
        {
            name: <div>Current Location</div>,
            cell: row =>
                row?.employee?.currentLocation?.title
                    ? capitalizeWords(row.employee.currentLocation.title)
                    : "-",
            minWidth: "120px",
        },
        {
            name: "Manager",
            cell: row => {
                if (!row?.manager) return "-";

                const name = row.manager.name?.toUpperCase() || "";
                const eCode = row.manager.eCode || "-";

                return (
                    <span>
                        <Highlighter
                            highlightClassName="react-highlight"
                            searchWords={[searchText]}
                            autoEscape
                            textToHighlight={name}
                        />
                        {" "}
                        (
                        <Highlighter
                            highlightClassName="react-highlight"
                            searchWords={[searchText]}
                            autoEscape
                            textToHighlight={eCode}
                        />
                        )
                    </span>
                );
            },
            minWidth: "160px",
            wrap: true,
        },
        {
            name: "Shift",
            selector: row => capitalizeWords(row?.shift ?? "-"),
            center: true,
            wrap: true
        },
        {
            name: "Shift Timing",
            cell: row =>
                row?.timing
                    ? `${row.timing.start} - ${row.timing.end}`
                    : "-",
            wrap: true,
            minWidth: "120px"
        },
        {
            name: <div>Active</div>,
            cell: row => row?.isActive ? "Yes" : "No",
            center: true,
            wrap: true
        },
        {
            name: <div>Assigned By</div>,
            selector: row => (
                <div>
                    <div>{capitalizeWords(row?.assignedBy?.name || "-")}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                        {row?.assignedBy?.email || "-"}
                    </div>
                </div>
            ),
            wrap: true,
            minWidth: "200px",
        },
        {
            name: <div>Start From</div>,
            selector: row => {
                const createdAt = row?.createdAt;
                if (!createdAt || isNaN(new Date(createdAt))) {
                    return "-"
                }
                return format(new Date(createdAt), "dd MMM yyyy, hh:mm a");
            },
            wrap: true,
            minWidth: "120px"
        },
        {
            name: <div>Ended At</div>,
            cell: row => {
                const endedAt = row?.endedAt;
                if (!endedAt || isNaN(new Date(endedAt))) {
                    return "-"
                }
                return format(new Date(endedAt), "dd MMM yyyy, hh:mm a");
            },
            minWidth: "120px"
        },
        {
            name: <div>Last Updated</div>,
            selector: row => {
                const lastChangedAt = row?.lastChangedAt;
                if (!lastChangedAt || isNaN(new Date(lastChangedAt))) {
                    return "-"
                }
                return format(new Date(lastChangedAt), "dd MMM yyyy, hh:mm a");
            },
            wrap: true,
            minWidth: "120px"
        },
        ...(hasEditPermission ? [
            {
                name: "Action",
                cell: row =>
                    row?.isActive ? (
                        <Button
                            color="outline-primary"
                            size="sm"
                            onClick={() => onEdit(row)}
                        >
                            <Pencil size={16} />
                        </Button>
                    ) : <i className="text-mutted">Action not permitted</i>,
                center: true,
                ignoreRowClick: true,
                allowOverflow: true,
                button: true,
            },
        ] : [])

    ];
