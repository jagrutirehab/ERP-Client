import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { Button, Col, FormFeedback, Input, Label } from "reactstrap";
import { getInternIds } from "../../../store/features/intern/internSlice";

const InternId = ({ validation, editData }) => {
  const [enable, setEnable] = useState(true);
  const dispatch = useDispatch();
  const internData = useSelector((state) => state.Intern.internId);

  useEffect(() => {
    if (!editData) {
      dispatch(getInternIds());
    }
  }, [dispatch, editData]);

  useEffect(() => {
    if (
      editData?.id?.prefix &&
      editData?.id?.value &&
      validation.values.InternId !== `${editData.id.prefix}${editData.id.value}`
    ) {
      validation.setFieldValue(
        "InternId",
        `${editData.id.prefix}${editData.id.value}`
      );
    }
    if (!editData && internData && !validation.values.InternId) {
      validation.setFieldValue("InternId", internData);
    }
  }, [editData, internData, validation]);

  return (
    <Col xs={12} md={4}>
      <div className="mb-3">
        <Label htmlFor="intern-id" className="form-label">
          Intern ID <span className="text-danger">*</span>
        </Label>
        <div className="d-flex gap-3">
          <Input
            type="text"
            name="InternId"
            id="intern-id"
            bsSize="sm"
            disabled={editData || enable}
            onChange={(e) =>
              validation.setFieldValue("InternId", e.target.value.toUpperCase())
            }
            onBlur={validation.handleBlur}
            value={validation.values.InternId || ""}
            invalid={
              validation.touched.InternId && !!validation.errors.InternId
            }
            placeholder=""
            className="form-control"
          />
          {!editData && (
            <Button
              size="sm"
              outline
              color="success"
              onClick={() => setEnable(false)}
            >
              Edit
            </Button>
          )}
        </div>
        {validation.touched.InternId && validation.errors.InternId && (
          <FormFeedback>{validation.errors.InternId}</FormFeedback>
        )}
      </div>
    </Col>
  );
};

InternId.propTypes = {
  validation: PropTypes.object.isRequired,
  editData: PropTypes.any,
};

export default InternId;
