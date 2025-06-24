import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import PersonalDetailForm from "./PersonalDetailForm";
import EducationDetailForm from "./EducationDetailForm";
import WorkExperience from "./WorkExperienceForm";
import { connect, useSelector } from "react-redux";
import { format } from "date-fns";
import FileCard from "../../../Components/Common/FileCard";
import PreviewFile from "../../../Components/Common/PreviewFile";
import RenderWhen from "../../../Components/Common/RenderWhen";

const GeneralInformation = ({ user }) => {
  const [personalDetailForm, setPersonalDetailForm] = useState({
    data: null,
    isOpen: false,
  });

  const [educationalDetailForm, setEducationalDetailForm] = useState({
    data: null,
    isOpen: false,
  });

  const [workExperienceForm, setWorkExperienceForm] = useState({
    data: null,
    isOpen: false,
  });

  const [fileModal, setFileModal] = useState({
    img: null,
    isOpen: false,
  });

  const onPreview = (img) => {
    setFileModal({ img, isOpen: true });
  };

  const toggleDetailForm = (data) =>
    setPersonalDetailForm({ data, isOpen: !personalDetailForm.isOpen });

  const toggleEducationForm = (data) =>
    setEducationalDetailForm({ data, isOpen: !educationalDetailForm.isOpen });

  const toggleExperienceForm = (data) =>
    setWorkExperienceForm({ data, isOpen: !workExperienceForm.isOpen });

  return (
    <React.Fragment>
      <div>
        <PersonalDetailForm
          form={personalDetailForm}
          toggle={toggleDetailForm}
        />
        <EducationDetailForm
          form={educationalDetailForm}
          toggle={toggleEducationForm}
        />
        <WorkExperience
          form={workExperienceForm}
          toggle={toggleExperienceForm}
        />

        <PreviewFile
          file={fileModal.img}
          isOpen={fileModal.isOpen}
          toggle={() => setFileModal({ img: null, isOpen: false })}
        />
        <Card>
          <CardHeader>
            <div className="d-flex align-items-center">
              <h6 className="text-nowrap mb-0">Work Information</h6>
              <div
                style={{ height: "2px" }}
                className="bg-secondary ms-3 w-100"
              ></div>
            </div>
          </CardHeader>
          <CardBody className="px-5">
            <Row>
              <Col md={6}>
                <Row className="border-bottom py-1 my-3 border-dark-subtle">
                  <Col className="p-0" xs={5}>
                    <p className="mb-0 fs-6 text-muted">Center(s)</p>
                  </Col>
                  <Col className="p-0" xs={1}>
                    <span>-</span>
                  </Col>
                  <Col className="p-0" xs={6}>
                    <p className="mb-0 fs-6 text-muted">Navi</p>
                  </Col>
                </Row>
                <Row className="border-bottom py-1 my-3 border-dark-subtle">
                  <Col className="p-0" xs={5}>
                    <p className="mb-0 fs-6 text-muted">Role</p>
                  </Col>
                  <Col className="p-0" xs={1}>
                    <span>-</span>
                  </Col>
                  <Col className="p-0" xs={6}>
                    <p className="mb-0 fs-6 text-muted">{user.role}</p>
                  </Col>
                </Row>
                <Row className="border-bottom py-1 my-3 border-dark-subtle">
                  <Col className="p-0" xs={5}>
                    <p className="mb-0 fs-6 text-muted">Expertise</p>
                  </Col>
                  <Col className="p-0" xs={1}>
                    <span>-</span>
                  </Col>
                  <Col className="p-0" xs={6}>
                    <p className="mb-0 fs-6 text-muted">{user.expertise.join(",")}</p>
                  </Col>
                </Row>
                <Row className="border-bottom py-1 my-3 border-dark-subtle">
                  <Col className="p-0" xs={5}>
                    <p className="mb-0 fs-6 text-muted">Availability Mode</p>
                  </Col>
                  <Col className="p-0" xs={1}>
                    <span>-</span>
                  </Col>
                  <Col className="p-0" xs={6}>
                    <p className="mb-0 fs-6 text-muted">{user.availabilityMode.join(",")}</p>
                  </Col>
                </Row>
                <Row className="border-bottom py-1 my-3 border-dark-subtle">
                  <Col className="p-0" xs={5}>
                    <p className="mb-0 fs-6 text-muted">Bio</p>
                  </Col>
                  <Col className="p-0" xs={1}>
                    <span>-</span>
                  </Col>
                  <Col className="p-0" xs={6}>
                    <p className="mb-0 fs-6 text-muted">{user.bio}</p>
                  </Col>
                </Row>
              </Col>
              <Col md={6}></Col>
            </Row>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="d-flex align-items-center">
              <h6 className="text-nowrap mb-0">Personal Details</h6>
              <div
                style={{ height: "2px" }}
                className="bg-secondary ms-3 w-100"
              ></div>
              <div className="ms-3">
                <Button
                  onClick={() => toggleDetailForm()}
                  size="sm"
                  color="success"
                  outline
                >
                  <i className="ri-quill-pen-line align-bottom text-muted"></i>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardBody className="px-5">
            <Row>
              <Col className="pe-4" md={6}>
                <Row className="border-bottom py-1 my-3 border-dark-subtle">
                  <Col className="p-0" xs={5}>
                    <p className="mb-0 fs-6 text-muted">Name</p>
                  </Col>
                  <Col className="p-0" xs={1}>
                    <span>-</span>
                  </Col>
                  <Col className="p-0" xs={6}>
                    <p className="mb-0 fs-6 text-muted">{user.name}</p>
                  </Col>
                </Row>

                <Row className="border-bottom py-1 my-3 border-dark-subtle">
                  <Col className="p-0" xs={5}>
                    <p className="mb-0 fs-6 text-muted">Father Name</p>
                  </Col>
                  <Col className="p-0" xs={1}>
                    <span>-</span>
                  </Col>
                  <Col className="p-0" xs={6}>
                    <p className="mb-0 fs-6 text-muted">
                      {user.detailInformation?.personalDetails?.fatherName}
                    </p>
                  </Col>
                </Row>

                <Row className="border-bottom py-1 my-3 border-dark-subtle">
                  <Col className="p-0" xs={5}>
                    <p className="mb-0 fs-6 text-muted">Mother Name</p>
                  </Col>
                  <Col className="p-0" xs={1}>
                    <span>-</span>
                  </Col>
                  <Col className="p-0" xs={6}>
                    <p className="mb-0 fs-6 text-muted">
                      {user.detailInformation?.personalDetails?.motherName}
                    </p>
                  </Col>
                </Row>

                <Row className="border-bottom py-1 my-3 border-dark-subtle">
                  <Col className="p-0" xs={5}>
                    <p className="mb-0 fs-6 text-muted">Date of birth</p>
                  </Col>
                  <Col className="p-0" xs={1}>
                    <span>-</span>
                  </Col>
                  <Col className="p-0" xs={6}>
                    <p className="mb-0 fs-6 text-muted">
                      {user.detailInformation?.personalDetails?.dateOfBirth &&
                        format(
                          new Date(
                            user.detailInformation?.personalDetails?.dateOfBirth
                          ),
                          "d MMM yyyy"
                        )}
                    </p>
                  </Col>
                </Row>
                <Row className="border-bottom py-1 my-3 border-dark-subtle">
                  <Col className="p-0" xs={5}>
                    <p className="mb-0 fs-6 text-muted">Age</p>
                  </Col>
                  <Col className="p-0" xs={1}>
                    <span>-</span>
                  </Col>
                  <Col className="p-0" xs={6}>
                    <p className="mb-0 fs-6 text-muted">17 years</p>
                  </Col>
                </Row>
                <Row className="border-bottom py-1 my-3 border-dark-subtle">
                  <Col className="p-0" xs={5}>
                    <p className="mb-0 fs-6 text-muted">Gender</p>
                  </Col>
                  <Col className="p-0" xs={1}>
                    <span>-</span>
                  </Col>
                  <Col className="p-0" xs={6}>
                    <p className="mb-0 fs-6 text-muted">
                      {user.detailInformation?.personalDetails?.gender}
                    </p>
                  </Col>
                </Row>
              </Col>
              <Col className="ps-4" md={6}>
                <Row className="border-bottom py-1 my-3 border-dark-subtle">
                  <Col className="p-0" xs={5}>
                    <p className="mb-0 fs-6 text-muted">
                      Emergency Contact Number
                    </p>
                  </Col>
                  <Col className="p-0" xs={1}>
                    <span>-</span>
                  </Col>
                  <Col className="p-0" xs={6}>
                    <p className="mb-0 fs-6 text-muted">
                      {
                        user.detailInformation?.personalDetails
                          ?.emergencyContactNumber
                      }
                    </p>
                  </Col>
                </Row>

                <Row className="border-bottom py-1 my-3 border-dark-subtle">
                  <Col className="p-0" xs={5}>
                    <p className="mb-0 fs-6 text-muted">Aadhaar Card</p>
                  </Col>
                  <Col className="p-0" xs={1}>
                    <span>-</span>
                  </Col>
                  <Col className="p-0" xs={6}>
                    <RenderWhen
                      isTrue={Boolean(
                        user.detailInformation?.personalDetails?.aadhaarCard
                      )}
                    >
                      <FileCard
                        file={
                          user.detailInformation?.personalDetails?.aadhaarCard
                        }
                        onPreview={onPreview}
                      />
                    </RenderWhen>
                  </Col>
                </Row>

                <Row className="border-bottom py-1 my-3 border-dark-subtle">
                  <Col className="p-0" xs={5}>
                    <p className="mb-0 fs-6 text-muted">Pan Card</p>
                  </Col>
                  <Col className="p-0" xs={1}>
                    <span>-</span>
                  </Col>
                  <Col className="p-0" xs={6}>
                    <RenderWhen
                      isTrue={Boolean(
                        user.detailInformation?.personalDetails?.panCard
                      )}
                    >
                      <FileCard
                        file={user.detailInformation?.personalDetails?.panCard}
                        onPreview={onPreview}
                      />
                    </RenderWhen>
                  </Col>
                </Row>
              </Col>
            </Row>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="d-flex align-items-center">
              <h6 className="text-nowrap mb-0">Work Experience</h6>
              <div
                style={{ height: "2px" }}
                className="bg-secondary ms-3 w-100"
              ></div>
              <div className="ms-3">
                <Button
                  onClick={toggleExperienceForm}
                  size="sm"
                  color="success"
                  outline
                >
                  <i className="ri-quill-pen-line align-bottom text-muted"></i>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <Row>
              <Col xs={12} md={6}>
                <h6 className="display-6 fs-6 mb-4">Experience Letters</h6>
                {(
                  user.detailInformation?.workExperience?.experienceLetters ||
                  []
                ).map((ex) => (
                  <FileCard key={ex._id} file={ex.file} onPreview={onPreview} />
                ))}
              </Col>

              <Col xs={12} md={6}>
                <h6 className="display-6 fs-6 mb-4">Pay Slips</h6>
                {(user.detailInformation?.workExperience?.paySlips || []).map(
                  (ex) => (
                    <FileCard
                      key={ex._id}
                      file={ex.file}
                      onPreview={onPreview}
                    />
                  )
                )}
              </Col>
            </Row>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="d-flex align-items-center">
              <h6 className="text-nowrap mb-0">Educational Details</h6>
              <div
                style={{ height: "2px" }}
                className="bg-secondary ms-3 w-100"
              ></div>
              <div className="ms-3">
                <Button
                  onClick={toggleEducationForm}
                  size="sm"
                  color="success"
                  outline
                >
                  <i className="ri-quill-pen-line align-bottom text-muted"></i>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardBody className="mx-5">
            {(
              user.detailInformation?.educationalDetails?.certificates || []
            ).map((ed) => (
              <Row className="border-bottom align-items-center py-1 my-3 border-dark-subtle">
                <Col className="p-0" xs={5}>
                  <p className="mb-0 fs-6 text-muted">{ed.name}</p>
                </Col>
                <Col className="p-0" xs={1}>
                  <span>-</span>
                </Col>
                <Col className="p-0" xs={6}>
                  <p className="mb-0 fs-6 text-muted">
                    <FileCard
                      key={ed._id}
                      file={ed.file}
                      onPreview={onPreview}
                    />
                  </p>
                </Col>
              </Row>
            ))}
          </CardBody>
        </Card>
      </div>
    </React.Fragment>
  );
};

GeneralInformation.propTypes = {};

const mapStateToProps = (state) => ({
  user: state.User.user,
});

export default connect(mapStateToProps)(GeneralInformation);
