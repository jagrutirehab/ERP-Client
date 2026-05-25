import DataTable from "react-data-table-component";
import { Badge, Spinner } from "reactstrap";
import { SEVERITY_COLOR, SEVERITY_HEX, PHASE_META } from "./alertConstants";
import { timeAgo } from "./alertUtils";

// Tabular alerts view. One row per SOPAlert. Click a row → opens the
// offcanvas (pre-existing behaviour). Pagination is server-driven via the
// `useAlertsInbox` hook.
//
// `react-data-table-component` v7 fires onRowClicked only when the click
// target has the EXACT attribute data-tag="allowRowEvents" — it does not
// walk up the DOM. So every element inside a custom cell renderer that a
// user might click on (badges, inner divs, <small>, icons) must carry the
// attribute, or clicks on the visible text are silently dropped.
const RC = { "data-tag": "allowRowEvents" };

const AlertsList = ({
  alerts,
  total,
  page,
  pageSize,
  loading,
  onSelect,
  onPageChange,
  onPageSizeChange,
}) => {
  const columns = [
    {
      name: "",
      width: "6px",
      cell: (row) => (
        <div
          style={{
            width: 4,
            height: 36,
            background: SEVERITY_HEX[row.severity] || "#6c757d",
          }}
        />
      ),
      ignoreRowClick: true,
    },
    {
      name: "Severity",
      width: "115px",
      cell: (row) => (
        <Badge
          {...RC}
          color={SEVERITY_COLOR[row.severity] || "secondary"}
          pill
        >
          {row.severity}
        </Badge>
      ),
    },
    {
      name: "Phase",
      width: "130px",
      cell: (row) => {
        const phase = PHASE_META[row.phase] || PHASE_META.IMMEDIATE;
        return (
          <Badge
            {...RC}
            color={phase.color}
            pill
            className="d-inline-flex align-items-center"
          >
            <i {...RC} className={`${phase.icon} me-1`} />
            {phase.label}
          </Badge>
        );
      },
    },
    {
      name: "Patient",
      grow: 1.2,
      cell: (row) => (
        <div {...RC}>
          <div {...RC} className={row.isRead ? "" : "fw-semibold"}>
            {row.patient?.name || "Unknown"}
          </div>
          {row.patient?.uid && (
            <small {...RC} className="text-muted">
              UID {row.patient.uid}
            </small>
          )}
        </div>
      ),
    },
    {
      name: "SOP",
      grow: 1.5,
      cell: (row) => (
        <div {...RC}>
          <div {...RC} className={row.isRead ? "text-muted" : "fw-semibold"}>
            {row.rule?.ruleName || "(deleted rule)"}
          </div>
        </div>
      ),
    },
    {
      name: "Block",
      grow: 1.5,
      cell: (row) => (
        <div {...RC}>
          {row.blockName && (
            <small {...RC} className="text-muted">
              {row.blockName}
            </small>
          )}
        </div>
      ),
    },
    {
      name: "Message",
      grow: 2,
      cell: (row) => (
        <div
          {...RC}
          className={row.isRead ? "text-muted" : ""}
          style={{
            whiteSpace: "normal",
            lineHeight: 1.35,
            paddingTop: 4,
            paddingBottom: 4,
          }}
        >
          {row.message}
        </div>
      ),
    },
    {
      name: "When",
      width: "120px",
      cell: (row) => (
        <small {...RC} className="text-muted">
          {timeAgo(row.createdAt)}
        </small>
      ),
    },
    {
      name: "",
      width: "80px",
      cell: (row) =>
        !row.isRead ? (
          <Badge {...RC} color="danger" pill>
            NEW
          </Badge>
        ) : null,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={alerts || []}
      pagination
      paginationServer
      paginationTotalRows={total || 0}
      paginationPerPage={pageSize}
      paginationDefaultPage={page}
      paginationRowsPerPageOptions={[10, 25, 50, 100]}
      onChangePage={onPageChange}
      onChangeRowsPerPage={onPageSizeChange}
      onRowClicked={onSelect}
      pointerOnHover
      highlightOnHover
      striped
      responsive
      fixedHeader
      fixedHeaderScrollHeight="calc(100vh - 320px)"
      progressPending={loading}
      progressComponent={
        <div className="py-4 text-center">
          <Spinner className="text-primary" />
        </div>
      }
      noDataComponent={
        <div className="py-4 text-center text-muted">
          <i className="bx bx-bell-off display-6 d-block mb-2" />
          No alerts match these filters.
        </div>
      }
      customStyles={{
        headCells: {
          style: {
            backgroundColor: "#f8f9fa",
            fontWeight: "600",
            borderBottom: "2px solid #e9ecef",
          },
        },
        rows: {
          style: { minHeight: "60px", borderBottom: "1px solid #f1f1f1" },
        },
      }}
    />
  );
};

export default AlertsList;
