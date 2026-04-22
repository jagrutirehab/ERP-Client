import { Badge, Button } from "reactstrap";
import moment from "moment";
import ButtonLoader from "../../../../../Components/Common/ButtonLoader";

const Center = ({ children }) => (
  <div className="text-center w-100">{children}</div>
);

const Left = ({ children }) => (
  <div className="text-start w-100">{children}</div>
);

const formatDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
};

export const MyLeavesColumn = (
  handleAction,
  loadingLeaveId,
  hasDelete,
  hasWrite,
  isLoading,
  openCancelModal,
  activeTab
) => [
    {
      name: <Center>ECode</Center>,
      cell: (row) => <Center>{row?.eCode || "-"}</Center>,
      width: "140px",
    },
    {
      name: <Center>Manager Name</Center>,
      cell: (row) => <Center>{row?.currentApprovalAuthority?.name || row?.approvalAuthority?.name || "-"}</Center>,
      width: "180px",
    },
    {
      name: <Center>Center</Center>,
      cell: (row) => <Center>{row?.center?.title || "-"}</Center>,
      width: "180px",
    },
    {
      name: <Center>Leave Type</Center>,
      cell: (row) => <Center>{row?.leave?.leaveType || "-"}</Center>,
      width: "200px",
    },
    {
      name: <Center>From</Center>,
      cell: (row) => (
        <Center>
          {row?.leave?.fromDate ? moment(row?.leave?.fromDate).format("DD-MM-YYYY") : "-"}
        </Center>
      ),
      width: "130px",
    },
    {
      name: <Center>To</Center>,
      cell: (row) => (
        <Center>
          {row?.leave?.toDate ? moment(row?.leave?.toDate).format("DD-MM-YYYY") : "-"}
        </Center>
      ),
      width: "130px",
    },
    {
      name: <Center>Days</Center>,
      cell: (row) => <Center>{row?.leave?.days ?? "-"}</Center>,
      width: "90px",
    },
    {
      name: <Center>Shift</Center>,
      cell: (row) => <Center>{row?.leave?.shiftTime || "-"}</Center>,
      width: "120px",
    },
    {
      name: <Center>Reason</Center>,
      cell: (row) => <Center>{row?.leave?.leaveReason || "-"}</Center>,
      width: "220px",
    },
    {
      name: <Center>Status</Center>,
      cell: (row) => {
        const status = row?.leave?.status?.toLowerCase();

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
              <Badge pill color="secondary">
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
            <Badge pill color="success">
              Approved
            </Badge>
          </Center>
        );
      },
      width: "120px",
    },


    ...(["pending", "approved"].includes(activeTab)
      && !isLoading && (hasWrite || hasDelete) ? [
      {
        name: "Action",
        cell: (row) =>
          row?.leave?.status?.toLowerCase() === "pending" ? (
            <div className="d-flex gap-1 justify-content-center">
              {(
                <button
                  className="btn btn-sm btn-warning"
                  disabled={loadingLeaveId === row?.leave?._id}
                  onClick={() =>
                    handleAction(
                      row?._id,
                      row?.leave?._id,
                      "retrieved",
                      "retrieve"
                    )
                  }
                >
                  {loadingLeaveId === row._id
                    ? "Processing..."
                    : "Retrieve"}
                </button>
              )}
            </div>
          ) : row?.leave?.status?.toLowerCase() === "approved" &&
            !row?.leave?.cancellationRequested ? (
            <Button
              className="btn btn-sm btn-danger"
              onClick={() => openCancelModal(row)}
            >
              Cancel Leave
            </Button>
          ) : row.leave?.cancellationRequested ? (
            <Badge pill color="info">
              Requested
            </Badge>
          ) : (
            <span className="text-muted">—</span>
          ),
        width: "200px",
      },
    ]
      : []),
    ...(activeTab === "approved" || activeTab === "cancelled"
      ? [
        {
          name: <Center>Cancellation Status</Center>,
          cell: (row) => {
            const status = row?.leave?.cancellationStatus;

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
      ]
      : []),
    {
      name: <Center>Action On</Center>,
      cell: (row) => (
        <Center>
          {row?.leave?.actionOn
            ? new Date(row?.leave?.actionOn)
              .toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
              .replace(",", "")
            : "-"}
        </Center>
      ),
      width: "120px",
    },

    ...(activeTab !== "cancelled"
      ? [
        {
          name: <Center>Regularized For</Center>,
          cell: (row) => (
            <Center>
              {row?.regularizedDates?.length
                ? row.regularizedDates
                  .map((d) =>
                    new Date(d).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  )
                  .join(", ")
                : "-"}
            </Center>
          ),
          width: "220px",
        },
      ]
      : []),

    ...(activeTab === "cancelled" ? [
      {
        name: <Center>Cancellation Reason</Center>,
        cell: (row) => <Center>{row?.leave?.cancellationReason || "-"}</Center>,
        width: "180px",
      },

    ] : [])
  ];
