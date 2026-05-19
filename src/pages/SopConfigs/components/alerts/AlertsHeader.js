import { Button, Spinner } from "reactstrap";
import RenderWhen from "../../../../Components/Common/RenderWhen";

const AlertsHeader = ({
  hasWritePermission,
  unreadCount,
  loading,
  bulkLoading,
  onMarkAllRead,
  onRefresh,
}) => (
  <div className="d-flex align-items-start justify-content-between mb-3 flex-wrap gap-2">
    <div>
      <h1 className="display-6 fw-bold text-primary mb-1">SOP ALERTS</h1>
      <p className="text-muted mb-0">
        {unreadCount > 0 ? (
          <>
            You have <strong>{unreadCount}</strong> unread alert
            {unreadCount === 1 ? "" : "s"}.
          </>
        ) : (
          "You're all caught up."
        )}
      </p>
    </div>
    <div className="d-flex gap-2">
      <RenderWhen isTrue={hasWritePermission}>
        <Button
          color="primary"
          outline
          size="sm"
          onClick={onMarkAllRead}
          disabled={bulkLoading || unreadCount === 0}
        >
          {bulkLoading ? (
            <Spinner size="sm" />
          ) : (
            <>
              <i className="bx bx-check-double me-1" />
              Mark all read
            </>
          )}
        </Button>
      </RenderWhen>
      <Button
        color="secondary"
        outline
        size="sm"
        onClick={onRefresh}
        disabled={loading}
      >
        {loading ? (
          <Spinner size="sm" />
        ) : (
          <>
            <i className="bx bx-refresh me-1" />
            Refresh
          </>
        )}
      </Button>
    </div>
  </div>
);

export default AlertsHeader;
