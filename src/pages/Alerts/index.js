import { useEffect, useState } from "react";
import { CardBody } from "reactstrap";
import { toast } from "react-toastify";
import { useMediaQuery } from "../../Components/Hooks/useMediaQuery";
import { useAlertsInbox } from "./components/useAlertsInbox";
import AlertsHeader from "./components/AlertsHeader";
import AlertsFilters from "./components/AlertsFilters";
import AlertsList from "./components/AlertsList";
import AlertDetailOffcanvas from "./components/AlertDetailOffcanvas";
import { usePermissions } from "../../Components/Hooks/useRoles";
import { useNavigate } from "react-router-dom";
import { exportSopAlerts } from "../../helpers/backend_helper";

// Pull params from the same filter shape the inbox sends to /sop/alerts, minus
// pagination. Returns only keys with meaningful values so the URL stays clean.
const buildExportParams = (f) => {
  const out = {};
  if (f.patients?.length) out.patients = f.patients.map((p) => p.value).join(",");
  if (f.rules?.length) out.rules = f.rules.map((r) => r.value).join(",");
  if (f.centers?.length) out.centers = f.centers.join(",");
  if (f.severity?.length) out.severity = f.severity.join(",");
  if (f.dateFrom) out.dateFrom = f.dateFrom;
  if (f.dateTo) out.dateTo = f.dateTo;
  if (f.readState && f.readState !== "all") out.readState = f.readState;
  if (f.phase && f.phase !== "all") out.phase = f.phase;
  return out;
};

// Pull filename out of the Content-Disposition header the server set. Falls
// back to a date-stamped default if the header is missing or unparsable.
const filenameFromResponse = (response) => {
  const cd = response?.headers?.["content-disposition"] || "";
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(cd);
  if (match?.[1]) {
    try {
      return decodeURIComponent(match[1]);
    } catch {
      return match[1];
    }
  }
  return `sop-alerts-${new Date().toISOString().slice(0, 10)}.csv`;
};

const Alerts = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const inbox = useAlertsInbox();
  const navigate = useNavigate();

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { loading: permissionLoader, hasPermission } = usePermissions(token);

  const hasReadPermission = hasPermission(
    "ALERT",
    null,
    "READ",
  );
  const hasWritePermission = hasPermission(
    "ALERT",
    null,
    "WRITE",
  );

  useEffect(() => {
    if (permissionLoader) return;
    if (!hasReadPermission) {
      navigate("/unauthorized");
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasReadPermission, permissionLoader]);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [exporting, setExporting] = useState(false);
  const selected = selectedId ? inbox.getAlertById(selectedId) : null;

  // CSV export — re-hits the API with the same filter set (no pagination) and
  // hands the resulting blob to an invisible <a download> click. The server
  // dictates the filename via Content-Disposition.
  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const response = await exportSopAlerts(
        buildExportParams(inbox.serverFilters),
      );
      const blob = response?.data;
      if (!(blob instanceof Blob) || blob.size === 0) {
        toast.error("Export returned no data");
        return;
      }
      const filename = filenameFromResponse(response);
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      // Defer revoke so the browser has actually started the download.
      setTimeout(() => window.URL.revokeObjectURL(objectUrl), 0);
      const totalRows = response?.headers?.["x-total-rows"];
      toast.success(
        totalRows
          ? `Exported ${Number(totalRows).toLocaleString()} alert${
              totalRows === "1" ? "" : "s"
            }`
          : "Export downloaded",
      );
    } catch (err) {
      // Blob errors come back as Blob — read it to surface the server message.
      let msg = err?.message || "Export failed";
      if (err?.data instanceof Blob && err.data.type?.includes("json")) {
        try {
          const parsed = JSON.parse(await err.data.text());
          if (parsed?.message) msg = parsed.message;
        } catch {
          /* fall through to default msg */
        }
      } else if (typeof err?.message === "string" && err.message) {
        msg = err.message;
      }
      toast.error(msg);
    } finally {
      setExporting(false);
    }
  };

  // react-data-table-component passes (row, event). Stopping propagation
  // prevents the click from bubbling past the row while the Offcanvas
  // backdrop is mounting. markRead is deferred so it doesn't mutate the
  // alerts array in the same commit that opens the offcanvas — otherwise
  // DataTable re-renders mid-click and the first click is lost.
  const openDetail = (alert, e) => {
    if (e && typeof e.stopPropagation === "function") e.stopPropagation();
    setSelectedId(alert._id);
    setDetailOpen(true);
    if (!alert.isRead) {
      setTimeout(() => inbox.markRead(alert._id), 0);
    }
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedId(null);
  };

  return (
    <div className="page-content">
      <CardBody
        className="p-3 bg-white"
        style={isMobile ? { width: "100%" } : { width: "100%" }}
      >
        <AlertsHeader
          hasWritePermission={hasWritePermission}
          unreadCount={inbox.totalUnread}
          totalCount={inbox.total}
          loading={inbox.loading}
          bulkLoading={inbox.bulkLoading}
          exporting={exporting}
          onMarkAllRead={inbox.markAllRead}
          onRefresh={inbox.load}
          onExport={handleExport}
        />

        <AlertsFilters
          total={inbox.total}
          serverFilters={inbox.serverFilters}
          onServerFilterChange={inbox.setServerFilter}
          onClearServerFilters={inbox.clearServerFilters}
          onToggleSeverity={inbox.toggleSeverity}
          onClearSeverity={inbox.clearSeverityFilter}
        />

        <AlertsList
          alerts={inbox.alerts}
          total={inbox.total}
          page={inbox.page}
          pageSize={inbox.pageSize}
          loading={inbox.loading}
          onSelect={openDetail}
          onPageChange={inbox.setPage}
          onPageSizeChange={inbox.setPageSize}
        />

        <AlertDetailOffcanvas
          isOpen={detailOpen}
          onClose={closeDetail}
          alert={selected}
        />
      </CardBody>
    </div>
  );
};

export default Alerts;
