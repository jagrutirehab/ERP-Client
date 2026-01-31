import Highlighter from "react-highlight-words";
import { capitalizeWords } from "../../../../../utils/toCapitalize";
import { formatCurrency } from "../../../../../utils/formatCurrency";
import { format } from "date-fns";
import { ExpandableText } from "../../../../../Components/Common/ExpandableText";
import { Button } from "reactstrap";
import { Check, Copy, Pencil } from "lucide-react";

const baseStyle = {
    color: "#000",
    fontWeight: 600,
}

const fixedCellStyle = {
    ...baseStyle,
    backgroundColor: "#ffc000",
};

const earnedCellStyle = {
    backgroundColor: "#f8cbad",
    color: "#000",
    fontWeight: 600,
};

const PFAndESICSalaryCellStyle = {
    ...baseStyle,
    backgroundColor: "#A9D08E",
};


const employeeDeductionStyle = {
    ...baseStyle,
    backgroundColor: "#8EA9DB",
};

const employerDeductionStyle = {
    ...baseStyle,
    backgroundColor: "#7B8FD1",
};

export const salaryColumns = ({ searchText, copyId, onCopy, onOpen, hasEditPermission }) => [
    {
        name: <div>ECode</div>,
        selector: row => row?.employee?.eCode || "-",
        cell: row => (
            <Highlighter
                highlightClassName="react-highlight"
                searchWords={[searchText]}
                autoEscape
                textToHighlight={`${row?.employee?.eCode || ""}`}
            />
        ),
        wrap: true,
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
        name: <div>Cost Center</div>,
        selector: row => capitalizeWords(row?.center?.title || "-"),
        wrap: true,
        minWidth: "120px",
    },
    {
        name: <div>Gender</div>,
        selector: row => capitalizeWords(row?.employee?.gender || "-"),
        wrap: true,
    },
    {
        name: <div>Designation</div>,
        selector: row => capitalizeWords(row?.employee?.designation?.name?.replace(/_/g, " ") || "-"),
        wrap: true,
        minWidth: "150px"
    },
    {
        name: <div>Account</div>,
        selector: row => capitalizeWords(row?.salarySnapshot?.account?.replace(/_/g, " ") || "-"),
        wrap: true,
    },
    {
        name: <div>Employee Groups</div>,
        selector: row => capitalizeWords(row?.salarySnapshot?.employeeGroups?.replace(/_/g, " ") || "-"),
        wrap: true,
    },
    {
        name: <div>Total Days</div>,
        selector: row => row?.attendance?.totalDays || 0,
        wrap: true,
        center: true
    },
    {
        name: <div>Payable Days</div>,
        selector: row => row?.attendance?.payableDays || 0,
        wrap: true,
        center: true
    },
    {
        name: <div>LOP Days</div>,
        selector: row => row?.attendance?.lopDays || 0,
        wrap: true,
        center: true
    },
    {
        name: <div>Working Days Attended</div>,
        selector: row => row?.attendance?.workingDaysAttended || 0,
        wrap: true,
        center: true,
        minWidth: "110px"
    },
    {
        name: <div>Short Wages</div>,
        selector: row => formatCurrency(row?.salarySnapshot?.shortWages),
        wrap: true,
        center: true
    },
    {
        name: <div>Minimum Wages</div>,
        selector: row => formatCurrency(row?.salarySnapshot?.minimumWages),
        wrap: true,
        center: true
    },
    {
        name: <div>Basic Salary</div>,
        selector: row => formatCurrency(row?.salarySnapshot?.basicAmount),
        wrap: true,
        center: true,
        style: fixedCellStyle,
    },
    {
        name: <div>HRA</div>,
        selector: row => formatCurrency(row?.salarySnapshot?.HRAAmount),
        wrap: true,
        center: true,
        style: fixedCellStyle,
    },
    {
        name: <div>SPL Allowance</div>,
        selector: row => formatCurrency(row?.salarySnapshot?.SPLAllowance),
        wrap: true,
        center: true,
        style: fixedCellStyle,
    },
    {
        name: <div>Conveyance Allowance</div>,
        selector: row => formatCurrency(row?.salarySnapshot?.conveyanceAllowance),
        wrap: true,
        center: true,
        style: fixedCellStyle,
    },
    {
        name: <div>Statutory Bonus</div>,
        selector: row => formatCurrency(row?.salarySnapshot?.statutoryBonus),
        wrap: true,
        center: true,
        style: fixedCellStyle,
    },
    {
        name: <div>Gross Salary</div>,
        selector: row => formatCurrency(row?.salarySnapshot?.grossSalary),
        wrap: true,
        center: true,
        style: fixedCellStyle,
    },

    {
        name: <div>Basic Salary</div>,
        selector: row => formatCurrency(row?.earned?.basicAmount),
        wrap: true,
        center: true,
        style: earnedCellStyle,
    },
    {
        name: <div>HRA</div>,
        selector: row => formatCurrency(row?.earned?.HRAAmount),
        wrap: true,
        center: true,
        style: earnedCellStyle,
    },
    {
        name: <div>SPL Allowance</div>,
        selector: row => formatCurrency(row?.earned?.SPLAllowance),
        wrap: true,
        center: true,
        style: earnedCellStyle,
    },
    {
        name: <div>Conveyance Allowance</div>,
        selector: row => formatCurrency(row?.earned?.conveyanceAllowance),
        wrap: true,
        center: true,
        style: earnedCellStyle,
    },
    {
        name: <div>Statutory Bonus</div>,
        selector: row => formatCurrency(row?.earned?.statutoryBonus),
        wrap: true,
        center: true,
        style: earnedCellStyle,
    },
    {
        name: <div>Incentive</div>,
        selector: row => formatCurrency(row?.earned?.incentives),
        wrap: true,
        center: true,
        style: earnedCellStyle,
    },
    {
        name: <div>Gross Salary</div>,
        selector: row => formatCurrency(row?.earned?.grossSalary),
        wrap: true,
        center: true,
        style: employerDeductionStyle,
    },
    {
        name: <div>PF Salary</div>,
        selector: row => formatCurrency(row?.earned?.PFSalary),
        wrap: true,
        center: true,
        style: PFAndESICSalaryCellStyle,
    },
    {
        name: <div>ESIC Salary</div>,
        selector: row => formatCurrency(row?.earned?.ESICSalary),
        wrap: true,
        center: true,
        style: PFAndESICSalaryCellStyle,
    },
    {
        name: <div>PF Employee</div>,
        selector: row => formatCurrency(row?.earned?.PFEmployee),
        wrap: true,
        center: true,
        style: employeeDeductionStyle,
    },
    {
        name: <div>ESIC Employee</div>,
        selector: row => formatCurrency(row?.earned?.ESICEmployee),
        wrap: true,
        center: true,
        style: employeeDeductionStyle,
    },
    {
        name: <div>LWF Employee</div>,
        selector: row => formatCurrency(row?.earned?.LWFEmployee),
        wrap: true,
        center: true,
        style: employeeDeductionStyle,
    },
    {
        name: <div>PT</div>,
        selector: row => formatCurrency(row?.earned?.PT),
        wrap: true,
        center: true,
        style: employeeDeductionStyle,
    },
    {
        name: <div>TDS</div>,
        selector: row => formatCurrency(row?.earned?.TDSAmount),
        wrap: true,
        center: true,
        style: employeeDeductionStyle,
    },
    {
        name: <div>Salary Advance</div>,
        selector: row => formatCurrency(row?.earned?.advanceSalary),
        wrap: true,
        center: true,
        style: employeeDeductionStyle,
    },
    {
        name: <div>Insurance</div>,
        selector: row => formatCurrency(row?.earned?.insurance),
        wrap: true,
        center: true,
        style: employeeDeductionStyle,
    },
    {
        name: <div>Deductions</div>,
        selector: row => formatCurrency(row?.earned?.deductions),
        wrap: true,
        center: true,
        style: employeeDeductionStyle,
    },
    {
        name: <div>Total Net Pay</div>,
        selector: row => formatCurrency(row?.earned?.inHandSalary),
        wrap: true,
        center: true,
    },
    {
        name: <div>Remarks</div>,
        selector: row => capitalizeWords(row?.remarks || "-"),
        wrap: true,
        center: true,
    },
    {
        name: <div>Amount On Hold</div>,
        selector: row => formatCurrency(row?.amountOnHold),
        wrap: true,
        center: true,
    },
    {
        name: <div>Amount To Be Paid In Cash</div>,
        selector: row => formatCurrency(row?.cashAmount),
        wrap: true,
        center: true,
    },
    {
        name: <div>Transaction Amount</div>,
        selector: row => formatCurrency(row?.transactionAmount),
        wrap: true,
        center: true,
    },
    {
        name: <div>Transaction Type</div>,
        selector: row => row?.transactionType || "-",
        wrap: true,
        center: true,
    },
    {
        name: <div>Benificiary Code</div>,
        selector: row => row?.benificiaryCode || "-",
        wrap: true,
        center: true,
    },
    {
        name: <div>Benificiary Account Number</div>,
        selector: row => row?.bankDetails?.accountNo || "-",
        wrap: true,
    },
    {
        name: <div>Benificiary Name</div>,
        selector: row => row?.bankDetails?.accountName?.toUpperCase() || "-",
        wrap: true,
    },
    {
        name: <div>Debit Statement Narration</div>,
        selector: row => capitalizeWords(row?.salarySnapshot?.debitStatementNarration || "-"),
        wrap: true,
    },
    {
        name: <div>Transaction Date</div>,
        selector: row => {
            if (!row?.transactionDate) return "-";
            const date = new Date(row.transactionDate);
            if (isNaN(date)) return "-";
            return format(new Date(row.transactionDate), "dd-MM-yyyy")
        },
        wrap: true,
    },
    {
        name: <div>IFSC Code</div>,
        selector: row => row?.bankDetails?.IFSCCode?.toUpperCase() || "-",
        wrap: true,
    },
    {
        name: <div>E-Net Link</div>,
        selector: (row) => (
            <div className="d-flex align-items-center gap-1">
                <span className="flex-grow-1">
                    {row.eNet ? <ExpandableText text={row.eNet} limit={12} /> : "-"}
                </span>
                {row.eNet && (
                    <Button
                        color="link"
                        size="sm"
                        onClick={() => onCopy(row.eNet, row._id)}
                        className="p-0 text-muted"
                        title="Copy to clipboard"
                    >
                        {copyId === row._id ? (
                            <Check size={14} className="text-success" />
                        ) : (
                            <Copy size={14} />
                        )}
                    </Button>
                )}
            </div>
        ),
        wrap: true,
        minWidth: "200px",
        maxWidth: "400px",
    },
    ...(hasEditPermission ? [
        {
            name: <div>Action</div>,
            selector: row => (
                <button
                    className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                    onClick={() => {
                        onOpen(row);
                    }}
                >
                    <Pencil size={16} />
                </button>
            )
        },
    ] : []),
    {
        name: <div>PF Employer</div>,
        selector: (row) => formatCurrency(row?.earned?.PFEmployee),
        wrap: true,
        center: true,
        style: employerDeductionStyle
    },
    {
        name: <div>ESIC Employer</div>,
        selector: (row) => formatCurrency(row?.earned?.ESICEmployer),
        wrap: true,
        center: true,
        style: employerDeductionStyle
    },
    {
        name: <div>LWF Employer</div>,
        selector: (row) => formatCurrency(row?.earned?.LWFEmployer),
        wrap: true,
        center: true,
        style: employerDeductionStyle
    },
    {
        name: <div>Total cost of the company after increment</div>,
        selector: (row) => formatCurrency(row?.earned?.totalCostToCompany),
        wrap: true,
        center: true,
    },
    {
        name: <div>gratuity</div>,
        selector: (row) => formatCurrency(row?.earned?.gratuity),
        wrap: true,
        center: true,
    },
];