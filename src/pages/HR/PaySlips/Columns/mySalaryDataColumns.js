import { Badge } from 'reactstrap';
import { format } from 'date-fns';
import { formatCurrency } from '../../../../utils/formatCurrency';
import { capitalizeWords } from '../../../../utils/toCapitalize';

export const mySalaryDataColumns = () => [
    {
        name: "Change Type",
        selector: (row) => row.changeType || "—",
        cell: (row) => (
            <Badge color="primary" className="text-white">
                {row.changeType || "—"}
            </Badge>
        ),
        minWidth: "130px",
    },
    {
        name: "Center",
        selector: (row) => row.employee?.center?.title || "—",
        cell: (row) => row.employee?.center?.title || "—",
        minWidth: "130px",
    },
    {
        name: "Designation",
        selector: (row) => row.employee?.designation?.name || "—",
        cell: (row) => capitalizeWords(row.employee?.designation?.name?.replace(/_/g, " ")) || "—",
        minWidth: "150px",
    },
    {
        name: "Department",
        selector: (row) => row.employee?.department?.department || "—",
        cell: (row) => capitalizeWords(row.employee?.department?.department?.replace(/_/g, " ")) || "—",
        minWidth: "150px",
    },
    {
        name: "Position",
        selector: (row) => row.employee?.position?.name || "—",
        cell: (row) => capitalizeWords(row.employee?.position?.name?.replace(/_/g, " ")) || "—",
        minWidth: "150px",
    },
    {
        name: "Employment Type",
        selector: (row) => row.employee?.employmentType || "—",
        cell: (row) => capitalizeWords(row.employee?.employmentType?.replace(/_/g, " ")) || "—",
        minWidth: "150px",
    },
    {
        name: "Employee Group",
        selector: (row) => row.financeDetails?.employeeGroups || "—",
        cell: (row) => capitalizeWords(row.financeDetails?.employeeGroups?.replace(/_/g, " ")) || "—",
        minWidth: "150px",
    },
    {
        name: "Account Type",
        selector: (row) => row.financeDetails?.account || "—",
        cell: (row) => capitalizeWords(row.financeDetails?.account?.replace(/_/g, " ")) || "—",
        minWidth: "160px",
    },
    {
        name: "Gross Salary",
        selector: (row) => row.financeDetails?.grossSalary,
        cell: (row) => formatCurrency(row.financeDetails?.grossSalary),
        minWidth: "130px",
    },
    {
        name: "Basic Amount",
        selector: (row) => row.financeDetails?.basicAmount,
        cell: (row) => formatCurrency(row.financeDetails?.basicAmount),
        minWidth: "130px",
    },
    {
        name: "Basic %",
        selector: (row) => row.financeDetails?.basicPercentage ?? "—",
        cell: (row) => row.financeDetails?.basicPercentage ?? "—",
        minWidth: "90px",
    },
    {
        name: "HRA",
        selector: (row) => row.financeDetails?.HRAAmount,
        cell: (row) => formatCurrency(row.financeDetails?.HRAAmount),
        minWidth: "120px",
    },
    {
        name: "HRA %",
        selector: (row) => row.financeDetails?.HRAPercentage ?? "—",
        cell: (row) => row.financeDetails?.HRAPercentage ?? "—",
        minWidth: "90px",
    },
    {
        name: "SPL Allowance",
        selector: (row) => row.financeDetails?.SPLAllowance,
        cell: (row) => formatCurrency(row.financeDetails?.SPLAllowance),
        minWidth: "130px",
    },
    {
        name: "Conveyance",
        selector: (row) => row.financeDetails?.conveyanceAllowance,
        cell: (row) => formatCurrency(row.financeDetails?.conveyanceAllowance),
        minWidth: "120px",
    },
    {
        name: "Statutory Bonus",
        selector: (row) => row.financeDetails?.statutoryBonus,
        cell: (row) => formatCurrency(row.financeDetails?.statutoryBonus),
        minWidth: "140px",
    },
    {
        name: "Minimum Wages",
        selector: (row) => row.financeDetails?.minimumWages,
        cell: (row) => formatCurrency(row.financeDetails?.minimumWages),
        minWidth: "140px",
    },
    {
        name: "In Hand Salary",
        selector: (row) => row.financeDetails?.inHandSalary,
        cell: (row) => formatCurrency(row.financeDetails?.inHandSalary),
        minWidth: "140px",
    },
    {
        name: "PF Employee",
        selector: (row) => row.financeDetails?.PFEmployee,
        cell: (row) => formatCurrency(row.financeDetails?.PFEmployee),
        minWidth: "120px",
    },
    {
        name: "PF Employer",
        selector: (row) => row.financeDetails?.PFAmount,
        cell: (row) => formatCurrency(row.financeDetails?.PFAmount),
        minWidth: "120px",
    },
    {
        name: "PT",
        selector: (row) => row.financeDetails?.PT,
        cell: (row) => formatCurrency(row.financeDetails?.PT),
        minWidth: "90px",
    },
    {
        name: "ESIC Employee",
        selector: (row) => row.financeDetails?.ESICEmployee,
        cell: (row) => formatCurrency(row.financeDetails?.ESICEmployee),
        minWidth: "130px",
    },
    {
        name: "ESIC Employer",
        selector: (row) => row.financeDetails?.ESICEmployer,
        cell: (row) => formatCurrency(row.financeDetails?.ESICEmployer),
        minWidth: "130px",
    },
    {
        name: "Insurance",
        selector: (row) => row.financeDetails?.insurance,
        cell: (row) => formatCurrency(row.financeDetails?.insurance),
        minWidth: "110px",
    },
    {
        name: "Gratuity",
        selector: (row) => row.financeDetails?.gratuity,
        cell: (row) => formatCurrency(row.financeDetails?.gratuity),
        minWidth: "110px",
    },
    {
        name: "Total CTC",
        selector: (row) => row.financeDetails?.totalCostToCompany,
        cell: (row) => formatCurrency(row.financeDetails?.totalCostToCompany),
        minWidth: "120px",
    },
    {
        name: "Increment Letter",
        cell: (row) => row.financeDetails?.incrementLetter ? (
            <a
                href={row.financeDetails.incrementLetter}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#007bff", textDecoration: "underline" }}
            >
                View
            </a>
        ) : "—",
        minWidth: "130px",
    },
    {
        name: "Increment Issued",
        selector: (row) => row.financeDetails?.incrementIssued,
        cell: (row) => row.financeDetails?.incrementIssued
            ? format(new Date(row.financeDetails.incrementIssued), "dd MMM yyyy")
            : "—",
        minWidth: "150px",
    },
    {
        name: "Active",
        selector: (row) => row.isActive,
        cell: (row) => (
            <Badge color={row.isActive ? "success" : "danger"} className="text-white">
                {row.isActive ? "Active" : "Inactive"}
            </Badge>
        ),
        minWidth: "90px",
    },
    {
        name: "Created At",
        selector: (row) => row.createdAt,
        cell: (row) => row.createdAt ? format(new Date(row.createdAt), "dd MMM yyyy") : "—",
        minWidth: "130px",
    },
    {
        name: "Ended At",
        selector: (row) => row.endedAt,
        cell: (row) => row.endedAt ? format(new Date(row.endedAt), "dd MMM yyyy") : "—",
        minWidth: "130px",
    },
];