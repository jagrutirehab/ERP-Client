import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-toastify";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  FormGroup,
  Input,
  Label,
  Row,
  Spinner,
} from "reactstrap";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import CenterDropdown from "../../Report/Components/Doctor/components/CenterDropDown";
import EscalationTierRow from "../components/baselinePackage/EscalationTierRow";
import PackageTestPicker from "../components/baselinePackage/PackageTestPicker";
import {
  emptyBaselinePackageForm,
  emptyBaselineTier,
  BASELINE_TIER_SEED,
  BASELINE_DRUG_PATTERN_SUGGESTIONS,
  SEVERITY_OPTIONS,
} from "../../../Components/constants/sopConstants";
import {
  getBaselinePackageMeta,
  getBaselinePackageById,
  createBaselinePackage,
  updateBaselinePackage,
} from "../../../helpers/backend_helper";
import { useSelector } from "react-redux";

/** DB shape → form shape. */
const hydrate = (pkg) => ({
  name: pkg.name || "",
  description: pkg.description || "",
  centers: (pkg.centers || []).map((c) => (typeof c === "string" ? c : c._id)),
  effectiveFrom: pkg.effectiveFrom
    ? String(pkg.effectiveFrom).slice(0, 10)
    : "",
  tests: (pkg.tests || []).map((t) => (typeof t === "string" ? t : t.testId)),
  escalationEnabled: pkg.escalation?.enabled !== false,
  drugPatterns: pkg.escalation?.patterns || [],
  escalationNote: pkg.escalation?.note || "",
  tiers: (pkg.tiers || []).map((t) => ({
    ...emptyBaselineTier({ key: t.key, hours: t.hours, severity: t.severity }),
    message: t.message || "",
    actionGuidance: t.actionGuidance || "",
    referenceSection: t.referenceSection || "",
    selectedRoles: t.routing?.notifyRoles || [],
    selectedUsers: (t.routing?.notifySpecificUsers || []).map((u) =>
      typeof u === "string"
        ? { value: u, label: u }
        : { value: u._id, label: u.name || u._id },
    ),
    notifyAdmissionDoctor: !!t.routing?.notifyAdmissionDoctor,
    notifyAdmissionPsychologist: !!t.routing?.notifyAdmissionPsychologist,
  })),
});

/** Form shape → API payload. */
const serialise = (form) => ({
  name: form.name.trim(),
  description: form.description?.trim() || undefined,
  centers: form.centers || [],
  effectiveFrom: form.effectiveFrom,
  tests: form.tests.map((testId) => ({ testId, optional: false })),
  tiers: form.tiers.map((t) => ({
    key: t.key,
    hours: Number(t.hours),
    severity: t.severity?.value,
    message: t.message?.trim(),
    actionGuidance: t.actionGuidance?.trim() || undefined,
    referenceSection: t.referenceSection?.trim() || undefined,
    routing: {
      notifyRoles: t.selectedRoles || [],
      notifySpecificUsers: (t.selectedUsers || []).map((u) => u.value),
      notifyAdmissionDoctor: !!t.notifyAdmissionDoctor,
      notifyAdmissionPsychologist: !!t.notifyAdmissionPsychologist,
    },
  })),
  escalation: {
    enabled: !!form.escalationEnabled,
    patterns: form.drugPatterns || [],
    note: form.escalationNote?.trim() || undefined,
  },
});

/**
 * Client-side ladder validation. Mirrors the server's checks so the operator
 * gets them inline; the server remains the authority.
 */
