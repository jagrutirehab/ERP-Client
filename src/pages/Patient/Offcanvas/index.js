import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Label,
  Offcanvas as PatientOffCanvas,
  OffcanvasBody,
  Row,
  UncontrolledDropdown,
  Button,
  UncontrolledPopover,
  PopoverHeader,
  PopoverBody,
} from "reactstrap";
import { Link } from "react-router-dom";
import DeleteModal from "../../../Components/Common/DeleteModal";

import smallImage9 from "../../../assets/images/small/img-9.jpg";
import { connect, useDispatch } from "react-redux";
import { undischargePatient, viewProfile } from "../../../store/actions";
import { format } from "date-fns";

const Offcanvas = ({ admissions, profile }) => {
  const dispatch = useDispatch();
  const [modal, setModal] = useState({
    id: "",
    open: false,
  });

  const toggleOffCanvas = () => {
    dispatch(viewProfile({ data: null, isOpen: false }));
  };

  const patient = profile?.data;

  const admission = (admissions || []).find(
    (admission) => admission._id === patient?.addmission._id
  );

  return (
    <React.Fragment>
      <PatientOffCanvas
        isOpen={profile?.isOpen ?? false}
        direction="end"
        toggle={toggleOffCanvas}
        className="offcanvas-end border-0"
        tabIndex="-1"
      >
        <OffcanvasBody className="profile-offcanvas p-0">
          <div className="team-cover">
            <img src={smallImage9} alt="" className="img-fluid" />
          </div>
          <div className="p-3">
            <div className="team-settings">
              <Row>
                <Col>
                  <div className="bookmark-icon flex-shrink-0 me-2">
                    <Input
                      type="checkbox"
                      id="favourite13"
                      className="bookmark-input bookmark-hide"
                    />
                    <Label htmlFor="favourite13" className="btn-star">
                      <svg width="20" height="20">
                        {/* <use xlink:href="#icon-star"/> */}
                      </svg>
                    </Label>
                  </div>
                </Col>
                <UncontrolledDropdown
                  direction="start"
                  className="col text-end"
                >
                  <DropdownToggle tag="a" id="dropdownMenuLink14" role="button">
                    <i className="ri-more-fill fs-17"></i>
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem
                      onClick={() => setModal({ id: patient._id, open: true })}
                    >
                      <i className="ri-eye-line me-2 align-middle" />
                      Un-discharge
                    </DropdownItem>
                    <DropdownItem>
                      <i className="ri-star-line me-2 align-middle" />
                      Favorites
                    </DropdownItem>
                    <DropdownItem>
                      <i className="ri-delete-bin-5-line me-2 align-middle" />
                      Delete
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </Row>
            </div>
          </div>
          <DeleteModal
            show={modal.open}
            messsage={"You want to un-discharge this patient ?"}
            buttonMessage={"Yes"}
            onCloseClick={() => setModal({ id: "", open: false })}
            onDeleteClick={() => {
              dispatch(undischargePatient({ patientId: patient._id }));
              setModal({ id: "", open: false });
            }}
          />
          <div className="p-3 text-center">
            <img
              src={patient?.profilePicture?.url}
              alt=""
              className="avatar-lg img-thumbnail rounded-circle mx-auto"
            />
            <div className="mt-3">
              <h5 className="fs-15">
                <Link to="#" className="link-primary">
                  {patient?.name}
                  <span className="ms-2 text-muted fs-14">
                    ({`${patient?.id?.prefix}${patient?.id?.value}`})
                  </span>
                </Link>
              </h5>
              {/* <p className="text-muted">Team Leader & HR</p> */}
            </div>
            {/* <div className="hstack gap-2 justify-content-center mt-4">
              <div className="avatar-xs">
                <Link
                  to="#"
                  className="avatar-title bg-soft-secondary text-secondary rounded fs-16"
                >
                  <i className="ri-facebook-fill"></i>
                </Link>
              </div>
              <div className="avatar-xs">
                <Link
                  to="#"
                  className="avatar-title bg-soft-success text-success rounded fs-16"
                >
                  <i className="ri-slack-fill"></i>
                </Link>
              </div>
              <div className="avatar-xs">
                <Link
                  to="#"
                  className="avatar-title bg-soft-info text-info rounded fs-16"
                >
                  <i className="ri-linkedin-fill"></i>
                </Link>
              </div>
              <div className="avatar-xs">
                <Link
                  to="#"
                  className="avatar-title bg-soft-danger text-danger rounded fs-16"
                >
                  <i className="ri-dribbble-fill"></i>
                </Link>
              </div>
            </div> */}
          </div>
          {/* <Row className="g-0 text-center">
            <Col xs={6}>
              <div className="p-3 border border-dashed border-start-0">
                <h5 className="mb-1">124</h5>
                <p className="text-muted mb-0">Projects</p>
              </div>
            </Col>
            <Col xs={6}>
              <div className="p-3 border border-dashed border-start-0">
                <h5 className="mb-1">81</h5>
                <p className="text-muted mb-0">Tasks</p>
              </div>
            </Col>
          </Row> */}
          <div className="p-3">
            <h5 className="fs-15 mb-3">Personal Details</h5>
            <div className="mb-3">
              <p className="text-muted text-uppercase fw-semibold fs-12 mb-2">
                Current Doctor
              </p>
              <div className="d-flex justify-content-between">
                <h6>{admission?.doctor?.name}</h6>
                {/* <time>
                  Assigned At{" "}
                  {patient.doctor.assignedAt &&
                    format(new Date(patient.doctor.assignedAt), "dd MMM yyyy")}
                </time> */}
              </div>
              <h6 className="ps-2 text-primary">Tree:</h6>
              {(admission?.doctors || []).map((d, i) => (
                <div
                  key={i}
                  className="ps-4 d-flex align-items-center justify-content-between border-bottom border-primary py-2"
                >
                  <h6 className="fs-14 text-primary">{d.doctor?.name}</h6>
                  <div className="d-flex flex-column">
                    <time>
                      Assigned At{" "}
                      <span className="fw-bold">
                        {d.assignedAt &&
                          format(new Date(d.assignedAt), "dd MMM yyyy hh:mm a")}
                      </span>
                    </time>
                    <time>
                      {d.revokedAt && (
                        <>
                          Revoked At{" "}
                          <span className="fw-bold">
                            {format(
                              new Date(d.revokedAt),
                              "dd MMM yyyy hh:mm a"
                            )}
                          </span>
                        </>
                      )}
                    </time>
                  </div>
                </div>
              ))}
            </div>
            <div className="mb-3">
              <p className="text-muted text-uppercase fw-semibold fs-12 mb-2">
                Current Psychologist
              </p>
              <div className="d-flex justify-content-between">
                <h6>{admission?.psychologist?.name}</h6>
                {/* <time>
                  Assigned At{" "}
                  {patient.psychologist.assignedAt &&
                    format(
                      new Date(patient.psychologist.assignedAt),
                      "dd MMM yyyy"
                    )}
                </time> */}
              </div>
              <h6 className="ps-2 text-primary">Tree:</h6>
              {(admission?.psychologists || []).map((p, i) => (
                <div
                  key={i}
                  className="ps-4 d-flex align-items-center justify-content-between border-bottom border-primary py-2"
                >
                  <h6 className="fs-14 w-50 text-primary">
                    {p.psychologist?.name}
                  </h6>
                  <div className="d-flex flex-column">
                    <time>
                      Assigned At{" "}
                      <span className="fw-bold">
                        {p.assignedAt &&
                          format(new Date(p.assignedAt), "dd MMM yyyy hh:mm a")}
                      </span>
                    </time>
                    <time>
                      {p.revokedAt && (
                        <>
                          Revoked At{" "}
                          <span className="fw-bold">
                            {format(
                              new Date(p.revokedAt),
                              "dd MMM yyyy hh:mm a"
                            )}
                          </span>
                        </>
                      )}
                    </time>
                  </div>
                </div>
              ))}
            </div>
            <div className="mb-3">
              <p className="text-muted text-uppercase fw-semibold fs-12 mb-2">
                Number
              </p>
              <h6>{patient?.phoneNumber}</h6>
            </div>
            <div className="mb-3">
              <p className="text-muted text-uppercase fw-semibold fs-12 mb-2">
                Email
              </p>
              <h6>{patient?.email}</h6>
            </div>
            <div>
              <p className="text-muted text-uppercase fw-semibold fs-12 mb-2">
                Location
              </p>
              <h6 className="mb-0">{patient?.address}</h6>
            </div>
          </div>
          <div className="p-3 border-top">
            <h5 className="fs-15 mb-4">File Manager</h5>
            <div className="d-flex mb-3 align-items-center">
              <div className="flex-shrink-0 avatar-xs">
                <div className="avatar-title bg-soft-danger text-danger rounded fs-16">
                  <i className="ri-image-2-line"></i>
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
                <h6 className="mb-1">
                  <Link to="#">Images</Link>
                </h6>
                <p className="text-muted mb-0">Aadhaar Card</p>
              </div>
              <div className="text-muted">
                <Button id="patient-aadhaar-card" size="sm">
                  View
                </Button>
                <UncontrolledPopover
                  placement="left"
                  target="patient-aadhaar-card"
                >
                  <PopoverBody>
                    <img
                      className="w-100"
                      src={patient?.aadhaarCard?.url}
                      alt="Patient Aadhaar Card"
                    />
                  </PopoverBody>
                </UncontrolledPopover>
              </div>
            </div>
            {/* <div className="d-flex mb-3">
              <div className="flex-shrink-0 avatar-xs">
                <div className="avatar-title bg-soft-secondary text-secondary rounded fs-16">
                  <i className="ri-file-zip-line"></i>
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
                <h6 className="mb-1">
                  <Link to="#">Documents</Link>
                </h6>
                <p className="text-muted mb-0">46 Files</p>
              </div>
              <div className="text-muted">3.46 GB</div>
            </div>
            <div className="d-flex mb-3">
              <div className="flex-shrink-0 avatar-xs">
                <div className="avatar-title bg-soft-success text-success rounded fs-16">
                  <i className="ri-live-line"></i>
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
                <h6 className="mb-1">
                  <Link to="#">Media</Link>
                </h6>
                <p className="text-muted mb-0">124 Files</p>
              </div>
              <div className="text-muted">4.3 GB</div>
            </div>
            <div className="d-flex">
              <div className="flex-shrink-0 avatar-xs">
                <div className="avatar-title bg-soft-primary text-primary rounded fs-16">
                  <i className="ri-error-warning-line"></i>
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
                <h6 className="mb-1">
                  <Link to="#">Others</Link>
                </h6>
                <p className="text-muted mb-0">18 Files</p>
              </div>
              <div className="text-muted">846 MB</div>
            </div> */}
          </div>
        </OffcanvasBody>
        {/* <div className="offcanvas-foorter border p-3 hstack gap-3 text-center position-relative">
          <button className="btn btn-light w-100">
            <i className="ri-question-answer-fill align-bottom ms-1"></i> Send
            Message
          </button>
          <Link to="/pages-profile" className="btn btn-primary w-100">
            <i className="ri-user-3-fill align-bottom ms-1"></i> View Profile
          </Link>
        </div> */}
      </PatientOffCanvas>
    </React.Fragment>
  );
};

Offcanvas.propTypes = {
  profile: PropTypes.object,
};

const mapStateToProps = (state) => ({
  profile: state.Patient.viewProfile,
  admissions: state.Chart.data,
});

export default connect(mapStateToProps)(Offcanvas);
