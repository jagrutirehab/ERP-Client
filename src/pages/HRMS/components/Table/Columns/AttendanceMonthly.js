import Highlighter from "react-highlight-words";
import { capitalizeWords } from "../../../../../utils/toCapitalize";
import { format } from "date-fns";
import { formatCurrency } from "../../../../../utils/formatCurrency";

export const attendanceMonthlyColumns = ({ searchText }) => [
    {
        name: <div>ECode</div>,
        selector: row => row?.employee?.eCode || "",
        cell: row => (
            <Highlighter
                highlightClassName="react-highlight"
                searchWords={[searchText]}
                autoEscape
                textToHighlight={`${row?.employee?.eCode.toUpperCase() || ""}`}
            />
        )
    },
    {
        name: <div>Name</div>,
        selector: row => row?.employee?.name?.toUpperCase() || "-",
        cell: row => (
            <Highlighter
                highlightClassName="react-highlight"
                searchWords={[searchText]}
                autoEscape
                textToHighlight={`${row?.employee?.name.toUpperCase() || ""}`}
            />
        ),
        wrap: true,
        minWidth: "160px",
    },
    {
        name: <div>Upload Location</div>,
        selector: row => capitalizeWords(row?.uploadCenter?.title || "-"),
        wrap: true,
        minWidth: "120px"
    },
    {
        name: <div>Current Location</div>,
        selector: row => capitalizeWords(row?.currentLocation?.title || "-"),
        wrap: true,
        minWidth: "120px"
    },
    {
        name: <div>Transferred From</div>,
        selector: row => capitalizeWords(row?.transferredFrom?.title || "-"),
        wrap: true,
        minWidth: "120px"
    },
    {
        name: <div>Transfer Date</div>,
        selector: row => {
            const date = row?.transferDate;
            if (!date || isNaN(new Date(date))) {
                return "-";
            }
            return format(new Date(date), "dd-MM-yyyy");
        },
        wrap: true,
    },
    {
        name: <div>Actual Present Days</div>,
        selector: row => row?.attendance?.presentDays || 0
    },
    {
        name: <div>Weekly Offs</div>,
        selector: row => row?.attendance?.weekOffs || 0
    },
    {
        name: <div>CL/Holiday Approved</div>,
        selector: row => row?.attendance?.approvedLeaves || 0
    },
    {
        name: <div>Total Payable Days</div>,
        selector: row => row?.attendance?.payableDays || 0
    },
    {
        name: <div>Bank Name</div>,
        selector: row => row?.bankDetails?.bankName || "-",
        wrap: true,
        minWidth: "160px",
    },
    {
        name: <div>Account No</div>,
        selector: row => row?.bankDetails?.accountNo || "-",
        wrap: true,
        minWidth: "180px",
    },
    {
        name: <div>Account Holder's Name</div>,
        selector: row => row?.bankDetails?.accountName || "-",
        wrap: true,
        minWidth: "180px",
    },
    {
        name: <div>IFSC Code</div>,
        selector: row => row?.bankDetails?.IFSCCode || "-",
        wrap: true,
        minWidth: "150px",
    },
    {
        name: <div>Incentives</div>,
        selector: row => formatCurrency(row?.financeDetails?.incentives),
    },
    {
        name: <div>Remarks</div>,
        selector: row => row?.financeDetails?.remarks || "-",
        wrap: true,
        minWidth: "120px",
    },
    {
        name: <div>Last Updated</div>,
        selector: row => {
            const date = row?.updatedAt;
            if (!date || isNaN(new Date(date))) {
                return "-";
            }
            return format(new Date(date), "dd MMM yyyy, hh:mm a");
        },
        wrap: true,
        minWidth: "120px",
    },
];