import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Form, Row, Col, Input, Button, Label, FormGroup } from "reactstrap";
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
} from "../../../store/actions";

// Fields that should be prefilled from patient data and made non-editable
const READONLY_FIELDS = new Set(["patientName", "sex"]);
// Fields that are prefilled from admission/chartDate but remain editable
const PREFILL_FIELDS = new Set(["date", "timeOfProcedure", "uhid", "diagnosis"]);

// Build Formik initial values for the grouped sections, seeding from a saved
// ECT session when editing. Checkbox groups default to arrays, everything else
// to empty strings.
const buildInitialSections = (source, patient, chartDate) => {
  const out = {};
  const admission = patient?.addmission;

  ectSessionSections.forEach((section) => {
    out[section.key] = {};
    section.fields.forEach((field) => {
      const existing = source?.[section.key]?.[field.name];

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
            out[section.key][field.name] = patient?.name || "";
            return;
          }
          case "sex": {
            // Patient model uses "gender" field
            const gender = patient?.gender || "";
            // Capitalize first letter to match select options (Male/Female/Other)
            out[section.key][field.name] =
              gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
            return;
          }
          case "uhid": {
            // Prefill with IPD number from current admission
            out[section.key][field.name] = admission?.Ipdnum || "";
            return;
          }
          case "age": {
            // Prefill age from patient document
            out[section.key][field.name] =
              patient?.age != null ? String(patient.age) : "";
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

const EctSession = ({ author, patient, chartDate, editChartData, type }) => {
  const dispatch = useDispatch();
  const editEct = editChartData?.ectSession;

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
      ...buildInitialSections(editEct, patient, chartDate),
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
    },
  });

  useEffect(() => {
    if (!editChartData) validation.resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, editChartData]);

  const closeForm = () => {
    dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
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
};

const mapStateToProps = (state) => ({
  patient: state.Patient.patient,
  author: state.User.user,
  chartDate: state.Chart.chartDate,
  editChartData: state.Chart.chartForm?.data,
});

export default connect(mapStateToProps)(EctSession);
