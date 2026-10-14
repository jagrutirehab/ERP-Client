import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { minutesToTime } from "../../../utils/time";
import { statusTitleMap } from "../../../Components/constants/HRMS";
import dayjs from "dayjs";

const locales = {};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});


const rbcOverrideStyle = `
.rbc-event {
    background: transparent !important;
    color: inherit !important;
    padding: 0 !important;
}

.rbc-event-content {
    white-space: normal !important;
}

.rbc-event-label {
    display: none !important;
}
`;


const getBaseStatus = (status) =>
    status?.endsWith("_HALF_DAY_PRESENT") ? "HALF_DAY_PRESENT" : status;

const getStatusLabel = (status) => {
    if (status?.endsWith("_HALF_DAY_PRESENT")) {
        const base = status.replace(/_HALF_DAY_PRESENT$/, "");
        const baseLabel = statusTitleMap[base] || base;
        return `${baseLabel} - Half Day Present`;
    }
    return statusTitleMap[status] || status;
};

const SHIFT_LABEL = {
    FIRST_HALF: "1st Half",
    SECOND_HALF: "2nd Half",
};

// A single date can hold two half-day leaves — e.g. the auto-deduction cron
// splits a day when the balance runs out mid-way, giving FIRST_HALF unpaid and
// SECOND_HALF paid. `leaves` carries every approved leave for the date; the
// single `status` field can only describe one of them.
const getApprovedHalves = (item) => {
    const all = (item?.dayLeaves || []).filter(
        (l) => l?.status === "approved" && l?.shiftTime && l.shiftTime !== "FULL_DAY",
    );
    return all.length > 1 ? all : [];
};

