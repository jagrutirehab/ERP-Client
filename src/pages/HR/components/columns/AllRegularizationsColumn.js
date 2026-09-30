import { Spinner } from "reactstrap";
import moment from "moment";
import { renderStatusBadge } from "../../../../Components/Common/renderStatusBadge";
import { minutesToTime } from "../../../../utils/time";

const Center = ({ children }) => (
  <div className="text-center w-100">{children}</div>
);

export const allRegularizationsColumn = (
  activeTab,
  handleAction,
  approveLoaderId,
  openCancelModal,
  cancelLoaderId,
  hasWrite,
  hasDelete,
) => {
  const columns = [
    {
      name: <Center>E Code</Center>,
      cell: (row) => <Center>{row?.employee_id?.eCode || "-"}</Center>,
      minWidth: "130px",
    },
    {
      name: <Center>Employee Name</Center>,
      cell: (row) => <Center>{row?.employee_id?.name || "-"}</Center>,
      minWidth: "160px",
    },
    {
      name: <Center>Center</Center>,
      cell: (row) => <Center>{row?.center?.title || "-"}</Center>,
      minWidth: "130px",
    },
    {
      name: <Center>Date</Center>,
      cell: (row) => (
        <Center>
          {row?.date ? moment(row.date).format("DD-MM-YYYY") : "-"}
        </Center>
      ),
      minWidth: "130px",
    },
    {
      name: <Center>Clocked In</Center>,
      cell: (row) => (
        <Center>
          {row?.originalClockInTime === 0 && row?.originalClockOutTime === 0 ? (
            renderStatusBadge("ABSENT")
          ) : row?.originalClockInTime ? (
            minutesToTime(row.originalClockInTime)
          ) : (
            "--"
          )}
        </Center>
      ),
      minWidth: "120px",
    },
    {
      name: <Center>Clocked Out</Center>,
      cell: (row) => (
        <Center>
          {row?.originalClockInTime === 0 && row?.originalClockOutTime === 0 ? (
            renderStatusBadge("ABSENT")
          ) : row?.originalClockOutTime ? (
            minutesToTime(row.originalClockOutTime)
          ) : (
            "--"
          )}
        </Center>
      ),
      minWidth: "120px",
    },
    {
      name: <Center>Requested In</Center>,
      cell: (row) => (
        <Center>
          {row?.reqClockInTime != null
            ? minutesToTime(row.reqClockInTime)
            : "-"}
        </Center>
      ),
      minWidth: "120px",
    },
    {
      name: <Center>Requested Out</Center>,
      cell: (row) => (
        <Center>
          {row?.reqClockOutTime != null
            ? minutesToTime(row.reqClockOutTime)
            : "-"}
        </Center>
      ),
      minWidth: "120px",
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
      minWidth: "200px",
    },
    {
      name: <Center>Status</Center>,
      cell: (row) => <Center>{renderStatusBadge(row?.status)}</Center>,
      minWidth: "130px",
    },
    {
      name: <Center>Requested On</Center>,
      cell: (row) => (
        <Center>
          {row?.createdAt ? moment(row.createdAt).format("DD-MM-YYYY") : "-"}
        </Center>
      ),
      minWidth: "130px",
    },
  ];

  if (activeTab !== "pending") {
    columns.push(
      {
        name: <Center>Action On</Center>,
        cell: (row) => (
          <Center>
            {row?.action_on ? moment(row.action_on).format("DD-MM-YYYY") : "-"}
          </Center>
        ),
        minWidth: "130px",
      },
      {
        name: <Center>Action By</Center>,
        cell: (row) => <Center>{row?.action_by?.name || "-"}</Center>,
        minWidth: "160px",
      },
    );
  }

  if (activeTab === "cancelled") {
    columns.push({
      name: <Center>Cancellation Reason</Center>,
      cell: (row) => (
        <Center>
          <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
            {row?.cancellationReason || "-"}
          </div>
        </Center>
      ),
      wrap: true,
      minWidth: "200px",
    });
  }

  if (activeTab === "pending" && (hasWrite || hasDelete)) {
    columns.push({
      name: <Center>Action</Center>,
      cell: (row) => (
        <Center>
          <div className="d-flex gap-2 justify-content-center">
            <button
              className="btn btn-sm btn-success"
              style={{ minWidth: "70px" }}
              onClick={() => handleAction(row, "regularized")}
              disabled={approveLoaderId !== null}
            >
              {approveLoaderId === `${row?._id}:regularized` ? (
                <Spinner size="sm" />
              ) : (
                "Approve"
              )}
            </button>
            <button
              className="btn btn-sm btn-danger"
              style={{ minWidth: "70px" }}
              onClick={() => handleAction(row, "rejected")}
              disabled={approveLoaderId !== null}
            >
              {approveLoaderId === `${row?._id}:rejected` ? (
                <Spinner size="sm" />
              ) : (
                "Reject"
              )}
            </button>
          </div>
        </Center>
      ),
      minWidth: "180px",
    });
  }

  if (activeTab === "regularized" && (hasWrite || hasDelete)) {
    columns.push({
      name: <Center>Action</Center>,
      cell: (row) => (
        <Center>
          <button
            className="btn btn-sm btn-danger"
            style={{ minWidth: "70px" }}
            onClick={() => openCancelModal(row)}
            disabled={cancelLoaderId !== null}
          >
            {cancelLoaderId === row?._id ? <Spinner size="sm" /> : "Cancel"}
          </button>
        </Center>
      ),
      minWidth: "140px",
    });
  }

  return columns;
};
