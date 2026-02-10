import { Button, Input } from "reactstrap";

const formatDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d)) return "-";
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1,
  ).padStart(2, "0")}/${d.getFullYear()}`;
};

const formatDateForInput = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d)) return "";
  return d.toISOString().split("T")[0];
};

export const festiveLeavesListColumn = ({
  editingRowId,
  setEditingRowId,
  editedRow,
  setEditedRow,
  onSave,
  onDelete,
}) => [
  {
    name: "Sr No.",
    cell: (_, index) => index + 1,
    width: "80px",
  },

  {
    name: "Date",
    cell: (row) =>
      editingRowId === row._id ? (
        <Input
          type="date"
          value={formatDateForInput(editedRow.date)}
          onChange={(e) => setEditedRow({ ...editedRow, date: e.target.value })}
          size="sm"
        />
      ) : (
        formatDate(row.date)
      ),
  },

  {
    name: "Day",
    cell: (row) => row.day ?? "-",
  },

  {
    name: "Particulars",
    width: "300px",
    cell: (row) =>
      editingRowId === row._id ? (
        <Input
          value={editedRow.particulars || ""}
          onChange={(e) =>
            setEditedRow({ ...editedRow, particulars: e.target.value })
          }
          size="sm"
        />
      ) : (
        (row.particulars ?? "-")
      ),
  },

  {
    name: "Action",
    cell: (row) => (
      <div className="d-flex gap-2">
        <Button
          color={editingRowId === row._id ? "success" : "primary"}
          outline={editingRowId !== row._id}
          size="sm"
          onClick={() => {
            if (editingRowId === row._id) {
              onSave(row._id, editedRow);
            } else {
              setEditingRowId(row._id);
              setEditedRow(row);
            }
          }}
        >
          {editingRowId === row._id ? "✓" : "✎"}
        </Button>

        <Button
          color="danger"
          outline
          size="sm"
          onClick={() => {
            if (editingRowId === row._id) {
              setEditingRowId(null);
              setEditedRow({});
            } else {
              onDelete(row);
            }
          }}
        >
          ✕
        </Button>
      </div>
    ),
    width: "140px",
    ignoreRowClick: true,
    button: true,
  },
];
