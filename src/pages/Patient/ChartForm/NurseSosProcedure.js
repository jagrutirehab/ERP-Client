import React, { useEffect, useState } from "react";
import { Form, Row, Col, Label, Input, Button } from "reactstrap";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

//constant
import {
  NURSE_SOS_PROCEDURE,
  nurseSosActivityTypes,
} from "../../../Components/constants/patient";

//redux
import { connect, useDispatch } from "react-redux";
import {
  addGeneralNurseSosProcedure,
  addNurseSosProcedure,
  createEditChart,
  updateNurseSosProcedure,
} from "../../../store/actions";

const emptyRow = { activityType: "", description: "" };

// Reads both the new multi-row shape and legacy single-entry records
const normalizeRows = (data) => {
  if (data?.rows?.length) {
    return data.rows.map((r) => ({
      activityType: r.activityType || "",
      description: r.description || "",
    }));
  }
  if (data?.activityType || data?.description) {
    return [
      {
        activityType: data.activityType || "",
        description: data.description || "",
      },
    ];
  }
  return [{ ...emptyRow }];
};

const NurseSosProcedure = ({
  author,
  patient,
  chartDate,
  editChartData,
  type,
}) => {
  const dispatch = useDispatch();

  const editNurseSos = editChartData?.nurseSosProcedure;
  const [rows, setRows] = useState([{ ...emptyRow }]);

  useEffect(() => {
    if (editNurseSos) {
      setRows(normalizeRows(editNurseSos));
    } else {
      setRows([{ ...emptyRow }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editChartData]);

  const updateRow = (idx, name, value) => {
    setRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [name]: value };
      return next;
    });
  };

  const addRow = () => setRows((prev) => [...prev, { ...emptyRow }]);

  const removeRow = (idx) =>
    setRows((prev) =>
      prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)
    );

  const closeForm = () => {
    dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
    setRows([{ ...emptyRow }]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Keep rows that have an activity type; description stays optional
    const cleanedRows = rows.filter((r) => r.activityType);
    if (!cleanedRows.length) {
      toast.error("Please select an activity type for at least one row");
      return;
    }

    const base = {
      author: author._id,
      patient: patient._id,
      center: patient.center._id,
      addmission: patient.addmission?._id,
      chart: NURSE_SOS_PROCEDURE,
      type,
      date: chartDate,
      rows: cleanedRows,
    };

    if (editNurseSos) {
      dispatch(
        updateNurseSosProcedure({
          id: editChartData._id,
          chartId: editNurseSos._id,
          ...base,
        })
      );
    } else if (type === "GENERAL") {
      dispatch(addGeneralNurseSosProcedure(base));
    } else {
      dispatch(addNurseSosProcedure(base));
    }
  };

  return (
    <React.Fragment>
      <div>
        <Form onSubmit={handleSubmit} className="needs-validation" action="#">
          {(rows || []).map((row, idx) => (
            <Row
              key={idx}
              className="align-items-start g-2 mb-3 pb-3 border-bottom"
            >
              <Col xs={12} md={5}>
                <Label className="mb-1">
                  Activity Type<span className="text-danger">*</span>
                </Label>
                <Input
                  type="select"
                  bsSize="sm"
                  value={row.activityType || ""}
                  onChange={(e) =>
                    updateRow(idx, "activityType", e.target.value)
                  }
                  className="form-control"
                >
                  <option value="">Select activity type</option>
                  {(nurseSosActivityTypes || []).map((activity) => (
                    <option key={activity} value={activity}>
                      {activity}
                    </option>
                  ))}
                </Input>
              </Col>
              <Col xs={12} md={6}>
                <Label className="mb-1">Description</Label>
                <Input
                  type="textarea"
                  bsSize="sm"
                  rows={1}
                  value={row.description || ""}
                  onChange={(e) =>
                    updateRow(idx, "description", e.target.value)
                  }
                  className="form-control"
                  placeholder="Enter description"
                />
              </Col>
              <Col xs={12} md="auto" className="ms-auto">
                <Label className="mb-1 d-none d-md-block">&nbsp;</Label>
                <div>
                  <Button
                    type="button"
                    size="sm"
                    color="danger"
                    outline
                    disabled={rows.length === 1}
                    onClick={() => removeRow(idx)}
                  >
                    Remove
                  </Button>
                </div>
              </Col>
            </Row>
          ))}

          <Col xs={12}>
            <Button onClick={addRow} type="button" color="secondary" size="sm">
              Add Row
            </Button>
          </Col>

          <div className="mt-3">
            <div className="d-flex gap-3 justify-content-end">
              <Button
                onClick={closeForm}
                size="sm"
                color="danger"
                type="button"
                className="text-white"
              >
                Cancel
              </Button>
              <Button size="sm" type="submit">
                Save
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </React.Fragment>
  );
};

NurseSosProcedure.propTypes = {
  patient: PropTypes.object,
  author: PropTypes.object,
  chartDate: PropTypes.any,
  editChartData: PropTypes.object,
  type: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  patient: state.Patient.patient,
  author: state.User.user,
  chartDate: state.Chart.chartDate,
  editChartData: state.Chart.chartForm?.data,
});

export default connect(mapStateToProps)(NurseSosProcedure);
