import { capitalizeWords } from "../../../../../utils/toCapitalize";

export const attendanceMetricsColumns = [
    {
        name: <div>ECode</div>,
        selector: row => row?.employee?.eCode || "-",
        sortable: true,
        wrap: true,
    },
    {
        name: <div>Name</div>,
        selector: row => row?.employee?.name?.toUpperCase() || "-",
        wrap: true,
        minWidth: "160px",
    },
    {
        name: <div>Biometric ID</div>,
        selector: row => row?.biometricId || "-",
        wrap: true,
        center: true,
        sortable: true,
    },
    {
        name: <div>Current Location</div>,
        selector: row => capitalizeWords(row?.center?.title || "-"),
        wrap: true,
        minWidth: "120px"
    },
    {
        name: <div>Average Duration</div>,
        selector: row => `${row?.avgDuration} hr` || "-",
        wrap: true,
        center: true,
    },
    {
        name: <div>Total Days Present</div>,
        selector: row => row?.totalDaysPresent || 0,
        wrap: true,
        center: true,
    },
    {
        name: <div>Total Days Absent</div>,
        selector: row => row?.totalDaysAbsent || 0,
        wrap: true,
        center: true,
    },
    {
        name: <div>Total Sundays</div>,
        selector: row => row?.totalSundays || 0,
        wrap: true,
        center: true,
    },
];
