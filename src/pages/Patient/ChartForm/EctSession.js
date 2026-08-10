import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Form,
  Row,
  Col,
  Input,
  Button,
  Label,
  FormGroup,
  Alert,
} from "reactstrap";
import { useFormik } from "formik";
import { connect, useDispatch } from "react-redux";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";
import {
  ECT_SESSION,
  ectSessionSections,
} from "../../../Components/constants/patient";
import {
  addEctSession,
  addGeneralEctSession,
  updateEctSession,
  createEditChart,
  fetchLastEctSession,
  setPtLatestEctSession,
} from "../../../store/actions";

// Fields that should be prefilled from patient data and made non-editable
const READONLY_FIELDS = new Set(["patientName", "sex"]);

// Always derived from the current chartDate — never carried over from the
// previous session, which would silently backdate the new record.
const SESSION_LOCAL_FIELDS = new Set(["date", "timeOfProcedure"]);

// The patient/admission record is the authoritative source for these, so it
// takes precedence over the previous session (which holds the same data, only
// staler). The previous session is still used as a fallback.
const PATIENT_DERIVED_FIELDS = new Set([
  "patientName",
  "sex",
  "uhid",
  "age",
  "diagnosis",
]);

const formatSourceDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Build Formik initial values for the grouped sections.
//
// `source` is the record being edited; `previous` is the patient's last ECT
// session, used to prefill a brand-new record. Checkbox groups default to
// arrays, everything else to empty strings.
const buildInitialSections = (source, patient, chartDate, previous) => {
  const out = {};
  const admission = patient?.addmission;

  ectSessionSections.forEach((section) => {
    out[section.key] = {};
    section.fields.forEach((field) => {
      const existing = source?.[section.key]?.[field.name];

      const carried =
        previous && !SESSION_LOCAL_FIELDS.has(field.name)
          ? previous?.[section.key]?.[field.name]
          : undefined;

      const hasCarried =
        carried !== undefined && carried !== null && carried !== "";

      const applyCarried = () => {
        out[section.key][field.name] =
          field.type === "checkbox"
            ? Array.isArray(carried)
              ? carried
              : []
            : carried;
      };

      // When editing, always honour the saved value
      if (existing !== undefined && existing !== null && existing !== "") {
        out[section.key][field.name] =
          field.type === "checkbox"
            ? Array.isArray(existing)
              ? existing
              : []
            : existing;
        return;
      }

      // Prefill logic for new records
      if (section.key === "sessionDetails") {
        switch (field.name) {
          case "date": {
            // Extract date portion from chartDate (YYYY-MM-DD)
            if (chartDate) {
              const d = new Date(chartDate);
              if (!isNaN(d)) {
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, "0");
                const dd = String(d.getDate()).padStart(2, "0");
                out[section.key][field.name] = `${yyyy}-${mm}-${dd}`;
                return;
              }
            }
            break;
          }
          case "timeOfProcedure": {
            // Extract time portion from chartDate (HH:MM)
            if (chartDate) {
              const d = new Date(chartDate);
              if (!isNaN(d)) {
                const hh = String(d.getHours()).padStart(2, "0");
                const min = String(d.getMinutes()).padStart(2, "0");
                out[section.key][field.name] = `${hh}:${min}`;
                return;
              }
            }
            break;
          }
          case "patientName": {
            if (patient?.name) {
              out[section.key][field.name] = patient.name;
              return;
            }
            break;
          }
          case "sex": {
            // Patient model uses "gender" field
            const gender = patient?.gender || "";
            if (gender) {
              // Capitalize first letter to match select options (Male/Female/Other)
              out[section.key][field.name] =
                gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
              return;
            }
            break;
          }
          case "uhid": {
            // Prefill with IPD number from current admission
            if (admission?.Ipdnum) {
              out[section.key][field.name] = admission.Ipdnum;
              return;
            }
            break;
          }
          case "age": {
            // Prefill age from patient document
            if (patient?.age != null) {
              out[section.key][field.name] = String(patient.age);
              return;
            }
            break;
          }
          case "sessionNo": {
            // Advance the course counter rather than repeating it, but only when
            // the previous value is a clean integer. Anything else — blank, or
            // free text like "4 of 8" — is left for the doctor rather than
            // carried over verbatim or guessed at. Always returns, so this can
            // never fall through to the generic carry-forward below.
            const raw = previous?.sessionDetails?.sessionNo;
            const trimmed = typeof raw === "string" ? raw.trim() : raw;
            const previousNo = Number(trimmed);

            out[section.key][field.name] =
              trimmed !== "" &&
              trimmed != null &&
              Number.isInteger(previousNo) &&
              previousNo >= 0
                ? String(previousNo + 1)
                : "";
            return;
          }
          case "diagnosis": {
            // Prefill from provisional_diagnosis array on current admission
            if (admission?.provisional_diagnosis?.length > 0) {
              out[section.key][field.name] = admission.provisional_diagnosis
                .map((d) => d.code)
                .filter(Boolean)
                .join(", ");
              return;
            }
            break;
          }
          default:
            break;
        }
      }

      // Carry the previous session's value for anything not resolved above.
      if (hasCarried) {
        applyCarried();
        return;
      }

      // Default fallback
      out[section.key][field.name] =
        field.type === "checkbox" ? [] : "";
    });
  });
  return out;
};

