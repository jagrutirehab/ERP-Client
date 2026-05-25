import { useEffect, useState } from "react";
import { CardBody } from "reactstrap";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import { useAlertsInbox } from "../components/alerts/useAlertsInbox";
import AlertsHeader from "../components/alerts/AlertsHeader";
import AlertsFilters from "../components/alerts/AlertsFilters";
import AlertsList from "../components/alerts/AlertsList";
import AlertDetailOffcanvas from "../components/alerts/AlertDetailOffcanvas";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import { useNavigate } from "react-router-dom";

const Alerts = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const inbox = useAlertsInbox();
  const navigate = useNavigate();

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { loading: permissionLoader, hasPermission } = usePermissions(token);

  const hasReadPermission = hasPermission(
    "SOPCONFIGS",
    "ALERT_HISTORY",
    "READ",
  );
  const hasWritePermission = hasPermission(
    "SOPCONFIGS",
    "ALERT_HISTORY",
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
  const selected = selectedId ? inbox.getAlertById(selectedId) : null;

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
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <AlertsHeader
        hasWritePermission={hasWritePermission}
        unreadCount={inbox.totalUnread}
        loading={inbox.loading}
        bulkLoading={inbox.bulkLoading}
        onMarkAllRead={inbox.markAllRead}
        onRefresh={inbox.load}
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
  );
};

export default Alerts;
