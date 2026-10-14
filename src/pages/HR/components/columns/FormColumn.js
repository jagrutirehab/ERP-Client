import { Badge, Button } from "reactstrap";

const Center = ({ children }) => (
  <div className="text-center w-100">{children}</div>
);

const formatDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

export const FormColumns = ({
  onView,
  onEdit,
  onDelete,
  hasWrite,
  hasDelete,
} = {}) => [
  {
    name: <Center>ECode</Center>,
    cell: (row) => <Center>{row?.eCode || "-"}</Center>,
    width: "120px",
  },
  {
    name: <Center>Employee Name</Center>,
    cell: (row) => {
      return <Center>{row?.employeeName || "-"}</Center>;
    },
    width: "200px",
  },
  {
    name: <Center>Center</Center>,
    cell: (row) => <Center>{row?.center || "-"}</Center>,
    width: "200px",
  },
  {
    name: <Center>File Name</Center>,
    cell: (row) => (
      <Center>
        <span
          title={row?.fileName}
          style={{
            maxWidth: "180px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "inline-block",
          }}
        >
          {row?.fileName || "-"}
        </span>
      </Center>
    ),
    width: "200px",
  },
  {
    name: <Center>Form Type</Center>,
    cell: (row) => (
      <Center>
        <span className="badge bg-primary bg-opacity-10 text-primary fw-normal px-2 py-1">
          {row?.fileType || "-"}
        </span>
      </Center>
    ),
    width: "150px",
  },
  {
    name: <Center>Month</Center>,
    cell: (row) => <Center>{row?.month || "—"}</Center>,
    width: "130px",
  },
  {
    name: <Center>Year</Center>,
    cell: (row) => <Center>{row?.year || "-"}</Center>,
    width: "100px",
  },
  {
    name: <Center>Created On</Center>,
    cell: (row) => <Center>{formatDate(row?.createdAt)}</Center>,
    width: "130px",
  },
  {
    name: <Center>Actions</Center>,
    cell: (row) => (
      <Center>
        <div className="d-flex gap-2 justify-content-center">
          <Button
            color="primary"
            size="sm"
            outline
            onClick={() => onView?.(row)}
          >
            View
          </Button>
          {hasWrite && (
            <Button
              color="warning"
              size="sm"
              outline
              onClick={() => onEdit?.(row)}
            >
              Edit
            </Button>
          )}
          {hasDelete && (
            <Button
              color="danger"
              size="sm"
              outline
              onClick={() => onDelete?.(row)}
            >
              Delete
            </Button>
          )}
        </div>
      </Center>
    ),
    width: "220px",
  },
];