const sectionsHaveValue = (values) =>
  ectSessionSections.some((section) =>
    Object.values(values[section.key] || {}).some((v) =>
      Array.isArray(v) ? v.length > 0 : String(v ?? "").trim() !== "",
    ),
  );

const EctSession = ({
  author,
  patient,
  chartDate,
  editChartData,
  type,
  patientLatestEctSession,
}) => {
  const dispatch = useDispatch();
  const editEct = editChartData?.ectSession;

  // Set by Undo — suppresses the carry-forward without discarding the fetched
  // snapshot, so nothing needs refetching if the form is reopened.
  const [prefillDismissed, setPrefillDismissed] = useState(false);

  const previousSession =
    !editEct && !prefillDismissed ? patientLatestEctSession?.ectSession : null;

  const isPrefilled = !!previousSession;

  // ECT is a course, so a new session almost always continues a previous one.
  // Prefill unconditionally on create, the way Mental Examination does.
  useEffect(() => {
    if (!editEct && patient?._id) {
      dispatch(
        fetchLastEctSession({
          id: patient._id,
          type: type === "IPD" ? "IPD" : "GENERAL",
        }),
      );
    }
  }, [editEct, patient?._id, type, dispatch]);

  // A new form should always start willing to prefill again.
  useEffect(() => {
    setPrefillDismissed(false);
  }, [editChartData, patient?._id]);

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      author: author?._id,
      patient: patient?._id,
      center: patient?.center?._id,
      addmission: patient?.addmission?._id || patient?.addmission || "",
      chart: ECT_SESSION,
      type,
      date: chartDate,
      ...buildInitialSections(editEct, patient, chartDate, previousSession),
    },
    onSubmit: (values) => {
      if (!sectionsHaveValue(values)) return; // don't save an empty record

      if (editEct) {
        dispatch(
          updateEctSession({
            id: editChartData._id,
            chartId: editEct._id,
            ...values,
          }),
        );
      } else if (type === "GENERAL") {
        dispatch(addGeneralEctSession(values));
      } else {
        dispatch(addEctSession(values));
      }

      // Drop the snapshot so it can't seed the next patient's form.
      dispatch(setPtLatestEctSession(null));
    },
  });

  useEffect(() => {
    if (!editChartData) validation.resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, editChartData]);

  const closeForm = () => {
    dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
    dispatch(setPtLatestEctSession(null));
    validation.resetForm();
  };

  const renderField = (sectionKey, field) => {
    const name = `${sectionKey}.${field.name}`;
    const value = validation.values[sectionKey]?.[field.name] ?? "";
    const label = `${field.label}${field.unit ? ` (${field.unit})` : ""}`;

    // Determine if this field should be read-only (prefilled & non-editable)
    const isReadOnly =
      sectionKey === "sessionDetails" && READONLY_FIELDS.has(field.name);

    // --- Date field using Flatpickr ---
    if (sectionKey === "sessionDetails" && field.name === "date") {
      return (
        <>
          <Label className="mb-1 fs-13 text-muted">{label}</Label>
          <Flatpickr
            name={name}
            value={value || ""}
            onChange={([selectedDate]) => {
              if (selectedDate) {
                const yyyy = selectedDate.getFullYear();
                const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
                const dd = String(selectedDate.getDate()).padStart(2, "0");
                validation.setFieldValue(name, `${yyyy}-${mm}-${dd}`);
              }
            }}
            options={{
              dateFormat: "Y-m-d",
              altInput: true,
              altFormat: "d M, Y",
            }}
            className="form-control form-control-sm"
          />
        </>
      );
    }

    // --- Time fields using Flatpickr (covers Time of Procedure, Transferred to Ward, etc.) ---
    if (field.type === "time") {
      return (
        <>
          <Label className="mb-1 fs-13 text-muted">{label}</Label>
          <Flatpickr
            name={name}
            value={value || ""}
            onChange={([selectedTime]) => {
              if (selectedTime) {
                const hh = String(selectedTime.getHours()).padStart(2, "0");
                const min = String(selectedTime.getMinutes()).padStart(2, "0");
                validation.setFieldValue(name, `${hh}:${min}`);
              }
            }}
            options={{
              enableTime: true,
              noCalendar: true,
              dateFormat: "H:i",
              altInput: true,
              altFormat: "h:i K",
              time_24hr: false,
            }}
            className="form-control form-control-sm"
          />
        </>
      );
    }

    if (field.type === "select") {
      return (
        <>
          <Label className="mb-1 fs-13 text-muted">{label}</Label>
          <Input
            type="select"
            name={name}
            value={value}
            onChange={validation.handleChange}
            bsSize="sm"
            disabled={isReadOnly}
          >
            <option value="">Select</option>
            {field.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </Input>
        </>
      );
    }

    if (field.type === "radio") {
      return (
        <>
          <Label className="mb-1 fs-13 text-muted d-block">{label}</Label>
          <div className="d-flex flex-wrap gap-3">
            {field.options.map((opt) => (
              <FormGroup check key={opt} className="mb-0">
                <Input
                  type="radio"
                  name={name}
                  id={`${name}-${opt}`}
                  checked={value === opt}
                  onChange={() => validation.setFieldValue(name, opt)}
                />
                <Label check for={`${name}-${opt}`} className="fs-13">
                  {opt}
                </Label>
              </FormGroup>
            ))}
          </div>
        </>
      );
    }

    if (field.type === "checkbox") {
      const arr = Array.isArray(value) ? value : [];
      const toggle = (opt) =>
        validation.setFieldValue(
          name,
          arr.includes(opt) ? arr.filter((o) => o !== opt) : [...arr, opt],
        );
      return (
        <>
          <Label className="mb-1 fs-13 text-muted d-block">{label}</Label>
          <div className="d-flex flex-wrap gap-3">
            {field.options.map((opt) => (
              <FormGroup check key={opt} className="mb-0">
                <Input
                  type="checkbox"
                  id={`${name}-${opt}`}
                  checked={arr.includes(opt)}
                  onChange={() => toggle(opt)}
                />
                <Label check for={`${name}-${opt}`} className="fs-13">
                  {opt}
                </Label>
              </FormGroup>
            ))}
          </div>
        </>
      );
    }

    if (field.type === "textarea") {
      return (
        <>
          <Label className="mb-1 fs-13 text-muted">{label}</Label>
          <Input
            type="textarea"
            name={name}
            value={value}
            onChange={validation.handleChange}
            rows={3}
          />
        </>
      );
    }

    // text (and any remaining types)
    return (
      <>
        <Label className="mb-1 fs-13 text-muted">{label}</Label>
        <Input
          type={field.type}
          name={name}
          value={value}
          onChange={validation.handleChange}
          bsSize="sm"
          disabled={isReadOnly}
          readOnly={isReadOnly}
        />
      </>
    );
  };

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        validation.handleSubmit();
        return false;
      }}
      className="needs-validation"
    >
      {isPrefilled && (
        <Alert color="info" className="py-2 small d-flex align-items-center gap-2">
          <i className="ri-file-copy-line" />
          <span className="flex-grow-1">
            Prefilled from the session on{" "}
            <strong>
              {formatSourceDate(
                patientLatestEctSession?.date ||
                  patientLatestEctSession?.createdAt,
              ) || "the previous record"}
            </strong>{" "}
            — review each value before saving.
          </span>
          <Button
            type="button"
            color="info"
            outline
            size="sm"
            onClick={() => setPrefillDismissed(true)}
          >
            Undo
          </Button>
        </Alert>
      )}

      {ectSessionSections.map((section) => (
        <div key={section.key} className="mb-4">
          <h6 className="fs-14 fw-semibold text-primary border-bottom pb-2 mb-3">
            {section.title}
          </h6>
          <Row className="gy-2">
            {section.fields.map((field) => {
              const wide =
                field.type === "textarea" ||
                field.type === "checkbox" ||
                field.type === "radio";
              return (
                <Col
                  xs={12}
                  md={wide ? 12 : 6}
                  lg={wide ? 12 : 4}
                  key={field.name}
                >
                  {renderField(section.key, field)}
                </Col>
              );
            })}
          </Row>
        </div>
      ))}

      <div className="d-flex gap-2 justify-content-end mt-3">
        <Button type="button" color="danger" size="sm" onClick={closeForm}>
          Cancel
        </Button>
        <Button type="submit" size="sm" color="primary">
          Save
        </Button>
      </div>
    </Form>
  );
};

EctSession.propTypes = {
  author: PropTypes.object,
  patient: PropTypes.object,
  chartDate: PropTypes.any,
  editChartData: PropTypes.object,
  type: PropTypes.string,
  patientLatestEctSession: PropTypes.object,
};

const mapStateToProps = (state) => ({
  patient: state.Patient.patient,
  author: state.User.user,
  chartDate: state.Chart.chartDate,
  editChartData: state.Chart.chartForm?.data,
  patientLatestEctSession: state.Chart.patientLatestEctSession,
});

export default connect(mapStateToProps)(EctSession);
