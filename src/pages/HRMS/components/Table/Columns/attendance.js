import { capitalizeWords } from "../../../../../utils/toCapitalize";
import { format } from "date-fns-tz";

export const attendanceColumns = [
    {
        name: <div>ECode</div>,
        selector: row => row?.employee?.eCode || "-",
        sortable: true,
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
        center: true,
        wrap: true,
    },
    {
        name: <div>Current Location</div>,
        selector: row => capitalizeWords(row?.center?.title || "-"),
        wrap: true,
        minWidth: "120px"
    },
    {
        name: <div>Source</div>,
        selector: row => capitalizeWords(row?.source) || "-",
        wrap: true
    },
    {
        name: <div>Date</div>,
        selector: row => {
            const date = row?.date;
            if (!date || isNaN(new Date(date))) {
                return "-";
            }
            return format(new Date(date), "dd-MM-yyyy");
        },
        wrap: true,
    },
    {
        name: <div>Week Day</div>,
        selector: row => row?.date ? format(
            new Date(row.date),
            "EEEE",
            { timeZone: "Asia/Kolkata" }
        ) : "-",
        wrap: true,
    },
    {
        name: <div>First Check In</div>,
        selector: row => row?.firstCheckIn || "-",
        center: true,
        wrap: true,
    },
    {
        name: <div>Last Check Out</div>,
        selector: row => row?.lastCheckOut || "-",
        center: true,
        wrap: true,
    },
    {
        name: <div>Shift</div>,
        selector: row => row?.shift || "-",
        center: true,
        wrap: true
    },
    {
        name: <div>Total Time</div>,
        selector: row => row?.totalTime !== null && row?.totalTime !== undefined
            ? `${row.totalTime} hr`
            : "-",
        center: true,
        wrap: true,
    },

]