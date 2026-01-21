import { Button } from "reactstrap";
import { capitalizeWords } from "../../../../../utils/toCapitalize";
import { minutesToTime } from "../../../../../utils/time";
import Highlighter from "react-highlight-words";

export const attendanceMetricsColumns = ({ onNavigate, hasUserAllViewPermission, searchText }) => [
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
        name: <div>Biometric ID</div>,
        selector: row => row?.biometricId || "-",
        cell: row => (
            <Highlighter
                highlightClassName="react-highlight"
                searchWords={[searchText]}
                autoEscape
                textToHighlight={`${row?.biometricId || ""}`}
            />
        ),
        wrap: true,
        center: true,
    },
    {
        name: <div>Center</div>,
        selector: row => capitalizeWords(row?.center?.title || "-"),
        wrap: true,
        minWidth: "120px"
    },
    {
        name: <div>Average Duration</div>,
        selector: row => `${minutesToTime(row?.avgDuration)} hr` || "-",
        wrap: true,
        center: true,
    },
    {
        name: <div>Total Days Present</div>,
        selector: row => row?.present || 0,
        wrap: true,
        center: true,
    },
    {
        name: <div>Total Days Absent</div>,
        selector: row => row?.absent || 0,
        wrap: true,
        center: true,
    },
    {
        name: <div>Total Holidays</div>,
        selector: row => row?.holidays || 0,
        wrap: true,
        center: true
    },
    {
        name: <div>Total Leaves</div>,
        selector: row => row?.leaves || 0,
        wrap: true,
        center: true
    },
    {
        name: <div>Total Week offs</div>,
        selector: row => row?.weekOffs || 0,
        wrap: true,
        center: true
    },
    {
        name: <div>Total Sundays</div>,
        selector: row => row?.sundays || 0,
        wrap: true,
        center: true,
    },
    {
        name: <div>Total days</div>,
        selector: row => row?.days || 0,
        wrap: true,
        center: true
    },
    {
        name: <div>Actions</div>,
        cell: (row) => {

            return (
                <Button
                    color="primary"
                    size="sm"
                    className="text-white"
                    onClick={() => onNavigate(row.employee?._id)}>
                    Attendance
                </Button>
            )
        },
        minWidth: "150px"
    }
];