const AttendanceEvent = ({ event }) => {
    const item = event.resource;
    if (!item || item.status === "FUTURE") return null;

    const { status, firstCheckIn, lastCheckOut, workDuration, date } = item;
    const baseStatus = getBaseStatus(status);
    const halves = getApprovedHalves(item);

    return (
        <div style={styles.cardWrapper}>
            <div
                style={{
                    ...styles.statusBar,
                    backgroundColor:
                        styles.statusBarColor[baseStatus] || "#e5e7eb",
                }}
            />

            <div style={{ ...styles.card, color: "#111827" }}>
                {firstCheckIn && (
                    <div style={styles.timeRow}>
                        {minutesToTime(firstCheckIn)}
                        {lastCheckOut ? (
                            ` - ${minutesToTime(lastCheckOut)}`
                        ) : dayjs(date).isSame(dayjs(), "day") ? (
                            ""
                        ) : (
                            <span style={styles.noCheckout}> - No Check Out</span>
                        )}
                    </div>
                )}

                {firstCheckIn && (
                    <div style={styles.checkInBox}>
                        {minutesToTime(workDuration)}
                    </div>
                )}

                {halves.length ? (
                    // Two half-day leaves on one date — show each half rather
                    // than a single status that can only describe one of them.
                    // Kept tight so both rows still fit the calendar cell.
                    <div style={styles.halfList}>
                        {halves.map((h, i) => (
                            <div
                                key={h._id || i}
                                style={{
                                    ...styles.halfRow,
                                    ...styles.statusColor[h.leaveType],
                                }}
                            >
                                <span style={styles.halfTag}>
                                    {SHIFT_LABEL[h.shiftTime] || h.shiftTime}
                                </span>
                                <span style={styles.halfText}>
                                    {statusTitleMap[h.leaveType] || h.leaveType}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div
                        style={{
                            ...styles.status,
                            ...styles.statusColor[baseStatus],
                        }}
                    >
                        {getStatusLabel(status)}
                    </div>
                )}
            </div>
        </div>
    );
};

const eventStyleGetter = (event) => {
    const baseStatus = getBaseStatus(event.status);
    const bg = styles.eventBg[baseStatus] || styles.eventBg.DEFAULT;

    return {
        style: {
            backgroundColor: bg,
            border: "none",
            padding: 0,
        },
    };
};

const mapAttendanceToEvents = (data = []) =>
    data.map((item) => ({
        start: new Date(item.date),
        end: new Date(item.date),
        allDay: true,
        status: item.status,
        resource: item,
    }));


const AttendanceCalendar = ({ data, loading, reportDate, onMonthChange }) => {
    if (loading) return <CalendarSkeleton />;

    const events = mapAttendanceToEvents(data);

    return (
        <div style={{ height: "85vh" }}>
            <style>{rbcOverrideStyle}</style>

            <Calendar
                localizer={localizer}
                events={events}
                date={reportDate.start}
                onNavigate={onMonthChange}
                startAccessor="start"
                endAccessor="end"
                views={["month"]}
                defaultView="month"
                selectable={false}
                popup={false}
                toolbar
                components={{ event: AttendanceEvent }}
                eventPropGetter={eventStyleGetter}
            />
        </div>
    );
};

export default AttendanceCalendar;

const CalendarSkeleton = () => (
    <div style={{ height: "85vh" }}>
        <Skeleton height={32} width={180} style={{ marginBottom: 12 }} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
            {Array.from({ length: 35 }).map((_, i) => (
                <div
                    key={i}
                    style={{
                        border: "1px solid #e5e7eb",
                        height: 120,
                        padding: 6,
                    }}
                >
                    <Skeleton width={18} height={14} />
                    <Skeleton height={18} style={{ marginTop: 24 }} />
                </div>
            ))}
        </div>
    </div>
);


const styles = {
    cardWrapper: {
        display: "flex",
        borderRadius: "6px",
        overflow: "hidden",
    },

    statusBar: {
        width: "4px",
        flexShrink: 0,
    },

    card: {
        fontSize: "11px",
        padding: "6px",
        flex: 1,
    },

    timeRow: {
        fontWeight: 500,
        color: "#111827",
        fontSize: "11px",
    },

    noCheckout: {
        color: "#2563eb",
        fontWeight: 500,
    },

    checkInBox: {
        marginTop: "4px",
        background: "#f3f4f6",
        padding: "2px 4px",
        borderRadius: "4px",
        fontWeight: 500,
        fontSize: "10px",
    },

    status: {
        marginTop: "4px",
        fontWeight: 600,
        fontSize: "11px",
    },

    // Compact two-row block used when a date carries two half-day leaves.
    // Deliberately tighter than `status` so both rows fit the calendar cell.
    halfList: {
        marginTop: "3px",
        display: "flex",
        flexDirection: "column",
        gap: "1px",
    },

    halfRow: {
        display: "flex",
        alignItems: "center",
        gap: "3px",
        fontWeight: 600,
        fontSize: "10px",
        lineHeight: 1.25,
        minWidth: 0,
    },

    halfTag: {
        background: "#f3f4f6",
        color: "#4b5563",
        borderRadius: "3px",
        padding: "0 3px",
        fontSize: "9px",
        fontWeight: 700,
        flexShrink: 0,
        whiteSpace: "nowrap",
    },

    halfText: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        minWidth: 0,
    },

    statusColor: {
        PRESENT: { color: "#047857" },
        PENDING: { color: "#b45309" },
        WEEK_OFFS: { color: "#0dcaf0" },
        HOLIDAY: { color: "#0369a1" },
        FESTIVE_LEAVE: { color: "#0dcaf0" },
        EARNED_LEAVE: { color: "#0dcaf0" },
        LEAVE_WTIHOUT_PAYS: { color: "#0dcaf0" },
        COMP_OFF: { color: "#000000" },
        HALF_DAY: { color: "#9d174d" },
        ABSENT: { color: "#7f1d1d" },
        HALF_DAY_PRESENT: { color: "#854d0e" },
    },

    statusBarColor: {
        PRESENT: "#22c55e",
        PENDING: "#f59e0b",
        ABSENT: "#ef4444",
        WEEK_OFFS: "#0dcaf0",
        HOLIDAY: "#38bdf8",
        FESTIVE_LEAVE: "#0dcaf0",
        LEAVE_WTIHOUT_PAYS: "#0dcaf0",
        COMP_OFF:  "#000000" ,
        EARNED_LEAVE:"#0dcaf0",
        HALF_DAY: "#ec4899",
        HALF_DAY_PRESENT: "#facc15",
    },

    eventBg: {
        PRESENT: "#ecfdf5",
        PENDING: "#fef3c7",
        ABSENT: "#fee2e2",
        WEEK_OFFS: "#fee2e2",
        HOLIDAY: "#e0f2fe",
        FESTIVE_LEAVE: "#cffafe",
        LEAVE_WTIHOUT_PAYS: "#e0e7ff",
        HALF_DAY: "#fce7f3",
        HALF_DAY_PRESENT: "#fef9c3",
        EARNED_LEAVE:"#0dcaf0",
        DEFAULT: "#f9fafb",
    },
};
