import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";
import _ from "lodash";

//flatpicker
import Flatpicker from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";

//modal
import CustomModal from "../../Components/Common/Modal";

import { Button, Col, Form, FormFeedback, Input, Label, Row } from "reactstrap";
import { leadFields } from "../../Components/constants/lead";

//redux
import { connect, useDispatch } from "react-redux";
import { addLead, createEditLead, updateLead } from "../../store/actions";

const LeadForm = ({ user, isOpen, lead, centers, centerAccess, date }) => {
  const dispatch = useDispatch();
  const [followUp, setFollowUp] = useState(
    lead?.followUp?.length ? lead.followUp : []
  );

  useEffect(() => {
    if (lead?.followUp?.length) {
      setFollowUp(_.cloneDeep(lead.followUp));
    }
  }, [lead]);

  //left fields = type of inquiry, updates given, follow up

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      author: user ? user._id : "",
      patientName: lead ? lead.patient?.name : "",
      patientPhoneNumber: lead ? lead.patient?.phoneNumber : "",
      patientGender: lead ? lead.patient?.gender : "",
      patientAge: lead ? lead.patient?.age : "",
      attendedBy: lead ? lead.attendedBy : user ? user.name : "",
      location: Array.isArray(lead?.location)
        ? lead.location?.map((ld) => ld._id)
        : [],
      visitorName: lead ? lead.visitorName : "",
      relationWithPatient: lead ? lead.relationWithPatient : "",
      charges: lead ? lead.charges : "",
      refferedBy: lead ? lead.refferedBy : "",
      inquiry: lead ? lead.inquiry : "",
      comment: lead ? lead.comment : "",
      inquiryType: lead ? lead.inquiryType : "",
      givenUpdates: lead ? lead.givenUpdates : "",
      date: lead ? lead.date : "",
    },
    validationSchema: Yup.object({
      patientName: Yup.string().required("Please Enter Patient Name"),
      patientPhoneNumber: Yup.string().required(
        "Please Enter Patient Phone Number"
      ),
      patientGender: Yup.string().required("Please Select Patient Gender"),
      patientAge: Yup.number().required("Please Enter Patient Age"),
      attendedBy: Yup.string().required("Please Enter Attendend Name"),
      location: Yup.array().test(
        "notEmpty",
        "Location is required",
        (value) => {
          if (!value || value.length === 0) {
            return false;
          }
          return true;
        }
      ),
      inquiry: Yup.string().required("Please Enter Inquiry"),
      // inquiryType: Yup.string().required("Please Enter Inquiry Type"),
      // givenUpdates: Yup.string().required("Please Enter Given Updates"),
      // followUp: Yup.string().required("Please Enter Follow Up"),
      // comment: Yup.string().required("Please Enter Comment"),
      // date: Yup.string().required("Please Select Date"),
    }),
    onSubmit: (values) => {
      if (lead)
        dispatch(
          updateLead({
            ...values,
            followUp: followUp.filter((fl) => (fl.value ? true : false)),
            id: lead._id,
            centerAccess,
            ...date,
          })
        );
      else
        dispatch(
          addLead({
            ...values,
            followUp: followUp.filter((fl) => (fl.value ? true : false)),
            centerAccess,
            ...date,
          })
        );
      closeForm();
    },
  });

  const closeForm = () => {
    validation.resetForm();
    setFollowUp([]);
    dispatch(createEditLead({ isOpen: false, data: null }));
  };

  return (
    <React.Fragment>
      <CustomModal centered isOpen={isOpen} size={"xl"} title={"Add Lead"}>
        <div>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              validation.handleSubmit();
              return false;
            }}
            action="#"
          >
            <Row>
              {(leadFields(lead?.isRegister) || []).map((field, i) => (
                <Col key={i + field} xs={12} lg={6}>
                  <div className="mb-3">
                    <Label htmlFor={field} className="form-label">
                      {field.label}
                    </Label>
                    {field.type === "radio" ? (
                      <>
                        <div className="d-flex flex-wrap">
                          {(field.options || []).map((item, idx) => (
                            <React.Fragment key={item + idx}>
                              <div
                                key={item + idx}
                                className="d-flex me-5 align-items-center"
                              >
                                <Input
                                  className="me-2 mt-0"
                                  type={field.type}
                                  name={field.name}
                                  value={item}
                                  onChange={validation.handleChange}
                                  checked={
                                    validation.values[field.name] === item
                                  }
                                />
                                <Label className="form-label fs-14 mb-0">
                                  {item}
                                </Label>
                              </div>
                            </React.Fragment>
                          ))}
                          {validation.touched[field.name] &&
                          validation.errors[field.name] ? (
                            <FormFeedback type="invalid" className="d-block">
                              {validation.errors[field.name]}
                            </FormFeedback>
                          ) : null}
                        </div>
                      </>
                    ) : field.type === "checkbox" ? (
                      <>
                        <div className="d-flex flex-wrap">
                          {(centers || []).map((item, idx) => (
                            <>
                              <div
                                key={item[field.value]}
                                className="d-flex me-5 align-items-center"
                              >
                                <Input
                                  className="me-2 mt-0"
                                  type={field.type}
                                  name={field.name}
                                  value={item?._id}
                                  onChange={validation.handleChange}
                                  checked={validation.values[
                                    field.name
                                  ]?.includes(item?._id)}
                                />
                                <Label className="form-label fs-9 mb-0">
                                  {item.title || item.label}
                                </Label>
                              </div>
                            </>
                          ))}
                          {validation.touched[field.name] &&
                          validation.errors[field.name] ? (
                            <FormFeedback type="invalid" className="d-block">
                              {validation.errors[field.name]}
                            </FormFeedback>
                          ) : null}
                        </div>
                      </>
                    ) : (
                      <>
                        <Input
                          name={field.name}
                          className="form-control"
                          placeholder={`Enter ${field.label}`}
                          type={field.type}
                          disabled={field.disabled}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values[field.name] || ""}
                          invalid={
                            validation.touched[field.name] &&
                            validation.errors[field.name]
                              ? true
                              : false
                          }
                        />
                        {validation.touched[field.name] &&
                        validation.errors[field.name] ? (
                          <FormFeedback type="invalid">
                            {validation.errors[field.name]}
                          </FormFeedback>
                        ) : null}
                      </>
                    )}
                  </div>
                </Col>
              ))}
              <Col xs={12} lg={6}>
                <div className="mb-3">
                  <Label htmlFor="date" className="form-label">
                    Date
                  </Label>
                  <Flatpicker
                    name="date"
                    value={validation.values.date || new Date()}
                    onChange={([e]) => {
                      const event = { target: { value: e, name: "date" } };
                      validation.handleChange(event);
                    }}
                    options={{
                      dateFormat: "d M Y G:i:S K",
                      enableTime: true,
                      time_24hr: false,
                      disableMobile: true,
                    }}
                    className="form-control shadow-none bg-light"
                    id="date"
                  />
                  {validation.touched.date && validation.errors.date ? (
                    <FormFeedback className="d-block" type="invalid">
                      {validation.errors.date}
                    </FormFeedback>
                  ) : null}
                </div>
              </Col>
              <Col xs={12}>
                <div>
                  <Label>Follow Up</Label>
                  <div className="">
                    {(followUp || []).map((fl, idx) => (
                      <div className="d-flex gap-3 align-items-center mb-3">
                        <Input
                          className="w-50"
                          key={idx}
                          type="textarea"
                          placeholder={`Follow up ${idx + 1}`}
                          onChange={(e) => {
                            let fls = [...followUp];
                            fls[idx].value = e.target.value;
                            setFollowUp(fls);
                          }}
                          value={fl.value}
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            let fls = [...followUp];
                            fls = fls.filter((fl, id) => id !== idx);
                            setFollowUp(fls);
                          }}
                          size="sm"
                          color="danger"
                          outline
                        >
                          <i className="ri-close-circle-line fs-6"></i>
                        </Button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setFollowUp([...followUp, { value: "" }])}
                      className="btn btn-sm btn-secondary"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </Col>
              <Col xs={12}>
                <div className="d-flex align-items-center justify-content-end gap-3">
                  <Button type="submit" size="sm" color="primary" outline>
                    Save
                  </Button>
                  <Button onClick={closeForm} size="sm" color="danger">
                    Cancel
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </div>
      </CustomModal>
    </React.Fragment>
  );
};

LeadForm.propTypes = {
  user: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  lead: PropTypes.object,
  centers: PropTypes.array,
};

const mapStateToProps = (state) => ({
  user: state.User.user,
  isOpen: state.Lead.createEditLead?.isOpen,
  lead: state.Lead.createEditLead?.data,
  centers: state.Center.allCenters,
  centerAccess: state.User?.centerAccess,
});

export default connect(mapStateToProps)(LeadForm);
