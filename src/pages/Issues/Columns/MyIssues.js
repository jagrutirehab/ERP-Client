import { Badge, Button } from "reactstrap";
import { normalizeDates } from "../Helpers/normalizeDates";
import { getStatusColor } from "../Helpers/getStatusColor";
import { getNextStatus, returnButtonText } from "../Helpers/getNextStatus";

export const MyIssuesCol = (
  handleViewDescription,
  handleViewImages,
  activeTab,
  handleAction
) => {
  console.log("ACTIVE TAB:", activeTab);
  return [
    {
      name: <div className="text-center">Author</div>,
      selector: (row) => row?.author?.name || "-",
      width: "160px",
    },
    {
      name: <div className="text-center">Requested From</div>,
      selector: (row) => row?.requestedFrom?.name || "-",
      width: "180px",
    },
    {
      name: <div className="text-center">Center</div>,
      selector: (row) => row?.center?.title || "-",
      width: "160px",
    },
    {
      name: <div className="text-center">Issue Type</div>,
      selector: (row) => row?.issueType || "-",
      width: "140px",
    },

    {
      name: <div className="text-center">Description</div>,
      width: "160px",
      cell: (row) => (
        <span
          style={{ color: "#0d6efd", cursor: "pointer", fontWeight: "500" }}
          onClick={() => handleViewDescription(row?.techIssue?.description)}
        >
          View
        </span>
      ),
    },

    ...(activeTab !== "new"
      ? [
        {
          name: <div className="text-center">Assigned To</div>,
          selector: (row) =>
            row?.assignedTo?.name
              ? row.assignedTo.name.charAt(0).toUpperCase() +
              row.assignedTo.name.slice(1).toLowerCase()
              : "-",
          width: "160px",
        },
      ]
      : []),

    ...(activeTab
      ? [
        {
          name: <div className="text-center">Notes</div>,
          width: "160px",
          cell: (row) => {
            const note =
              row?.notes?.filter((d) => d?.status === activeTab)?.[0]?.note || "-";

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
        {
          name: <div className="text-center">Action on</div>,
          selector: (row) =>
            normalizeDates(
              row?.notes?.filter((d) => d?.status === activeTab)?.[0]?.changedOn
            ) || "-",
          width: "180px",
        },
      ]
      : []),

    {
      name: <div className="text-center">Status</div>,
      width: "180px",
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
      width: "180px",
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
    },

    ...(activeTab && activeTab !== "resolved"
      ? [
        {
          name: <div className="text-center">Action</div>,
          width: "200px",
          cell: (row) => {
            const buttonText = returnButtonText(activeTab);
            const nextStatus = getNextStatus(activeTab);

            if (!buttonText || !nextStatus) return "-";

            return (
              <Button
                size="sm"
                color="primary"
                onClick={() =>
                  handleAction({
                    issue: row,
                    nextStatus,
                  })
                }
              >
                {buttonText}
              </Button>
            );
          },
        },
      ]
      : []),
  ]
}