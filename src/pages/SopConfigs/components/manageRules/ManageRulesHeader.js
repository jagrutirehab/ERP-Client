import { Button, Spinner } from "reactstrap";
import { useNavigate } from "react-router-dom";
import RenderWhen from "../../../../Components/Common/RenderWhen";

const ManageRulesHeader = ({
  hasWritePermission,
  counts,
  loading,
  onNew,
  onRefresh,
}) => {
  const navigate = useNavigate();
  return (
    <div className="d-flex align-items-start justify-content-between mb-3 flex-wrap gap-2">
      <div>
        <h1 className="display-6 fw-bold text-primary mb-1">MANAGE SOPs</h1>
        <p className="text-muted mb-0">
          <strong>{counts.total}</strong> SOP{counts.total === 1 ? "" : "s"}{" "}
          total · <span className="text-success">{counts.active} active</span> ·{" "}
          <span className="text-muted">{counts.inactive} inactive</span>
        </p>
      </div>
      <div className="d-flex gap-2">
        <Button
          color="info"
          outline
          size="sm"
          onClick={() => navigate("/sop-configs/guide")}
        >
          <i className="bx bx-book-open me-1" /> View Guide
        </Button>

        <RenderWhen isTrue={hasWritePermission}>
          <Button color="primary" size="sm" onClick={onNew}>
            <i className="bx bx-plus me-1" /> New SOP
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
};

export default ManageRulesHeader;
