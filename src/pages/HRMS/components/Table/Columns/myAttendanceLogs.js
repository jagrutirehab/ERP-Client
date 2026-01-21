import { ExpandableText } from "../../../../../Components/Common/ExpandableText";
import { renderStatusBadge } from "../../../../../Components/Common/renderStatusBadge";
import { leaveTypes } from "../../../../../Components/constants/HRMS";
import {
  isToday,
  minutesToTime,
} from "../../../../../utils/time";
import { capitalizeWords } from "../../../../../utils/toCapitalize";

export const myAttendanceLogsColumns = ({
  hasUserAllViewPermission,
  setSelectedRow,
  setRegularizeModalOpen,
  loading,
  hasWrite,
  hasDelete,
}) => [
    {
      name: <div>Date</div>,
      selector: (row) => (
        <div className="d-flex flex-column gap-1">
          <span className="fw-semibold">{row?.date}</span>
          {renderStatusBadge(row?.status)}
        </div>
      ),
      wrap: true,
    },
    {
      name: <div>Shift Timing</div>,
      selector: (row) => {
        const hasTiming = row?.timing?.start != null && row?.timing?.end != null;

        return (
          <div className="d-flex flex-column gap-1">
            <span>
              {hasTiming
                ? `${minutesToTime(row.timing.start)} - ${minutesToTime(
                  row.timing.end,
                )}`
                : "--"}
            </span>

            {leaveTypes.includes(row?.status) &&
              renderStatusBadge(row?.shiftTime)}
          </div>
        );
      },
      wrap: true,
      minWidth: "110px"
    },
    {
      name: <div>Type</div>,
      selector: (row) => capitalizeWords(row?.source) || "-",
    },
    {
      name: <div>Check-In</div>,
      selector: (row) => {
        if (row?.firstCheckIn != null) {
          return minutesToTime(row.firstCheckIn);
        }

        if (isToday(row.date) && ["ABSENT", "PENDING"].includes(row.status)) {
          return renderStatusBadge("PENDING");
        }

        return "--";
      },
    },
    {
      name: <div>Check-Out</div>,
      selector: (row) => {
        if (row?.lastCheckOut != null) {
          return minutesToTime(row.lastCheckOut);
        }

        if (isToday(row.date) && ["PENDING"].includes(row.status)) {
          return renderStatusBadge("PENDING");
        }

        return "--";
      },
    },
    {
      name: <div>Work Duration</div>,
      selector: (row) => (
        <span>
          {row?.workDuration > 0 ? `${minutesToTime(row.workDuration)} hr` : "--"}
        </span>
      ),
    },
    {
      name: <div>Regularization Status</div>,
      cell: (row) => {
        const status = row?.regularizations?.regularization_id?.status;
        return renderStatusBadge(status)
      },
      wrap: true
    },

    {
      name: <div>Action</div>,
      cell: (row) =>
        !loading &&
        (hasWrite || hasDelete) &&
        !row?.regularizations?.regularization_id && (
          <button
            className="btn btn-sm btn-outline-primary"
            style={{
              borderRadius: "6px",
              fontSize: "13px",
              padding: "4px 10px",
              fontWeight: 500,
            }}
            onClick={() => {
              setSelectedRow(row);
              setRegularizeModalOpen(true);
            }}
          >
            Regularize
          </button>
        ),
      wrap: true,
      minWidth: "120px"
    },

    ...(hasUserAllViewPermission
      ? [
        {
          name: <div>Check-In Device</div>,
          selector: (row) =>
            row?.checkInMeta?.device
              ? capitalizeWords(row.checkInMeta.device)
              : "—",
          wrap: true
        },
        {
          name: <div>Check-Out Device</div>,
          selector: (row) =>
            row?.checkOutMeta?.device
              ? capitalizeWords(row.checkOutMeta.device)
              : "—",
          wrap: true
        },
        {
          name: <div>Check-In Location</div>,
          selector: (row) =>
            row?.checkInMeta?.displayName ? (
              <ExpandableText
                text={capitalizeWords(row.checkInMeta.displayName)}
                limit={20}
              />
            ) : (
              "—"
            ),
          wrap: true,
          minWidth: "150px",
        },
        {
          name: <div>Check-Out Location</div>,
          selector: (row) =>
            row?.checkOutMeta?.displayName ? (
              <ExpandableText
                text={capitalizeWords(row.checkOutMeta.displayName)}
                limit={20}
              />
            ) : (
              "—"
            ),
          wrap: true,
          minWidth: "150px",
        },
      ]
      : []),
  ];
