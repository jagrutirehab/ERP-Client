import Highlighter from "react-highlight-words";
import { format } from "date-fns";
import { capitalizeWords } from "../../../../utils/toCapitalize";
import { Button } from "reactstrap";

export const regularizationSummaryColumns = ({ searchText, navigate, selectedMonth }) => [
    {
        name: <div>ECode</div>,
        selector: row => row?.eCode || "-",
        cell: row => (
            <Highlighter
                highlightClassName="react-highlight"
                searchWords={[searchText]}
                autoEscape
                textToHighlight={`${row?.eCode || ""}`}
            />
        ),
        width: "100px",
    },
    {
        name: <div>Name</div>,
        selector: row => row?.name?.toUpperCase() || "-",
        cell: row => (
            <Highlighter
                highlightClassName="react-highlight"
                searchWords={[searchText]}
                autoEscape
                textToHighlight={`${row?.name?.toUpperCase() || ""}`}
            />
        ),
        wrap: true,
        minWidth: "160px",
    },
    {
        name: <div>Center</div>,
        selector: row => capitalizeWords(row?.currentLocation?.title || "-"),
        wrap: true,
        minWidth: "120px",
    },
    {
        name: <div>Current Status</div>,
        selector: (row) =>
            row?.status === "ACTIVE"
                ? "Active"
                : row?.status === "FNF_CLOSED"
                    ? "FNF Closed"
                    : "Resigned",
        wrap: true,
    },
    {
        name: <div>Pending Count</div>,
        selector: row => row?.pendingCount || 0,
        center: true,
    },
    {
        name: <div>Regularized Count</div>,
        selector: row => row?.regularizedCount || 0,
        center: true,
    },
    {
        name: <div>Rejected Count</div>,
        selector: row => row?.rejectedCount || 0,
        center: true,
    },
    {
        name: <div>View</div>,
        cell: row => (
            <Button
                color="primary"
                className="text-white"
                size="sm"
                onClick={() =>
                    navigate(
                        `/hr/regularization/${row?.employeeId}?month=${format(selectedMonth, "yyyy-MM")}`,
                    )
                }
            >
                View
            </Button>
        ),
        center: true,
    }
];
