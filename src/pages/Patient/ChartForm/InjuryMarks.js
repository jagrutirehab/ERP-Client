import React, { useEffect, useState } from "react";
import { Form, Row, Col, Label, Input, Button } from "reactstrap";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

//constant
import { INJURY_MARKS } from "../../../Components/constants/patient";

//redux
import { connect, useDispatch } from "react-redux";
import {
  addGeneralInjuryMarks,
  addInjuryMarks,
  createEditChart,
  updateInjuryMarks,
} from "../../../store/actions";
import InjuryMarksUploadedFiles from "./Components/InjuryMarksUploadedFiles";

const emptyMark = { description: "", photo: null };

const InjuryMarks = ({ author, patient, chartDate, editChartData, type }) => {
  const dispatch = useDispatch();

  const editInjuryMarks = editChartData?.injuryMarks;

  const [marks, setMarks] = useState([{ ...emptyMark }]);
  const [existingDescriptions, setExistingDescriptions] = useState([]);

  useEffect(() => {
    if (editInjuryMarks?.marks?.length > 0) {
      setExistingDescriptions(
        editInjuryMarks.marks.map((m) => m.description || "")
      );
      // When editing, start with no new rows; nurse can add more if needed
      setMarks([]);
    } else {
      setMarks([{ ...emptyMark }]);
      setExistingDescriptions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editChartData]);

  const addMark = () => setMarks((prev) => [...prev, { ...emptyMark }]);

  const removeMark = (idx) =>
    setMarks((prev) => prev.filter((_, i) => i !== idx));

  const updateMark = (idx, key, value) => {
    setMarks((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });
  };

  const closeForm = () => {
    dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
    setMarks([{ ...emptyMark }]);
    setExistingDescriptions([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Description and Photo are both mandatory for every new injury mark
    for (const mark of marks) {
      if (!mark.photo || !mark.description?.trim()) {
        toast.error("Description and Photo are required for each injury mark");
        return;
      }
    }

    // On create at least one mark is required
    if (!editInjuryMarks && marks.length === 0) {
      toast.error("Please add at least one injury mark");
      return;
    }

    const formData = new FormData();
    formData.append("author", author._id);
    formData.append("patient", patient._id);
    formData.append("center", patient.center._id);
    formData.append("addmission", patient.addmission?._id);
    formData.append("chart", INJURY_MARKS);
    formData.append("type", type);
    formData.append("date", chartDate);

    (marks || []).forEach((mark) => {
      formData.append("photo", mark.photo);
      formData.append("description", mark.description);
    });

    if (editInjuryMarks) {
      formData.append("id", editChartData._id);
      formData.append("chartId", editInjuryMarks._id);
      existingDescriptions.forEach((desc, idx) => {
        formData.append("existingMarkId", editInjuryMarks.marks[idx]._id);
        formData.append("existingMarkDescription", desc);
      });
      dispatch(updateInjuryMarks(formData));
    } else if (type === "GENERAL") {
      dispatch(addGeneralInjuryMarks(formData));
    } else {
      dispatch(addInjuryMarks(formData));
    }
  };

  return (
    <React.Fragment>
      <div>
        <Form onSubmit={handleSubmit} className="needs-validation" action="#">
          <Row className="align-items-end row-gap-3">
            {/* Existing marks (edit mode) */}
            {editInjuryMarks?.marks?.length > 0 && (
              <Col xs={12} className="mt-2 mb-3">
                <InjuryMarksUploadedFiles
                  id={editChartData._id}
                  chartId={editInjuryMarks._id}
                  marks={editInjuryMarks.marks}
                />
                {editInjuryMarks.marks.map((mark, idx) => (
                  <Col xs={12} key={mark._id} className="mt-2">
                    <Label>Description (Photo {idx + 1})</Label>
                    <Input
                      type="textarea"
                      bsSize="sm"
                      className="form-control rounded"
                      value={existingDescriptions[idx] || ""}
                      onChange={(e) => {
                        const updated = [...existingDescriptions];
                        updated[idx] = e.target.value;
                        setExistingDescriptions(updated);
                      }}
                    />
                  </Col>
                ))}
              </Col>
            )}

            {/* New marks */}
            {(marks || []).map((mark, idx) => (
              <React.Fragment key={idx}>
                <Col xs={12}>
                  <div className="d-flex justify-content-between align-items-center">
                    <Label className="mb-0">Injury Mark {idx + 1}</Label>
                    <Button
                      type="button"
                      size="sm"
                      color="danger"
                      outline
                      onClick={() => removeMark(idx)}
                    >
                      Remove
                    </Button>
                  </div>
                </Col>
                <Col xs={12} md={6}>
                  <Label>
                    Description<span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="textarea"
                    bsSize="sm"
                    name="description"
                    required
                    rows={3}
                    value={mark.description || ""}
                    onChange={(e) =>
                      updateMark(idx, "description", e.target.value)
                    }
                    className="form-control rounded"
                  />
                </Col>
                <Col xs={12} md={6}>
                  <Label>
                    Photo<span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="file"
                    bsSize="sm"
                    name="photo"
                    accept="image/*"
                    required
                    onChange={(e) =>
                      updateMark(idx, "photo", e.target.files[0] || null)
                    }
                    className="form-control rounded"
                  />
                  {mark.photo && (
                    <img
                      src={URL.createObjectURL(mark.photo)}
                      alt="injury mark preview"
                      className="mt-2 rounded border"
                      style={{
                        maxHeight: "120px",
                        maxWidth: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </Col>
                <Col xs={12}>
                  <hr className="my-2" />
                </Col>
              </React.Fragment>
            ))}

            <Col xs={12}>
              <Button onClick={addMark} type="button" color="secondary" size="sm">
                Add Injury
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
          </Row>
        </Form>
      </div>
    </React.Fragment>
  );
};

InjuryMarks.propTypes = {
  author: PropTypes.object.isRequired,
  patient: PropTypes.object.isRequired,
  chartDate: PropTypes.any,
  editChartData: PropTypes.object,
  type: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  author: state.User.user,
  patient: state.Patient.patient,
  chartDate: state.Chart.chartDate,
  editChartData: state.Chart.chartForm?.data,
});

export default connect(mapStateToProps)(InjuryMarks);
