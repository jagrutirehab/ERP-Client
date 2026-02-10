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
  canEdit,
  canDelete,
}) => {
  const columns = [
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
            min={
              editedRow?.date
                ? `${new Date(editedRow.date).getFullYear()}-01-01`
                : undefined
            }
            max={
              editedRow?.date
                ? `${new Date(editedRow.date).getFullYear()}-12-31`
                : undefined
            }
            onChange={(e) =>
              setEditedRow({ ...editedRow, date: e.target.value })
            }
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
  ];

  if (!canEdit && !canDelete) {
    return columns;
  }

  columns.push({
    name: "Action",
    width: "140px",
    ignoreRowClick: true,
    button: true,
    cell: (row) => (
      <div className="d-flex gap-2">
        {/* ✏️ Edit / Save */}
        {canEdit && (
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
        )}

        {/* ❌ Cancel / Delete */}
        {canDelete && (
          <Button
            color="danger"
            outline
            size="sm"
            onClick={() => {
              if (editingRowId === row._id) {
                // ✅ cancel edit (original behavior)
                setEditingRowId(null);
                setEditedRow({});
              } else {
                // ❌ delete
                onDelete(row);
              }
            }}
          >
            ✕
          </Button>
        )}
      </div>
    ),
  });

  return columns;
};
