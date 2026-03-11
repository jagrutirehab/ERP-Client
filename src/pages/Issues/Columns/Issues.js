import { Badge, Button } from "reactstrap";
import { normalizeDates } from "../Helpers/normalizeDates";
import { getStatusColor } from "../Helpers/getStatusColor";

export const Issues = (
  handleViewDescription,
  handleViewImages,
  status,
  handleAssign,
  handleApproveClick,
  type,
  editRowId,
  handleEdit,
  handleSave,
  editedApproval,
  setEditedApproval,
  editedApprovalBy,
  setEditedApprovalBy,
  approvers,
  setEditRowId
) => [
    {
      name: <div className="text-center">Author</div>,
      selector: (row) => row?.author?.name || "-",
      // center: true,
      width: "160px",
    },
    {
      name: <div className="text-center">Requested For</div>,
      selector: (row) => row?.requestedFrom?.name || "-",
      // center: true,
      width: "210px",
    },
    {
      name: <div className="text-center">Center</div>,
      selector: (row) => row?.center?.title || "-",
      // center: true,
      width: "160px",
    },
    {
      name: <div className="text-center">Issue Type</div>,
      selector: (row) => row?.issueType || "-",
      // center: true,
      width: "180px",
    },
    ...(type === "TECH" ?
      [{
        name: <div className="text-center">Description</div>,
        width: "300px",
        cell: (row) => (
          <div
            style={{
              maxHeight: "80px",
              overflowY: "auto",
              paddingRight: "6px",
              lineHeight: "1.4",
              wordBreak: "break-word",
            }}
          >
            {row?.techIssue?.description || "-"}
          </div>
        ),
      },
      {
        name: <div className="text-center">Images</div>,
        width: "140px",
        cell: (row) => (
          <span
            style={{ color: "#0d6efd", cursor: "pointer", fontWeight: "500" }}
            onClick={() => handleViewImages(row?.techIssue?.files)}
          >
            View Images
          </span>
        ),
      }
      ] : []
    ),
    ...(type === "PURCHASE" ?
      [
        {
          name: <div className="text-center">Item Name</div>,
          selector: (row) => row?.purchaseIssue?.itemName || "-",
          // center: true,
          width: "140px",
        },
        {
          name: <div className="text-center">Item Quantity</div>,
          selector: (row) => row?.purchaseIssue?.itemQty || "-",
          // center: true,
          width: "140px",
        },
        {
          name: <div className="text-center">Comments</div>,
          width: "200px",
          cell: (row) => (
            <div
              style={{
                maxHeight: "80px",
                overflowY: "auto",
                paddingRight: "6px",
                lineHeight: "1.4",
                wordBreak: "break-word",
              }}
            >
              {row?.purchaseIssue?.comment || "-"}
            </div>
          ),
        }, {
          name: <div className="text-center">Images</div>,
          width: "140px",
          cell: (row) => (
            <span
              style={{ color: "#0d6efd", cursor: "pointer", fontWeight: "500" }}
              onClick={() => handleViewImages(row?.purchaseIssue?.files)}
            >
              View Images
            </span>
          ),
        },

      ] : []

    ),
    ...(type === "REVIEW_SUBMISSION" ?
      [
        {
          name: <div className="text-center">Responsible Reviewer</div>,
          selector: (row) => row?.reviewSubmissionIssue?.responsibleReviewer?.name || "-",
          // center: true,
          width: "210px",
        },
        {
          name: <div className="text-center">Review Taken From</div>,
          selector: (row) => row?.reviewSubmissionIssue?.reviewTakenFrom?.name || "-",
          // center: true,
          width: "210px",
        },
        {
          name: <div className="text-center">Images</div>,
          width: "140px",
          cell: (row) => (
            <span
              style={{ color: "#0d6efd", cursor: "pointer", fontWeight: "500" }}
              onClick={() => handleViewImages(row?.reviewSubmissionIssue?.files)}
            >
              View Images
            </span>
          ),
        },

      ] : []

    ),

    ...(status !== "new"
      ? [{
        name: <div className="text-center">Assigned To</div>,
        width: "160px",
        cell: (row) => {
          const name = row?.assignedTo?.name
            ? row.assignedTo.name.charAt(0).toUpperCase() +
            row.assignedTo.name.slice(1).toLowerCase()
            : "-";

          const eCode = row?.assignedTo?.eCode;

          return (
            <div className="text-center">
              <div>{name}</div>
              {/* {eCode && (
              <div style={{ fontSize: "12px", color: "#6c757d", marginTop: '4px' }}>
                {eCode}
              </div>
            )} */}
            </div>
          );
        },
      }]
      : []),
    ...(status !== "new"
      ? [
        {
          name: <div className="text-center">Action on</div>,
          selector: (row) =>
            normalizeDates(
              row?.notes?.filter((d) => d?.status === status)?.[0]?.changedOn
            ) || "-",
          width: "180px",
        },
        {
          name: <div className="text-center">Notes</div>,
          width: "160px",
          cell: (row) => {
            const note =
              row?.notes?.filter((d) => d?.status === status)?.[0]?.note || "-";

            return (
              <div
                style={{
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  lineHeight: "1.4",
                }}
              >
                {note}
              </div>
            );
          },
        },
      ]
      : []),
    {
      name: <div className="text-center">Status</div>,
      width: "180px",
      // center: true,
      cell: (row) => {
        const status = row?.status;

        return (
          <Badge color={getStatusColor(status)} pill>
            {status?.replaceAll("_", " ") || "-"}
          </Badge>
        );
      },
    },
    {
      name: <div className="text-center">Raised on</div>,
      selector: (row) => normalizeDates(row?.createdAt) || "-",
      // center: true,
      width: "180px",
    },

    ...(status === "new"
      ? [{
        name: <div className="text-center">Assign</div>,
        width: "140px",
        cell: (row) => (
          <button
            className="btn btn-sm btn-primary"
            onClick={() => handleAssign(row)}
          >
            Assign
          </button>
        ),
      }]
      : []),

    ...(status === "resolved"
      ? [
        {
          name: <div className="text-center">Approval</div>,
          width: "120px",
          cell: (row) => {
            if (editRowId === row._id) {
              return (
                <select
                  className="form-select form-select-sm"
                  value={editedApproval}
                  onChange={(e) => setEditedApproval(e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              );
            }

            return row?.approval?.isApproved ? (
              <Badge color="success">Yes</Badge>
            ) : (
              <Badge color="danger">No</Badge>
            );
          },
        },

        {
          name: <div className="text-center">Approved By</div>,
          width: "200px",
          cell: (row) => {
            if (editRowId === row._id) {
              return (
                <select
                  className="form-select form-select-sm"
                  value={editedApprovalBy || ""}
                  onChange={(e) => setEditedApprovalBy(e.target.value)}
                >
                  <option value="">Select</option>
                  {approvers.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              );
            }

            return row?.approval?.approvedBy || "-";
          },
        },

        {
          name: <div className="text-center">Edit</div>,
          width: "140px",
          cell: (row) => {
            if (editRowId === row._id) {
              return (
                <div className="d-flex gap-2 justify-content-center">
                  <Button size="sm" color="success" onClick={() => handleSave(row)}>
                    ✔
                  </Button>

                  <Button size="sm" color="danger" onClick={() => setEditRowId(null)}>
                    ✖
                  </Button>
                </div>
              );
            }

            return (
              <Button
                size="sm"
                style={{
                  background: "white",
                  border: "1px solid #dee2e6",
                  color: "black",
                }}
                onClick={() => handleEdit(row)}
              >
                <i className="bx bx-pencil"></i>
              </Button>
            );
          },
        },
      ]
      : [])

  ];