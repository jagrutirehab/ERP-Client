import { Button } from "reactstrap";
import { ExpandableText } from "../../../../../Components/Common/ExpandableText";
import { renderStatusBadge } from "../../../../../Components/Common/renderStatusBadge";
import { leaveTypes } from "../../../../../Components/constants/HRMS";
import { isToday, minutesToTime } from "../../../../../utils/time";
import { capitalizeWords } from "../../../../../utils/toCapitalize";

const isFutureDate = (date) => {
  if (!date) return false;
  return new Date(date).setHours(0, 0, 0, 0) > new Date().setHours(0, 0, 0, 0);
};

export const myAttendanceLogsColumns = ({
  hasUserAllViewPermission,
  setSelectedRow,
  setRegularizeModalOpen,
  setLeaveModalOpen,
  loading,
  canShowActionButton,
  hasMyRegularizationPermission,
  isSelf
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
      minWidth: "110px",
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
        return renderStatusBadge(status);
      },
      wrap: true,
    },
    {
      name: <div>Leave Status</div>,
      cell: (row) => {
        const status = row?.leave?.status;
        return renderStatusBadge(status?.toUpperCase());
      },
      wrap: true,
    },
    ...(canShowActionButton && hasMyRegularizationPermission
      ? [
        {
          name: <div className="text-center">Action</div>,
          cell: (row) =>
            !loading && (
              <div className="d-flex gap-1 justify-content-center">
                {!row?.regularizations?.regularization_id && !isFutureDate(row?.date) && (
                  <Button
                    size="sm"
                    color="primary"
                    className="text-white"
                    onClick={() => {
                      setSelectedRow(row);
                      setRegularizeModalOpen(true);
                    }}
                  >
                    Regularize
                  </Button>
                )}
                {!row?.leave && !isSelf && (
                  <Button
                    size="sm"
                    color="primary"
                    className="text-white"
                    onClick={() => {
                      setSelectedRow(row);
                      setLeaveModalOpen(true);
                    }}
                  >
                    Leave
                  </Button>
                )}
              </div>
            ),
          wrap: true,
          minWidth: "220px",
        },
      ]
      : []),

    ...(hasUserAllViewPermission
      ? [
        {
          name: <div>Check-In Device</div>,
          selector: (row) =>
            row?.checkInMeta?.device
              ? capitalizeWords(row.checkInMeta.device)
              : "—",
          wrap: true,
        },
        {
          name: <div>Check-Out Device</div>,
          selector: (row) =>
            row?.checkOutMeta?.device
              ? capitalizeWords(row.checkOutMeta.device)
              : "—",
          wrap: true,
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
