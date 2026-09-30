import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Input,
  Spinner,
  Table,
} from "reactstrap";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import { useBaselinePackages } from "../components/baselinePackage/useBaselinePackages";
import PreviewModal from "../components/baselinePackage/PreviewModal";
import { SEVERITY_COLOR } from "../../Alerts/components/alertConstants";

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const ManageBaselinePackages = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const navigate = useNavigate();
  const state = useBaselinePackages();

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { loading: permissionLoader, hasPermission } = usePermissions(token);

  // OR-fallback to MANAGE on purpose. A newly added submodule reads as NONE on
  // every existing role until an admin re-saves each one, so without this
  // nobody — including today's SOP admins — could open the section on day one.
  // TODO: drop the MANAGE fallback once roles have been re-saved.
  const hasReadPermission =
    hasPermission("SOPCONFIGS", "BASELINE_PACKAGE", "READ") ||
    hasPermission("SOPCONFIGS", "MANAGE", "READ");
  const hasWritePermission =
    hasPermission("SOPCONFIGS", "BASELINE_PACKAGE", "WRITE") ||
    hasPermission("SOPCONFIGS", "MANAGE", "WRITE");
  const hasDeletePermission =
    hasPermission("SOPCONFIGS", "BASELINE_PACKAGE", "DELETE") ||
    hasPermission("SOPCONFIGS", "MANAGE", "DELETE");

  useEffect(() => {
    if (permissionLoader) return;
    if (!hasReadPermission) navigate("/unauthorized");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasReadPermission, permissionLoader]);

  const [previewTarget, setPreviewTarget] = useState(null);

  const handleActivateFromPreview = async (pkg, effectiveFrom) => {
    const ok = await state.handleToggleActive({ ...pkg, effectiveFrom });
    if (ok) {
      setPreviewTarget(null);
      state.load();
    }
  };

  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h5 className="mb-1">Baseline Investigation Package</h5>
          <small className="text-muted">
            The admission-time lab package and its escalation ladder.{" "}
            {state.counts.active} active · {state.counts.inactive} inactive
          </small>
        </div>
        <div className="d-flex gap-2">
          <Button color="light" size="sm" onClick={state.load}>
            <i className="bx bx-refresh" /> Refresh
          </Button>
          {hasWritePermission && (
            <Button
              color="primary"
              size="sm"
              onClick={() => navigate("/sop-configs/baseline-package/save")}
            >
              + New Package
            </Button>
          )}
        </div>
      </div>

      <div className="d-flex gap-2 flex-wrap mb-3">
        <Input
          bsSize="sm"
          style={{ maxWidth: 260 }}
          placeholder="Search by name..."
          value={state.search}
          onChange={(e) => state.setSearch(e.target.value)}
        />
        <ButtonGroup size="sm">
          {["all", "active", "inactive"].map((f) => (
            <Button
              key={f}
              color={state.activeFilter === f ? "primary" : "light"}
              onClick={() => state.setActiveFilter(f)}
            >
              {f[0].toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      {state.loading ? (
        <div className="text-center py-5">
          <Spinner /> <span className="ms-2">Loading packages…</span>
        </div>
      ) : !state.filtered.length ? (
        <Card body className="text-center text-muted py-5">
          <i className="bx bx-test-tube fs-1 d-block mb-2" />
          No baseline packages yet.
          {hasWritePermission && (
            <div className="mt-2">
              <Button
                color="primary"
                size="sm"
                onClick={() => navigate("/sop-configs/baseline-package/save")}
              >
                Create the first one
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <Table responsive bordered className="align-middle">
          <thead>
            <tr>
              <th>Name</th>
              <th>Applies to</th>
              <th>Effective from</th>
              <th>Tests</th>
              <th>Ladder</th>
              <th>Active</th>
              <th style={{ width: 180 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {state.filtered.map((p) => (
              <tr key={p._id}>
                <td>
                  <div className="fw-semibold">{p.name}</div>
                  {p.description && (
                    <small className="text-muted">{p.description}</small>
                  )}
                </td>
                <td>
                  {p.centers?.length ? (
                    p.centers.map((c) => (
                      <Badge
                        key={c._id || c}
                        color="light"
                        className="text-dark me-1"
                      >
                        {c.title || c.name || "Center"}
                      </Badge>
                    ))
                  ) : (
                    <Badge color="secondary">All centers</Badge>
                  )}
                </td>
                <td>{fmtDate(p.effectiveFrom)}</td>
                <td>{p.tests?.length || 0}</td>
                <td>
                  {(p.tiers || []).map((t) => (
                    <Badge
                      key={t.key}
                      color={SEVERITY_COLOR[t.severity] || "secondary"}
                      className="me-1"
                      title={`${t.key} at ${t.hours}h → ${t.severity}`}
                    >
                      {t.hours}h
                    </Badge>
                  ))}
                  {/* Max alerts per admission is DERIVED from ladder length —
                      show it so the relationship is visible. */}
                  <small className="text-muted d-block">
                    max {p.tiers?.length || 0} alert(s) per admission
                  </small>
                </td>
                <td>
                  <div className="form-check form-switch">
                    <Input
                      type="checkbox"
                      role="switch"
                      checked={!!p.isActive}
                      disabled={!hasWritePermission}
                      onChange={() => state.handleToggleActive(p)}
                    />
                  </div>
                </td>
                <td>
                  <div className="d-flex gap-1">
                    <Button
                      size="sm"
                      color="info"
                      outline
                      onClick={() => setPreviewTarget(p)}
                      title="Dry run — see what would fire"
                    >
                      Preview
                    </Button>
                    {hasWritePermission && (
                      <Button
                        size="sm"
                        color="primary"
                        outline
                        onClick={() =>
                          navigate(
                            `/sop-configs/baseline-package/save/${p._id}`,
                          )
                        }
                      >
                        Edit
                      </Button>
                    )}
                    {hasDeletePermission && (
                      <Button
                        size="sm"
                        color="danger"
                        outline
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete "${p.name}"? This deactivates it and removes it from the list.`,
                            )
                          )
                            state.handleDelete(p);
                        }}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <PreviewModal
        isOpen={!!previewTarget}
        toggle={() => setPreviewTarget(null)}
        pkg={previewTarget}
        onActivate={handleActivateFromPreview}
      />
    </CardBody>
  );
};

export default ManageBaselinePackages;
