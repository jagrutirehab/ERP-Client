import { Button } from "reactstrap";

const formatDate = (date) => {
  if (!date) return "-";

  const d = new Date(date);
  if (isNaN(d)) return "-";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};

export const festiveLeavesListColumn = () => [
  {
    name: "Sr No.",
    cell: (row, index) => index + 1,
    width: "80px",
  },
  {
    name: "Date",
    cell: (row) => formatDate(row.date),
  },
  {
    name: "Day",
    cell: (row) => row.day ?? "-",
  },
  {
    name: "Particulars",
    cell: (row) => row.particulars ?? "-",
  },
  {
    name: (
   <div className="d-flex justify-content-center w-100">
  <Button color="primary" size="sm">
    + Add Leave
  </Button>
</div>
    ),
    cell: (_, index) => (
      <div className="d-flex justify-content-end gap-2">
        {/* Edit */}
        <Button
          color="primary"
          outline
          size="sm"
          style={{ width: "36px", height: "36px" }}
        >
          ✎
        </Button>

        {/* Delete */}
        <Button
          color="danger"
          outline
          size="sm"
          style={{ width: "36px", height: "36px" }}
        >
          ✕
        </Button>
      </div>
    ),
    width: "160px",
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
  },
];