const validate = (form) => {
  const errors = { tiers: {} };
  if (!form.name.trim()) errors.name = "A package name is required";
  if (!form.effectiveFrom) errors.effectiveFrom = "Pick an effective date";
  if (!form.tests.length) errors.tests = "Select at least one test";
  if (!form.tiers.length) errors.tiers._ = "Add at least one tier";

  let prevHours = 0;
  let prevRank = -1;
  const seenKeys = new Set();

  form.tiers.forEach((t, i) => {
    const hours = Number(t.hours);
    if (!t.key) errors.tiers[i] = "Pick a tier";
    else if (seenKeys.has(t.key)) errors.tiers[i] = `${t.key} used twice`;
    else if (!Number.isFinite(hours) || hours <= 0)
      errors.tiers[i] = "Hours must be > 0";
    else if (hours <= prevHours)
      errors.tiers[i] = `Hours must exceed the previous tier (${prevHours}h)`;
    else if (!t.message?.trim()) errors.tiers[i] = "Needs an alert message";
    else {
      const rank = SEVERITY_OPTIONS.findIndex(
        (o) => o.value === t.severity?.value,
      );
      if (rank < prevRank) errors.tiers[i] = "Severity cannot decrease";
      else {
        const hasTarget =
          (t.selectedRoles?.length || 0) > 0 ||
          (t.selectedUsers?.length || 0) > 0 ||
          t.notifyAdmissionDoctor ||
          t.notifyAdmissionPsychologist;
        if (!hasTarget) errors.tiers[i] = "Needs at least one recipient";
        prevRank = rank;
      }
    }
    if (t.key) seenKeys.add(t.key);
    if (Number.isFinite(hours) && hours > prevHours) prevHours = hours;
  });

  if (form.escalationEnabled && !form.drugPatterns.length)
    errors.drugPatterns = "Add patterns, or turn escalation off";
  if (form.drugPatterns.some((p) => p.trim().length < 3))
    errors.drugPatterns = "Each pattern needs at least 3 characters";

  const hasErrors =
    Object.keys(errors).some((k) => k !== "tiers" && errors[k]) ||
    Object.keys(errors.tiers).length > 0;

  return { errors, hasErrors };
};

