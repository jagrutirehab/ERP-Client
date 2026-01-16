import { ExpandableText } from "../../../../../Components/Common/ExpandableText";
import { renderStatusBadge } from "../../../../../Components/Common/renderStatusBadge";
import { leaveTypes } from "../../../../../Components/constants/HRMS";
import { isToday, minutesTo12HourTime, minutesToTime } from "../../../../../utils/time";
import { capitalizeWords } from "../../../../../utils/toCapitalize";

export const myAttendanceLogsColumns = ({ hasUserAllViewPermission }) => [
    {
        name: <div>Date</div>,
        selector: row => (
            <div className="d-flex flex-column gap-1">
                <span className="fw-semibold">
                    {row?.date}
                </span>
                {renderStatusBadge(row?.status)}
            </div>
        ),
        wrap: true,
    },
    {
        name: <div>Shift Timing</div>,
        selector: (row) => {
            const hasTiming =
                row?.timing?.start != null && row?.timing?.end != null;

            return (
                <div className="d-flex flex-column gap-1">
                    <span>
                        {hasTiming
                            ? `${minutesTo12HourTime(row.timing.start)} - ${minutesTo12HourTime(
                                row.timing.end
                            )}`
                            : "--"}
                    </span>

                    {leaveTypes.includes(row?.status) && renderStatusBadge(row?.shiftTime)}
                </div>
            );
        },
        wrap: true,
    },
    {
        name: <div>Type</div>,
        selector: (row) => capitalizeWords(row?.source) || "-"
    },
    {
        name: <div>Check-In</div>,
        selector: (row) => {
            if (row?.firstCheckIn != null) {
                return minutesTo12HourTime(row.firstCheckIn);
            }

            if (
                isToday(row.date) &&
                ["ABSENT", "PENDING"].includes(row.status)
            ) {
                return renderStatusBadge("PENDING");
            }

            return "--";
        },
    },
    {
        name: <div>Check-Out</div>,
        selector: (row) => {
            if (row?.lastCheckOut != null) {
                return minutesTo12HourTime(row.lastCheckOut);
            }

            if (
                isToday(row.date) &&
                ["PENDING"].includes(row.status)
            ) {
                return renderStatusBadge("PENDING");
            }

            return "--";
        },
    },
    {
        name: <div>Work Duration</div>,
        selector: row => (
            <span>
                {row?.workDuration > 0 ? `${minutesToTime(row.workDuration)} hr` : "--"}
            </span>
        )
    },
    ...(hasUserAllViewPermission
        ? [
            {
                name: <div>Check-In Device</div>,
                selector: row =>
                    row?.checkInMeta?.device
                        ? capitalizeWords(row.checkInMeta.device)
                        : "—",
            },
            {
                name: <div>Check-Out Device</div>,
                selector: row =>
                    row?.checkOutMeta?.device
                        ? capitalizeWords(row.checkOutMeta.device)
                        : "—",
            },
            {
                name: <div>Check-In Location</div>,
                selector: row =>
                    row?.checkInMeta?.displayName
                        ? <ExpandableText text={capitalizeWords(row.checkInMeta.displayName)} limit={20} />
                        : "—",
                wrap: true,
                minWidth: "150px"
            },
            {
                name: <div>Check-Out Location</div>,
                selector: row =>
                    row?.checkOutMeta?.displayName
                        ? <ExpandableText text={capitalizeWords(row.checkOutMeta.displayName)} limit={20} />
                        : "—",
                wrap: true,
                minWidth: "150px"
            },
        ]
        : [])
];