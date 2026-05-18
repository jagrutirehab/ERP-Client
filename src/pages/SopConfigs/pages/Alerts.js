import { useState } from "react";
import { CardBody } from "reactstrap";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import { useAlertsInbox } from "../components/alerts/useAlertsInbox";
import AlertsHeader from "../components/alerts/AlertsHeader";
import AlertsFilters from "../components/alerts/AlertsFilters";
import AlertsList from "../components/alerts/AlertsList";
import AlertDetailOffcanvas from "../components/alerts/AlertDetailOffcanvas";

const Alerts = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const inbox = useAlertsInbox();

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const selected = selectedId ? inbox.getAlertById(selectedId) : null;

  const openDetail = (alert) => {
    setSelectedId(alert._id);
    setDetailOpen(true);
    if (!alert.isRead) inbox.markRead(alert._id);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedId(null);
  };

  console.log({ inbox });

  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <AlertsHeader
        unreadCount={inbox.counts.unread}
        loading={inbox.loading}
        bulkLoading={inbox.bulkLoading}
        onMarkAllRead={inbox.markAllRead}
        onRefresh={inbox.load}
      />

      <AlertsFilters
        counts={inbox.counts}
        readFilter={inbox.readFilter}
        onReadFilterChange={inbox.setReadFilter}
        phaseFilter={inbox.phaseFilter}
        onPhaseFilterChange={inbox.setPhaseFilter}
        severityFilter={inbox.severityFilter}
        onToggleSeverity={inbox.toggleSeverity}
        onClearSeverity={inbox.clearSeverityFilter}
      />

      <AlertsList
        grouped={inbox.grouped}
        filteredCount={inbox.filtered.length}
        loading={inbox.loading}
        onSelect={openDetail}
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
