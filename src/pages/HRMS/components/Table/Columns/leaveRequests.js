import { Badge, Spinner } from "reactstrap";
import moment from "moment";

const Center = ({ children }) => (
  <div className="text-center w-100">{children}</div>
);

const Left = ({ children }) => (
  <div className="text-start w-100">{children}</div>
);

export const leaveRequestsColumns = (
  handleAction,
  actionLoadingId,
  isLoading,
  hasWrite,
  hasDelete,
  activeTab,
  handleCancellation,
  cancellationLoading
) => [
    {
      name: <Center>ECode</Center>,
      cell: (row) => <Center>{row?.eCode || "-"}</Center>,
      width: "140px",
    },
    {
      name: <Center>Employee Name</Center>,
      cell: (row) => <Center>{row?.employeeId?.name || "-"}</Center>,
      width: "180px",
    },
    {
      name: <Center>Center</Center>,
      cell: (row) => <Center>{row?.center?.title || "-"}</Center>,
      width: "180px",
    },
    {
      name: <Center>Leave Type</Center>,
      cell: (row) => <Center>{row?.leaveType || "-"}</Center>,
      width: "200px",
    },
    {
      name: <Center>From</Center>,
      cell: (row) => (
        <Center>
          {row?.fromDate ? moment(row.fromDate).format("DD-MM-YYYY") : "-"}
        </Center>
      ),
      width: "130px",
    },
    {
      name: <Center>To</Center>,
      cell: (row) => (
        <Center>
          {row?.toDate ? moment(row.toDate).format("DD-MM-YYYY") : "-"}
        </Center>
      ),
      width: "130px",
    },
    {
      name: <Center>Days</Center>,
      cell: (row) => <Center>{row?.days ?? "-"}</Center>,
      width: "90px",
    },
    {
      name: <Center>Shift</Center>,
      cell: (row) => <Center>{row?.shiftTime || "-"}</Center>,
      width: "120px",
    },
    {
      name: <Center>Reason</Center>,
      cell: (row) => <Center>{row?.leaveReason || "-"}</Center>,
      width: "220px",
    },
    {
      name: <Center>Status</Center>,
      cell: (row) => {
        const status = row?.status?.toLowerCase();

        if (status === "approved")
          return (
            <Center>
              <Badge pill color="success">
                Approved
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
        if (status === "retrieved")
          return (
            <Center>
              <Badge pill color="danger">
                Retrieved
              </Badge>
            </Center>
          );
        if (status === "cancelled")
          return (
            <Center>
              <Badge pill color="success">
                Cancelled
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
      width: "120px",
    },

    ...(activeTab === "pending"
      ? [
        {
          name: "Action",
          cell: (row) =>
            !isLoading && (hasWrite || hasDelete) ? (
              actionLoadingId === row._id ? (
                <button className="btn btn-sm btn-secondary" disabled>
                  <Spinner size="sm" />
                </button>
              ) : (
                <div className="d-flex gap-1 justify-content-center">
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() =>
                      handleAction(row.parentDocId, row._id, "approved")
                    }
                  >
                    Approve
                  </button>

                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() =>
                      handleAction(row.parentDocId, row._id, "rejected")
                    }
                  >
                    Reject
                  </button>
                </div>
              )
            ) : (
              <span className="text-muted">—</span>
            ),
          width: "200px",
        },
      ]
      : []),


    ...(activeTab === "approved"
      ? [
        {
          name: "Action",
          cell: (row) =>
            !isLoading && (hasWrite || hasDelete) ? (

              row.cancellationRequested ? (
                <span className="badge bg-info">
                  Requested
                </span>
              ) : cancellationLoading === row._id ? (

                <button className="btn btn-sm btn-secondary" disabled>
                  <Spinner size="sm" />
                </button>
              ) : (

                <div className="d-flex gap-1 justify-content-center">
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() =>
                      handleCancellation(
                        row.parentDocId,
                        row._id,
                        row.approvalAuthority,
                        row.employeeId._id
                      )
                    }
                  >
                    Cancel
                  </button>
                </div>
              )
            ) : (
              <span className="text-muted">—</span>
            ),
          width: "200px",
        },
        {
          name: <Center>Cancellation Status</Center>,
          cell: (row) => {
            const status = row?.cancellationStatus;

            const getColor = (status) => {
              switch (status) {
                case "approved":
                  return "success";
                case "rejected":
                  return "danger";
                case "pending":
                  return "warning";
                default:
                  return "secondary";
              }
            };

            return (
              <Center>
                {status ? (
                  <Badge pill color={getColor(status)}>
                    {status?.charAt(0)?.toUpperCase() + status?.slice(1)}
                  </Badge>
                ) : (
                  "-"
                )}
              </Center>
            );
          },
          width: "200px",
        },
        {
          name: <Center>Cancellation Action By</Center>,
          cell: (row) => <Center>{row?.cancellationAction || "-"}</Center>,
          width: "220px",
        },
      ]
      : []),


    ...(activeTab === "cancelled"
      ? [
        {
          name: <Center>Cancellation Status</Center>,
          cell: (row) => {
            const status = row?.cancellationStatus;

            const getColor = (status) => {
              switch (status) {
                case "approved":
                  return "success";
                case "rejected":
                  return "danger";
                case "pending":
                  return "warning";
                default:
                  return "secondary";
              }
            };

            return (
              <Center>
                {status ? (
                  <Badge pill color={getColor(status)}>
                    {status?.charAt(0)?.toUpperCase() + status?.slice(1)}
                  </Badge>
                ) : (
                  "-"
                )}
              </Center>
            );
          },
          width: "200px",
        },
        {
          name: <Center>Cancellation Reason</Center>,
          cell: (row) => <Center>{row?.reason || "-"}</Center>,
          width: "220px",
        },

        {
          name: <Center>Cancellation Action By</Center>,
          cell: (row) => <Center>{row?.cancellationAction || "-"}</Center>,
          width: "220px",
        },
      ]
      : []),

    {
      name: <Center>Action On</Center>,
      cell: (row) => (
        <Center>
          {row?.actionOn ? moment(row?.actionOn).format("DD-MM-YYYY") : "-"}
        </Center>
      ),
      width: "120px",
    },
  ];
