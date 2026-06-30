import React, { useEffect, useState } from "react";
import { Form, Row, Col, Label, Input, Button } from "reactstrap";
import PropTypes from "prop-types";

//constant
import {
  INPUT_OUTPUT,
  inputOutputColumns,
} from "../../../Components/constants/patient";

//redux
import { connect, useDispatch } from "react-redux";
import {
  addGeneralInputOutput,
  addInputOutput,
  createEditChart,
  updateInputOutput,
} from "../../../store/actions";

const emptyRow = { intake: "", output: "", ivFluid: "", remark: "" };

const InputOutput = ({ author, patient, chartDate, editChartData, type }) => {
  const dispatch = useDispatch();

  const editInputOutput = editChartData?.inputOutput;
  const [rows, setRows] = useState([{ ...emptyRow }]);

  useEffect(() => {
    if (editInputOutput?.rows?.length) {
      setRows(
        editInputOutput.rows.map((r) => ({
          intake: r.intake || "",
          output: r.output || "",
          ivFluid: r.ivFluid || "",
          remark: r.remark || "",
        }))
      );
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

    const cleanedRows = rows.filter(
      (r) => r.intake || r.output || r.ivFluid || r.remark
    );
    if (!cleanedRows.length) return;

    const base = {
      author: author._id,
      patient: patient._id,
      center: patient.center._id,
      addmission: patient.addmission?._id,
      chart: INPUT_OUTPUT,
      type,
      date: chartDate,
      rows: cleanedRows,
    };

    if (editInputOutput) {
      dispatch(
        updateInputOutput({
          id: editChartData._id,
          chartId: editInputOutput._id,
          ...base,
        })
      );
    } else if (type === "GENERAL") {
      dispatch(addGeneralInputOutput(base));
    } else {
      dispatch(addInputOutput(base));
    }
  };

  return (
    <React.Fragment>
      <div>
        <Form onSubmit={handleSubmit} className="needs-validation" action="#">
          {(rows || []).map((row, idx) => (
            <Row
              key={idx}
              className="align-items-end g-2 mb-3 pb-3 border-bottom"
            >
              {(inputOutputColumns || []).map((col) => (
                <Col
                  key={col.name}
                  xs={12}
                  md={col.name === "remark" ? 12 : 4}
                  lg={col.name === "remark" ? 4 : 2}
                >
                  <Label className="mb-1">{col.label}</Label>
                  <Input
                    type={col.name === "remark" ? "textarea" : "text"}
                    bsSize="sm"
                    name={col.name}
                    rows={col.name === "remark" ? 1 : undefined}
                    value={row[col.name] || ""}
                    onChange={(e) => updateRow(idx, col.name, e.target.value)}
                    className="form-control"
                    placeholder={col.label}
                  />
                </Col>
              ))}
              <Col xs={12} md="auto" className="ms-auto">
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

InputOutput.propTypes = {
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

export default connect(mapStateToProps)(InputOutput);
