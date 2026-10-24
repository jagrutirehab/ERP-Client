import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  Label,
  Input,
  Button,
  FormGroup,
  Spinner,
} from "reactstrap";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Select from "react-select";
import { X } from "lucide-react";
import { capitalizeWords } from "../../../utils/toCapitalize";
import {
  fetchComplianceTypeById,
  addComplianceType,
  updateComplianceType,
  fetchComplianceCategories,
  clearCurrentComplianceType,
} from "../../../store/features/compliance/complianceSlice";
import { useAuthError } from "../../../Components/Hooks/useAuthError";

const LEAD_OPTIONS = [30, 45, 60, 90];

const validationSchema = Yup.object({
  name: Yup.string().trim().required("Name is required"),
  shortName: Yup.string().trim().required("Short name is required"),
  category: Yup.string().required("Category is required"),
  hasExpiry: Yup.boolean(),
  leadDays: Yup.number().when("hasExpiry", {
    is: true,
    then: (schema) =>
      schema
        .typeError("Enter a valid renewal lead time")
        .required("Renewal lead time is required")
        .min(1, "Renewal lead time must be at least 1 day"),
    otherwise: (schema) => schema.notRequired(),
  }),
  issuingAuthorityHint: Yup.string().trim(),
});

const ComplianceTypeForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleAuthError = useAuthError();
  const { typeId } = useParams();
  const isEdit = !!typeId;
  const centerList = useSelector((state) => state.Center.data) || [];
  const { categories, categoriesLoading, saving } = useSelector((state) => state.Compliance);

  const [loading, setLoading] = useState(isEdit);
  const [active, setActive] = useState(true);
  const [applicable, setApplicable] = useState(() => new Set());
  const [checklistSteps, setChecklistSteps] = useState([]);

  const form = useFormik({
    initialValues: {
      name: "",
      shortName: "",
      category: "",
      hasExpiry: true,
      leadDays: 60,
      issuingAuthorityHint: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      const payload = {
        name: values.name.trim(),
        shortName: values.shortName.trim(),
        category: values.category,
        hasExpiry: values.hasExpiry,
        defaultLeadDays: values.hasExpiry ? values.leadDays : 0,
        applicableCenters: Array.from(applicable),
        issuingAuthorityHint: values.issuingAuthorityHint.trim(),
        checklistSteps: values.hasExpiry
          ? checklistSteps
              .map((s) => ({ text: s.text.trim(), mandatory: !!s.mandatory }))
              .filter((s) => s.text)
          : [],
        active,
      };

      try {
        if (isEdit) {
          await dispatch(updateComplianceType({ id: typeId, data: payload })).unwrap();
          toast.success("Compliance type updated.");
        } else {
          await dispatch(addComplianceType(payload)).unwrap();
          toast.success("Compliance type created.");
        }
        navigate("/compliance/types");
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error(error?.message || "Failed to save compliance type");
        }
      }
    },
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        await dispatch(fetchComplianceCategories()).unwrap();
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error(error?.message || "Failed to load categories");
        }
      }
    };
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    if (!isEdit) return;
    const loadType = async () => {
      try {
        const res = await dispatch(fetchComplianceTypeById(typeId)).unwrap();
        const existing = res?.data;
        if (!existing) return;
        form.setValues({
          name: existing.name || "",
          shortName: existing.shortName || "",
          category: existing.category?._id || existing.category || "",
          hasExpiry: !!existing.hasExpiry,
          leadDays: existing.defaultLeadDays || 60,
          issuingAuthorityHint: existing.issuingAuthorityHint || "",
        });
        setActive(existing.active !== false);
        setApplicable(new Set((existing.applicableCenters || []).map((c) => c._id || c)));
        // Normalize legacy string-only checklist steps (pre-mandatory-marker data)
        setChecklistSteps(
          (existing.checklistSteps || []).map((s) =>
            typeof s === "string" ? { text: s, mandatory: false } : s,
          ),
        );
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error(error?.message || "Failed to load compliance type");
        }
      } finally {
        setLoading(false);
      }
    };
    loadType();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, typeId]);

  useEffect(() => () => dispatch(clearCurrentComplianceType()), [dispatch]);

  const toggleCentre = (id) =>
    setApplicable((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const categoryOptions = categories
    .filter((c) => c.active)
    .map((c) => ({ value: c._id, label: capitalizeWords(c.name) }));

  const updateStepText = (idx, text) =>
    setChecklistSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, text } : s)));
  const toggleStepMandatory = (idx) =>
    setChecklistSteps((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, mandatory: !s.mandatory } : s)),
    );
  const removeStep = (idx) =>
    setChecklistSteps((prev) => prev.filter((_, i) => i !== idx));
  const addStep = () => setChecklistSteps((prev) => [...prev, { text: "", mandatory: false }]);

  const allSelected = centerList.length > 0 && applicable.size === centerList.length;
  const toggleAll = () =>
    setApplicable(allSelected ? new Set() : new Set(centerList.map((c) => c._id)));

  if (loading) {
    return (
      <div className="p-3 p-lg-4 text-center py-5">
        <Spinner color="primary" />
      </div>
    );
  }

  return (
    <div className="p-3 p-lg-4">
      <div className="mb-3">
        <h5 className="mb-1 fw-semibold">
          {isEdit ? "Edit compliance type" : "Add compliance type"}
        </h5>
        <p className="text-muted mb-0 fs-13">
          Define the master licence category, its renewal behaviour and which centres it applies to.
        </p>
      </div>

        <form onSubmit={form.handleSubmit} noValidate>
              <Card className="shadow-sm mb-3">
                <CardBody>
                  <h6 className="mb-3">Type details</h6>
                  <Row className="g-3">
                    <Col sm={8}>
                      <FormGroup className="mb-0">
                        <Label for="name" className="fw-medium">
                          Name <span className="text-danger">*</span>
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="e.g. Fire NOC"
                          value={form.values.name}
                          onChange={form.handleChange}
                          onBlur={form.handleBlur}
                          className={form.touched.name && form.errors.name ? "is-invalid" : ""}
                        />
                        {form.touched.name && form.errors.name && (
                          <div className="invalid-feedback d-block">{form.errors.name}</div>
                        )}
                      </FormGroup>
                    </Col>
                    <Col sm={4}>
                      <FormGroup className="mb-0">
                        <Label for="shortName" className="fw-medium">
                          Short name <span className="text-danger">*</span>
                        </Label>
                        <Input
                          id="shortName"
                          name="shortName"
                          placeholder="e.g. Fire NOC"
                          value={form.values.shortName}
                          onChange={form.handleChange}
                          onBlur={form.handleBlur}
                          className={form.touched.shortName && form.errors.shortName ? "is-invalid" : ""}
                        />
                        {form.touched.shortName && form.errors.shortName && (
                          <div className="invalid-feedback d-block">{form.errors.shortName}</div>
                        )}
                      </FormGroup>
                    </Col>
                    <Col sm={6}>
                      <FormGroup className="mb-0">
                        <div className="d-flex justify-content-between align-items-center">
                          <Label className="fw-medium mb-0">
                            Category <span className="text-danger">*</span>
                          </Label>
                          <Link to="/compliance/categories" className="text-decoration-none" style={{ fontSize: 12 }}>
                            + New category
                          </Link>
                        </div>
                        <Select
                          classNamePrefix="react-select"
                          options={categoryOptions}
                          value={categoryOptions.find((o) => o.value === form.values.category)}
                          onChange={(option) => form.setFieldValue("category", option?.value || "")}
                          onBlur={() => form.setFieldTouched("category", true)}
                          isLoading={categoriesLoading}
                          placeholder={categoriesLoading ? "Loading…" : "Select a category"}
                          noOptionsMessage={() => "No categories yet — create one first"}
                          className={form.touched.category && form.errors.category ? "react-select is-invalid" : "react-select"}
                        />
                        {form.touched.category && form.errors.category && (
                          <div className="invalid-feedback d-block">{form.errors.category}</div>
                        )}
                      </FormGroup>
                    </Col>
                    <Col sm={6}>
                      <FormGroup className="mb-0">
                        <Label for="issuingAuthorityHint" className="fw-medium">
                          Issuing authority
                        </Label>
                        <Input
                          id="issuingAuthorityHint"
                          name="issuingAuthorityHint"
                          placeholder="e.g. Municipal Fire Brigade"
                          value={form.values.issuingAuthorityHint}
                          onChange={form.handleChange}
                          onBlur={form.handleBlur}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                </CardBody>
              </Card>

              <Card className="shadow-sm mb-3">
                <CardBody>
                  <h6 className="mb-3">Renewal behaviour</h6>
                  <FormGroup check className="mb-3">
                    <Input
                      id="typeHasExpiry"
                      type="checkbox"
                      checked={form.values.hasExpiry}
                      onChange={(e) => form.setFieldValue("hasExpiry", e.target.checked)}
                    />
                    <Label check htmlFor="typeHasExpiry">
                      This licence type expires and needs renewal
                    </Label>
                  </FormGroup>
                  {form.values.hasExpiry && (
                    <FormGroup className="mb-0">
                      <Label className="fw-medium">
                        Default renewal lead time <span className="text-danger">*</span>
                      </Label>
                      <div className="d-flex flex-wrap gap-2">
                        {LEAD_OPTIONS.map((d) => (
                          <Button
                            key={d}
                            type="button"
                            size="sm"
                            color={form.values.leadDays === d ? "success" : "light"}
                            className={form.values.leadDays === d ? "text-white" : "border"}
                            onClick={() => form.setFieldValue("leadDays", d)}
                          >
                            {d} days
                          </Button>
                        ))}
                        <Button
                          type="button"
                          size="sm"
                          color={!LEAD_OPTIONS.includes(form.values.leadDays) ? "success" : "light"}
                          className={!LEAD_OPTIONS.includes(form.values.leadDays) ? "text-white" : "border"}
                          onClick={() => form.setFieldValue("leadDays", 0)}
                        >
                          Custom
                        </Button>
                      </div>
                      {!LEAD_OPTIONS.includes(form.values.leadDays) && (
                        <div className="mt-2" style={{ maxWidth: 160 }}>
                          <Input
                            type="number"
                            min={1}
                            placeholder="Days"
                            value={form.values.leadDays || ""}
                            onChange={(e) =>
                              form.setFieldValue("leadDays", Math.max(0, Number(e.target.value) || 0))
                            }
                            onBlur={() => form.setFieldTouched("leadDays", true)}
                            className={form.touched.leadDays && form.errors.leadDays ? "is-invalid" : ""}
                          />
                        </div>
                      )}
                      {form.touched.leadDays && form.errors.leadDays && (
                        <div className="invalid-feedback d-block">{form.errors.leadDays}</div>
                      )}
                      <div className="text-muted mt-2" style={{ fontSize: 12 }}>
                        Prefills the renewal form; each item can still override this.
                      </div>
                    </FormGroup>
                  )}
                </CardBody>
              </Card>

              {form.values.hasExpiry && (
                <Card className="shadow-sm mb-3">
                  <CardBody>
                    <h6 className="mb-3">Renewal checklist</h6>
                    <p className="text-muted" style={{ fontSize: 13 }}>
                      Steps shown against every item of this type while it&apos;s due, expired or in
                      renewal. Leave empty to use the default checklist. Mark a step{" "}
                      <strong>Mandatory</strong> to require it be checked off before a submission
                      can be sent for verification — not just saved as a draft.
                    </p>
                    <div className="d-flex flex-column gap-2">
                      {checklistSteps.map((step, idx) => (
                        <div key={idx} className="d-flex align-items-center gap-2">
                          <Input
                            value={step.text}
                            placeholder={`Step ${idx + 1}`}
                            onChange={(e) => updateStepText(idx, e.target.value)}
                          />
                          <FormGroup check className="mb-0 text-nowrap flex-shrink-0">
                            <Input
                              id={`step-mandatory-${idx}`}
                              type="checkbox"
                              checked={!!step.mandatory}
                              onChange={() => toggleStepMandatory(idx)}
                            />
                            <Label check htmlFor={`step-mandatory-${idx}`} className="mb-0">
                              Mandatory
                            </Label>
                          </FormGroup>
                          <Button
                            type="button"
                            color="light"
                            className="border p-2"
                            size="sm"
                            onClick={() => removeStep(idx)}
                          >
                            <X size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button type="button" color="link" size="sm" className="p-0 mt-2" onClick={addStep}>
                      + Add step
                    </Button>
                  </CardBody>
                </Card>
              )}

              <Card className="shadow-sm mb-3">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">Applicable centres</h6>
                    <Button type="button" color="link" size="sm" className="p-0" onClick={toggleAll}>
                      {allSelected ? "Clear all" : "Select all"}
                    </Button>
                  </div>
                  <p className="text-muted" style={{ fontSize: 13 }}>
                    Centres left unchecked won&apos;t show this item at all — not as missing, just
                    not applicable.
                  </p>
                  <Row className="g-2">
                    {centerList.map((centre) => (
                      <Col xs={6} sm={4} key={centre._id}>
                        <FormGroup check className="mb-0">
                          <Input
                            id={`centre-${centre._id}`}
                            type="checkbox"
                            checked={applicable.has(centre._id)}
                            onChange={() => toggleCentre(centre._id)}
                          />
                          <Label check htmlFor={`centre-${centre._id}`}>
                            {centre.title}
                          </Label>
                        </FormGroup>
                      </Col>
                    ))}
                  </Row>
                </CardBody>
              </Card>

              <Card className="shadow-sm mb-3">
                <CardBody>
                  <FormGroup check className="mb-0">
                    <Input
                      id="typeActive"
                      type="checkbox"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                    />
                    <Label check htmlFor="typeActive">
                      Active (shows up when adding a compliance item)
                    </Label>
                  </FormGroup>
                </CardBody>
              </Card>

              <div className="d-flex flex-column flex-sm-row justify-content-sm-end gap-2">
                <Button
                  type="button"
                  color="light"
                  className="border"
                  onClick={() => navigate("/compliance/types")}
                >
                  Cancel
                </Button>
                <Button type="submit" color="success" className="text-white" disabled={saving}>
                  {saving ? <Spinner size="sm" /> : isEdit ? "Save changes" : "Create type"}
                </Button>
              </div>
        </form>
    </div>
  );
};

export default ComplianceTypeForm;
