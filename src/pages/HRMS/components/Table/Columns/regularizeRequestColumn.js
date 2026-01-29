import { Badge } from "reactstrap";
import moment from "moment";

const Center = ({ children }) => (
  <div className="text-center w-100">{children}</div>
);

const minutesTo12HourTime = (minutes) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hrs >= 12 ? "PM" : "AM";
  const hour12 = hrs % 12 || 12;
  return `${hour12}:${mins.toString().padStart(2, "0")} ${period}`;
};

const minutesTo24HourTime = (minutes) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hrs.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
};

export const regularizeRequestColumn = (
  handleAction,
  activeTab,
  isLoading,
  hasWrite,
  hasDelete,
  actionLoadingId,
) => {
  const columns = [
    {
      name: <Center>Employee eCode</Center>,
      cell: (row) => <Center>{row?.employee_id?.eCode || "-"}</Center>,
      width: "130px",
    },
    {
      name: <Center>Employee Name</Center>,
      cell: (row) => <Center>{row?.employee_id?.name || "-"}</Center>,
      width: "130px",
    },
    {
      name: <Center>Date</Center>,
      cell: (row) => (
        <Center>
          {row?.date ? moment(row.date).format("DD-MM-YYYY") : "-"}
        </Center>
      ),
      width: "130px",
    },
    {
      name: <Center>Center</Center>,
      cell: (row) => <Center>{row?.center?.title || "-"}</Center>,
      width: "130px",
    },

    {
      name: <Center>Clocked In</Center>,
      cell: (row) => (
        <Center>
          {row?.originalClockInTime === 0 && row?.originalClockOutTime === 0 ? (
            <span className="badge bg-danger">Absent</span>
          ) : row?.originalClockInTime ? (
            minutesTo24HourTime(row.originalClockInTime)
          ) : (
            "--"
          )}
        </Center>
      ),
      width: "130px",
    },
    {
      name: <Center>Clocked Out</Center>,
      cell: (row) => (
        <Center>
          {row?.originalClockInTime === 0 && row?.originalClockOutTime === 0 ? (
            <span className="badge bg-danger">Absent</span>
          ) : row?.originalClockOutTime ? (
            minutesTo24HourTime(row.originalClockOutTime)
          ) : (
            "--"
          )}
        </Center>
      ),
      width: "130px",
    },

    {
      name: <Center>Requested In</Center>,
      cell: (row) => (
        <Center>
          {row?.reqClockInTime != null
            ? minutesTo24HourTime(row.reqClockInTime)
            : "-"}
        </Center>
      ),
      width: "130px",
    },

    {
      name: <Center>Requested Out</Center>,
      cell: (row) => (
        <Center>
          {row?.reqClockOutTime != null
            ? minutesTo24HourTime(row.reqClockOutTime)
            : "-"}
        </Center>
      ),
      width: "130px",
    },

    {
      name: <Center>Reason</Center>,
      cell: (row) => (
        <Center>
          <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
            {row?.description || "-"}
          </div>
        </Center>
      ),
      wrap: true,
      minWidth: "220px",
    },

    {
      name: <Center>Status</Center>,
      cell: (row) => {
        const status = row?.status?.toLowerCase();

        if (status === "regularized")
          return (
            <Center>
              <Badge pill color="success">
                Regularized
              </Badge>
            </Center>
          );

        if (status === "pending")
          return (
            <Center>
              <Badge pill color="warning">
                Pending
              </Badge>
            </Center>
          );

        if (status === "rejected")
          return (
            <Center>
              <Badge pill color="danger">
                Rejected
              </Badge>
            </Center>
          );

        return (
          <Center>
            <Badge pill color="secondary">
              Unknown
            </Badge>
          </Center>
        );
      },
      width: "130px",
    },

    {
      name: <Center>Requested On</Center>,
      cell: (row) => (
        <Center>
          {row?.createdAt ? moment(row.createdAt).format("DD-MM-YYYY") : "-"}
        </Center>
      ),
      width: "130px",
    },
    {
      name: <Center>Action On</Center>,
      cell: (row) => (
        <Center>
          {row?.action_on ? moment(row.action_on).format("DD-MM-YYYY") : "-"}
        </Center>
      ),
      width: "130px",
    },

    {
      name: <Center>Action</Center>,
      cell: (row) => {
        if (row?.status?.toLowerCase() !== "pending") {
          return (
            <Center>
              <span className="text-muted">—</span>
            </Center>
          );
        }

        return (
          <Center>
            {actionLoadingId === row._id ? (
              (console.log("row", row._id),
              (
                <button className="btn btn-sm btn-secondary" disabled>
                  Processing...
                </button>
              ))
            ) : hasWrite || hasDelete ? (
              <div className="d-flex gap-1 justify-content-center">
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => handleAction(row._id, "regularized")}
                  disabled={actionLoadingId !== null}
                >
                  Approve
                </button>

                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleAction(row._id, "rejected")}
                  disabled={actionLoadingId !== null}
                >
                  Reject
                </button>
              </div>
            ) : (
              <span className="text-muted">--</span>
            )}
          </Center>
        );
      },
      width: "160px",
    },
  ];

  return activeTab === "pending"
    ? columns
    : columns.filter((c) => c.name?.props?.children !== "Action");
};
