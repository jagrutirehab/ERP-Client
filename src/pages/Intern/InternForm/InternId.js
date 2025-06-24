import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux"; // <-- this is correct

import PropTypes from "prop-types";
import { Button, Col, FormFeedback, Input, Label } from "reactstrap";
import { getInternIds } from "../../../store/features/intern/internSlice";
const InternId = ({ validation, editData }) => {
  const [enable, setEnable] = useState(true);
  const dispatch = useDispatch();
  const internData = useSelector((state) => state.Intern.internId);
  //  useEffect(() => {
  //   if (!validation.values.id && internData) {
  //     validation.setFieldValue("id", internData);
  //   }
  // }, [internData, validation]);
  useEffect(() => {
    dispatch(getInternIds());
  }, []);
useEffect(() => {
  // If edit mode is ON and we have editData.InternId, set it
  if (editData?.InternId && validation.values.InternId !== editData.InternId) {
    validation.setFieldValue("InternId", editData.InternId);
  }

  // For non-edit mode, populate with fetched internData
  if (!editData && internData && !validation.values.InternId) {
    validation.setFieldValue("InternId", internData);
  }
}, [internData, editData]);



  return (
    <React.Fragment>
      <Col xs={12} md={4}>
        <div className="mb-3">
          <Label htmlFor="aadhaar-card" className="form-label">
            Intern Id
            <span className="text-danger">*</span>
          </Label>
          <div className="d-flex gap-3">
            <Input
              type="text"
              name="InternId"
              bsSize="sm"
              disabled={editData || enable}
              onChange={(e) =>
                validation.setFieldValue(
                  "InternId",
                  e.target.value.toUpperCase()
                )
              }
              onBlur={validation.handleBlur}
              value={validation.values.InternId || ""}

              autoCapitalize
              invalid={
                validation.touched.InternId && validation.errors.InternId
                  ? true
                  : false
              }
              className="form-control"
              placeholder=""
              id="aadhaar-card"
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
        {validation.touched.InternId && validation.errors.InternId ? (
  <FormFeedback type="invalid">
    <div>{validation.errors.InternId}</div>
  </FormFeedback>
) : null}

        </div>
      </Col>
    </React.Fragment>
  );
};

InternId.propTypes = {
  validation: PropTypes.object.isRequired,
  editData: PropTypes.any,
};
export default InternId;