const SaveBaselinePackage = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { loading: permissionLoader, hasPermission } = usePermissions(token);
  const canWrite =
    hasPermission("SOPCONFIGS", "BASELINE_PACKAGE", "WRITE") ||
    hasPermission("SOPCONFIGS", "MANAGE", "WRITE");

  useEffect(() => {
    if (permissionLoader) return;
    if (!canWrite) navigate("/unauthorized");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canWrite, permissionLoader]);

  // Center options scoped to the user's access — the same source SOPForm uses.
  // `s.Center.data` is the full list; centerAccess narrows it to what this user
  // may actually scope a package to.
  const allCenters = useSelector((s) => s.Center?.data);
  const centerAccess = useSelector((s) => s.User?.centerAccess);
  const centerOptions = (allCenters || [])
    .filter((c) => (centerAccess || []).map((a) => a?._id || a).includes(c._id))
    .map((c) => ({ _id: c._id, title: c.title }));

  const [form, setForm] = useState(emptyBaselinePackageForm);
  const [meta, setMeta] = useState({ tests: [], panels: [] });
  const [fieldErrors, setFieldErrors] = useState({ tiers: {} });
  const [topError, setTopError] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;
    getBaselinePackageMeta()
      .then((res) => {
        if (alive) setMeta(res?.data || { tests: [], panels: [] });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    let alive = true;
    setLoading(true);
    getBaselinePackageById(id)
      .then((res) => {
        if (!alive) return;
        if (res?.data) setForm(hydrate(res.data));
      })
      .catch((err) => {
        if (alive) setTopError(err?.message || "Could not load the package");
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id, isEdit]);

  const setField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleTierChange = useCallback((idx, field, value) => {
    setForm((prev) => {
      const tiers = [...prev.tiers];
      tiers[idx] = { ...tiers[idx], [field]: value };
      return { ...prev, tiers };
    });
  }, []);

  const addTier = () => {
    const used = new Set(form.tiers.map((t) => t.key));
    const nextSeed =
      BASELINE_TIER_SEED.find((s) => !used.has(s.key)) || BASELINE_TIER_SEED[0];
    setForm((prev) => ({
      ...prev,
      tiers: [...prev.tiers, emptyBaselineTier(nextSeed)],
    }));
  };

  const removeTier = (idx) =>
    setForm((prev) => ({
      ...prev,
      tiers: prev.tiers.filter((_, i) => i !== idx),
    }));

  const handleSubmit = async () => {
    const { errors, hasErrors } = validate(form);
    setFieldErrors(errors);
    if (hasErrors) {
      setTopError("Fix the highlighted fields before saving.");
      return;
    }
    setTopError(null);
    setSubmitting(true);
    try {
      if (isEdit) await updateBaselinePackage(id, serialise(form));
      else await createBaselinePackage(serialise(form));
      toast.success(isEdit ? "Package updated" : "Package created");
      navigate("/sop-configs/baseline-package");
    } catch (err) {
      // The interceptor rejects with the unwrapped body — err.message, not
      // err.response.data.message.
      setTopError(err?.message || "Could not save the package");
      toast.warn(err?.message || "Could not save the package");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <CardBody
        className="p-3 bg-white"
        style={isMobile ? { width: "100%" } : { width: "78%" }}
      >
        <div className="text-center py-5">
          <Spinner /> <span className="ms-2">Loading package…</span>
        </div>
      </CardBody>
    );
  }

  const patternOptions = BASELINE_DRUG_PATTERN_SUGGESTIONS.map((p) => ({
    value: p,
    label: p,
  }));

  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">
          {isEdit ? "Edit" : "New"} Baseline Investigation Package
        </h5>
        <Button
          color="light"
          size="sm"
          onClick={() => navigate("/sop-configs/baseline-package")}
        >
          Back
        </Button>
      </div>

      {topError && <Alert color="danger">{topError}</Alert>}

      {!isEdit && (
        <Alert color="info" className="py-2" style={{ fontSize: "0.85rem" }}>
          New packages are created <strong>inactive</strong>. Activate from the
          list once you have run the preview — that is what shows you how many
          admissions come into scope.
        </Alert>
      )}

      {/* 1. Basic info */}
      <Card className="mb-3">
        <CardHeader className="fw-semibold">1. Basic Info</CardHeader>
        <CardBody>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label>
                  Package Name <span className="text-danger">*</span>
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  invalid={!!fieldErrors.name}
                  disabled={submitting}
                />
                {fieldErrors.name && (
                  <small className="text-danger">{fieldErrors.name}</small>
                )}
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>
                  Effective From <span className="text-danger">*</span>
                </Label>
                <Input
                  type="date"
                  value={form.effectiveFrom}
                  onChange={(e) => setField("effectiveFrom", e.target.value)}
                  invalid={!!fieldErrors.effectiveFrom}
                  disabled={submitting}
                />
                <small className="text-muted">
                  Only admissions dated on or after this are ever in scope. A
                  fresh package covers no existing inpatients — that is the safe
                  default.
                </small>
              </FormGroup>
            </Col>
          </Row>
          <FormGroup className="mb-0">
            <Label>Description</Label>
            <Input
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              disabled={submitting}
            />
          </FormGroup>
        </CardBody>
      </Card>

      {/* 2. Applies to */}
      <Card className="mb-3">
        <CardHeader className="fw-semibold">2. Applies To</CardHeader>
        <CardBody>
          <Label className="fw-semibold d-block mb-1">Centers</Label>
          <small className="text-muted d-block mb-2">
            Leave empty to make this the global default. Exactly one package may
            apply to any admission, so overlapping center scopes are rejected.
          </small>
          {/* className="" overrides the component's topbar-header default, the
              same way MainBlock does when rendering it inline in a form. */}
          <CenterDropdown
            options={centerOptions}
            value={form.centers}
            onChange={(ids) => setField("centers", ids)}
            className=""
          />
        </CardBody>
      </Card>

      {/* 3. Package tests */}
      <Card className="mb-3">
        <CardHeader className="fw-semibold">3. Package Tests</CardHeader>
        <CardBody>
          <PackageTestPicker
            tests={meta.tests}
            panels={meta.panels}
            value={form.tests}
            onChange={(v) => setField("tests", v)}
            disabled={submitting}
            error={fieldErrors.tests}
          />
        </CardBody>
      </Card>

      {/* 4. Escalation ladder */}
      <Card className="mb-3">
        <CardHeader className="d-flex justify-content-between align-items-center">
          <span className="fw-semibold">4. Escalation Ladder</span>
          <div className="d-flex align-items-center gap-2">
            <small className="text-muted">
              Max <strong>{form.tiers.length}</strong> alert(s) per admission
            </small>
            <Button
              size="sm"
              color="primary"
              outline
              onClick={addTier}
              disabled={submitting || form.tiers.length >= 4}
            >
              + Add Tier
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {fieldErrors.tiers?._ && (
            <Alert color="danger" className="py-2">
              {fieldErrors.tiers._}
            </Alert>
          )}
          {form.tiers.map((tier, idx) => (
            <EscalationTierRow
              key={tier.id}
              tier={tier}
              idx={idx}
              onChange={handleTierChange}
              onRemove={removeTier}
              canRemove={form.tiers.length > 1}
              disabled={submitting}
              error={fieldErrors.tiers?.[idx]}
            />
          ))}
        </CardBody>
      </Card>

      {/* 5. Escalation modifier */}
      <Card className="mb-3">
        <CardHeader className="fw-semibold">
          5. Escalation Modifier
        </CardHeader>
        <CardBody>
          <div className="form-check form-switch mb-2">
            <Input
              type="checkbox"
              role="switch"
              id="bip-escalation-enabled"
              checked={form.escalationEnabled}
              onChange={(e) => setField("escalationEnabled", e.target.checked)}
              disabled={submitting}
            />
            <Label
              className="form-check-label ms-2"
              htmlFor="bip-escalation-enabled"
            >
              Escalate one severity level when the patient is on a drug
              requiring baseline labs
            </Label>
          </div>

          {form.escalationEnabled && (
            <>
              <FormGroup>
                <Label>
                  Drug name patterns <span className="text-danger">*</span>
                </Label>
                <CreatableSelect
                  isMulti
                  options={patternOptions}
                  value={form.drugPatterns.map((p) => ({ value: p, label: p }))}
                  onChange={(sel) =>
                    setField(
                      "drugPatterns",
                      (sel || []).map((s) => s.value.trim().toUpperCase()),
                    )
                  }
                  formatCreateLabel={(v) => `Add pattern "${v.toUpperCase()}"`}
                  isDisabled={submitting}
                  placeholder="Type a pattern and press enter..."
                />
                {fieldErrors.drugPatterns && (
                  <small className="text-danger d-block">
                    {fieldErrors.drugPatterns}
                  </small>
                )}
                <small className="text-muted d-block mt-1">
                  Case-insensitive <strong>substrings</strong>, matched against
                  the prescribed name plus the drug master&apos;s generic name
                  and composition. Note a brand like <em>LITHOSUN</em> is{" "}
                  <strong>not</strong> matched by &quot;LITHIUM&quot; on name
                  alone — it relies on the master carrying the generic. Curate
                  these against your formulary.
                </small>
              </FormGroup>

              <FormGroup className="mb-0">
                <Label>Escalation note (optional)</Label>
                <Input
                  value={form.escalationNote}
                  onChange={(e) => setField("escalationNote", e.target.value)}
                  placeholder="Escalated to {severity}: patient on {drugs} — baseline labs outstanding."
                  disabled={submitting}
                />
                <small className="text-muted">
                  Appended to the tier message; the authored text is never
                  replaced. Supports <code>{"{severity}"}</code> and{" "}
                  <code>{"{drugs}"}</code>.
                </small>
              </FormGroup>
            </>
          )}
        </CardBody>
      </Card>

      <div className="d-flex gap-2 justify-content-end">
        <Button
          color="light"
          onClick={() => navigate("/sop-configs/baseline-package")}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button color="primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Saving..." : isEdit ? "Save Changes" : "Create Package"}
        </Button>
      </div>
    </CardBody>
  );
};

export default SaveBaselinePackage;
