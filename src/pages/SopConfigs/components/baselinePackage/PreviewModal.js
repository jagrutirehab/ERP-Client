import React, { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Input,
  Label,
  Spinner,
  Table,
} from "reactstrap";
import CustomModal from "../../../../Components/Common/Modal";
import { previewBaselinePackage } from "../../../../helpers/backend_helper";
import { SEVERITY_COLOR } from "../../../Alerts/components/alertConstants";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  }) : "—";

/**
 * Dry run: "what happens if I switch this on right now?"
 *
 * This exists because the equivalent question could not be asked of the SOP
 * rule sweep, and as a result a retroactive-activation floor that two comments
 * insist upon was never actually implemented — nobody could see the blast
 * radius before switching something on. The preview runs the exact arithmetic
 * the cron runs, against live data, and writes nothing.
 */
const PreviewModal = ({ isOpen, toggle, pkg, onActivate }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [effectiveFrom, setEffectiveFrom] = useState("");

  useEffect(() => {
    if (!isOpen || !pkg) {
      setResult(null);
      setError(null);
      return;
    }
    setEffectiveFrom(
      pkg.effectiveFrom ? String(pkg.effectiveFrom).slice(0, 10) : "",
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, pkg?._id]);

  const run = async () => {
    if (!pkg) return;
    setLoading(true);
    setError(null);
    try {
      const res = await previewBaselinePackage(pkg._id, effectiveFrom);
      setResult(res?.data || null);
    } catch (err) {
      setError(err?.message || "Could not run the preview");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Run once on open so the operator sees numbers without an extra click.
  useEffect(() => {
    if (isOpen && pkg && effectiveFrom) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, pkg?._id]);

  return (
    <CustomModal
      isOpen={isOpen}
      toggle={toggle}
      centered
      size="lg"
      title={`Preview — ${pkg?.name || ""}`}
    >
      <p className="text-muted" style={{ fontSize: "0.85rem" }}>
        Runs the live sweep in dry-run mode. Nothing is written. Change the
        effective date to see how many admissions come into scope before you
        activate.
      </p>

      <div className="d-flex align-items-end gap-2 mb-3">
        <div>
          <Label className="mb-1" for="preview-effective-from">
            Effective from
          </Label>
          <Input
            id="preview-effective-from"
            type="date"
            bsSize="sm"
            value={effectiveFrom}
            onChange={(e) => setEffectiveFrom(e.target.value)}
          />
        </div>
        <Button color="primary" size="sm" onClick={run} disabled={loading}>
          {loading ? "Running..." : "Re-run"}
        </Button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <Spinner size="sm" className="me-2" />
          Evaluating…
        </div>
      )}

      {error && <Alert color="warning">{error}</Alert>}

      {result && !loading && (
        <>
          <div className="d-flex flex-wrap gap-3 mb-3">
            <Stat label="Admissions in scope" value={result.admissionsInScope} />
            <Stat label="With a tier past due" value={result.candidates} />
            <Stat
              label="Would fire now"
              value={result.wouldFireNow}
              color={result.wouldFireNow > 20 ? "danger" : "success"}
            />
            <Stat label="Would supersede" value={result.wouldSupersede} />
            <Stat label="Would escalate" value={result.wouldEscalate} />
          </div>

          {result.wouldSupersede > 0 && (
            <Alert color="info" className="py-2" style={{ fontSize: "0.85rem" }}>
              <strong>{result.wouldSupersede}</strong> tier(s) would be marked
              superseded rather than fired. When several deadlines have already
              passed for one admission, only the highest fires — a ladder
              replayed in one second is four simultaneous alerts, not a ladder.
            </Alert>
          )}

          {result.skippedNoAdmissionDate > 0 && (
            <Alert color="warning" className="py-2" style={{ fontSize: "0.85rem" }}>
              <strong>{result.skippedNoAdmissionDate}</strong> admission(s)
              skipped — no admission date recorded, so no deadline can be
              computed.
            </Alert>
          )}

          {!!result.sample?.length && (
            <>
              <Label className="fw-semibold mb-1">
                Sample ({result.sample.length} of {result.wouldFireNow})
              </Label>
              <div style={{ maxHeight: 260, overflowY: "auto" }}>
                <Table size="sm" bordered responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Admitted</th>
                      <th>Tier</th>
                      <th>Severity</th>
                      <th>Superseded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.sample.map((s) => (
                      <tr key={s.admission}>
                        <td>{s.patient}</td>
                        <td>{fmtDate(s.admittedAt)}</td>
                        <td>
                          {s.tier} · {s.hours}h
                        </td>
                        <td>
                          <Badge color={SEVERITY_COLOR[s.severity] || "secondary"}>
                            {s.severity}
                          </Badge>
                          {s.escalated && (
                            <small
                              className="text-muted d-block"
                              title={s.escalationMatches?.join("\n")}
                            >
                              ↑ from {s.baseSeverity}
                            </small>
                          )}
                        </td>
                        <td>{s.supersedes?.join(", ") || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </>
      )}

      <div className="d-flex gap-2 justify-content-end mt-3">
        <Button color="light" onClick={toggle}>
          Close
        </Button>
        {result && !pkg?.isActive && (
          <Button
            color="success"
            onClick={() => onActivate(pkg, effectiveFrom)}
            disabled={loading}
          >
            Activate with this date
          </Button>
        )}
      </div>
    </CustomModal>
  );
};

const Stat = ({ label, value, color = "secondary" }) => (
  <div className="text-center px-3 py-2 border rounded">
    <div className={`fs-4 fw-semibold text-${color}`}>{value ?? "—"}</div>
    <small className="text-muted">{label}</small>
  </div>
);

export default PreviewModal;
