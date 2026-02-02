import React from "react";
import PropTypes from "prop-types";
import {
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  UncontrolledButtonDropdown,
  UncontrolledTooltip,
} from "reactstrap";
import Highlighter from "react-highlight-words";
import { differenceInYears, format } from "date-fns";
import { createEditLead, togglePatientForm } from "../../store/actions";
import { useDispatch } from "react-redux";
import RenderWhen from "../../Components/Common/RenderWhen";
import Portal from "../../Components/Common/Portal";

const List = ({
  leads,
  leadQuery,
  setDeleteLead,
  setMergeLead,
  setUnMergeLead,
  centerAccess,
  grouped,
  date,
}) => {
  const dispatch = useDispatch();

  return (
    <React.Fragment>
      <div className="overflow-scroll">
        <Row
          className="mt-3 py-2 row-gap-2 lead-table  dropdown-portal" // overflow-scroll
          // style={{ width: "1000px" }}
        >
          <Col className="display-6 fs-13 font-semi-bold" xs={1}>
            Patient Name
          </Col>
          <Col className="display-6 fs-13 font-semi-bold" xs={1}>
            Date
          </Col>
          <Col className="display-6 fs-13 font-semi-bold" xs={1}>
            Patient Number
          </Col>
          <Col className="display-6 fs-13 font-semi-bold" xs={1}>
            Patient Age
          </Col>
          <Col className="display-6 fs-13 font-semi-bold" xs={1}>
            Patient Gender
          </Col>
          <Col className="display-6 fs-13 font-semi-bold" xs={1}>
            Attended By
          </Col>
          <Col className="display-6 fs-13 font-semi-bold" xs={1}>
            Location
          </Col>
          <Col className="display-6 fs-13 font-semi-bold" xs={1}>
            Visitor Name
          </Col>
          <Col className="display-6 fs-13 font-semi-bold" xs={1}>
            Reffered By
          </Col>
          <Col className="display-6 fs-13 font-semi-bold" xs={1}>
            Inquiry details
          </Col>
          <Col className="display-6 fs-13 font-semi-bold" xs={1}>
            Follow Up
          </Col>
          <Col className="display-6 fs-13 font-semi-bold" xs={1}></Col>

          {(leads || []).map((leadGroup) => (
            <Col
              className="bg-white py-3 overflow-auto"
              // style={{ width: "1000px" }}
              xs={12}
              key={leadGroup._id}
            >
              {/* <div className="text-center">
                  <h6 className="display-6 fs-6">
                    Grouped By: {leadGroup._id}
                  </h6>
                  <div className="d-flex align-items-center gap-4 mb-2 justify-content-center">
                    <div>
                      <span className="text-primary fs-14 font-semi-bold">
                        Patient Name:{" "}
                      </span>
                      {leadGroup.patientName}
                    </div>
                    <div>
                      <span className="text-primary fs-14 font-semi-bold">
                        Patient Phone Number:{" "}
                      </span>
                      {leadGroup._id}
                    </div>
                  </div>
                </div> */}
              <Row className="p-0">
                {" "}
                {/* lead-table */}
                {(leadGroup.leads || []).map((lead, idx) => (
                  <React.Fragment key={lead._id}>
                    <Col
                      className="d-flex align-items-center border border-top-2 border-bottom-2 p-1"
                      xs={1}
                    >
                      <span className="text-primary fs-15 me-2">
                        {idx + 1}:
                      </span>
                      {"  "}
                      <h6
                        id={`lead-${lead._id}`}
                        className={
                          lead.isRegister ? "text-success fs-6 mb-0" : "mb-0"
                        }
                      >
                        <Highlighter
                          // highlightClassName="bg-warning"
                          searchWords={[leadQuery]}
                          autoEscape={true}
                          textToHighlight={lead.patient.name}
                        />
                      </h6>
                      <RenderWhen isTrue={lead.isRegister}>
                        <UncontrolledTooltip target={`lead-${lead._id}`}>
                          Registered Patient
                        </UncontrolledTooltip>
                      </RenderWhen>
                    </Col>
                    <Col
                      className="border border-top-2 border-bottom-2 p-1"
                      xs={1}
                    >
                      <Highlighter
                        searchWords={[leadQuery]}
                        autoEscape={true}
                        textToHighlight={
                          lead.date
                            ? format(new Date(lead.date), "dd/MM/yyyy hh:mm a")
                            : ""
                        }
                      />
                    </Col>
                    <Col
                      className="border border-top-2 border-bottom-2 p-1"
                      xs={1}
                    >
                      <Highlighter
                        // highlightClassName="bg-warning"
                        searchWords={[leadQuery]}
                        autoEscape={true}
                        textToHighlight={lead.patient.phoneNumber}
                      />
                    </Col>
                    <Col
                      className="border border-top-2 border-bottom-2 p-1"
                      xs={1}
                    >
                      <Highlighter
                        // highlightClassName="bg-warning"
                        searchWords={[leadQuery]}
                        autoEscape={true}
                        textToHighlight={`${lead.patient.age} years`}
                      />
                    </Col>
                    <Col
                      className="border border-top-2 border-bottom-2 p-1"
                      xs={1}
                    >
                      <Highlighter
                        // highlightClassName="bg-warning"
                        searchWords={[leadQuery]}
                        autoEscape={true}
                        textToHighlight={lead.patient.gender}
                      />
                    </Col>
                    <Col
                      className="border border-top-2 border-bottom-2 p-1"
                      xs={1}
                    >
                      <Highlighter
                        // highlightClassName="bg-warning"
                        searchWords={[leadQuery]}
                        autoEscape={true}
                        textToHighlight={lead.attendedBy}
                      />
                    </Col>
                    <Col
                      className="border border-top-2 border-bottom-2 p-1"
                      xs={1}
                    >
                      <Highlighter
                        // highlightClassName="bg-warning"
                        searchWords={[leadQuery]}
                        autoEscape={true}
                        textToHighlight={
                          Array.isArray(lead.location)
                            ? lead.location
                                .map((item) => item.title)
                                .join(", \n")
                            : lead.location
                        }
                      />
                    </Col>
                    <Col
                      className="border border-top-2 border-bottom-2 p-1"
                      xs={1}
                    >
                      <Highlighter
                        // highlightClassName="bg-warning"
                        searchWords={[leadQuery]}
                        autoEscape={true}
                        textToHighlight={lead.visitorName}
                      />
                    </Col>
                    <Col
                      className="border border-top-2 border-bottom-2 p-1"
                      xs={1}
                    >
                      <Highlighter
                        // highlightClassName="bg-warning"
                        searchWords={[leadQuery]}
                        autoEscape={true}
                        textToHighlight={lead.refferedBy}
                      />
                    </Col>
                    <Col
                      className="border border-top-2 border-bottom-2 p-1"
                      xs={1}
                    >
                      <Highlighter
                        // highlightClassName="bg-warning"
                        searchWords={[leadQuery]}
                        autoEscape={true}
                        textToHighlight={lead.inquiry}
                      />
                    </Col>
                    <Col
                      className="border border-top-2 border-bottom-2 p-1"
                      xs={1}
                    >
                      {(lead.followUp || []).map((fl, id) => (
                        <div key={id}>{fl.value}</div>
                      ))}
                      {/* <Highlighter
                      // highlightClassName="bg-warning"
                      searchWords={[leadQuery]}
                      autoEscape={true}
                      textToHighlight={lead.inquiry}
                    /> */}
                    </Col>
                    <Col
                      className="border border-top-2 text-center border-bottom-2 p-1"
                      xs={1}
                    >
                      <UncontrolledButtonDropdown
                      // isOpen={settings_Menu}
                      // toggle={toggleSettings}
                      >
                        <DropdownToggle
                          className="btn btn-ghost-secondary btn-icon"
                          tag="button"
                        >
                          <i className="bx bx-dots-vertical-rounded fs-4"></i>
                          {/* <FeatherIcon icon="more-vertical" className="icon-sm" /> */}
                        </DropdownToggle>
                        <Portal
                          node={document.querySelector(".dropdown-portal")}
                        >
                          <DropdownMenu style={{ width: "200px" }}>
                            <DropdownItem
                              href="#"
                              className="d-block user-profile-show"
                              disabled={lead.isRegister}
                              onClick={() => setUnMergeLead(lead)}
                            >
                              <i className="ri-git-branch-fill align-bottom text-muted me-2"></i>{" "}
                              Un Merge
                            </DropdownItem>
                            <DropdownItem
                              href="#"
                              className="d-block user-profile-show"
                              disabled={lead.isRegister}
                              onClick={() => setMergeLead(lead)}
                            >
                              <i className="ri-git-merge-fill align-bottom text-muted me-2"></i>{" "}
                              Merge
                            </DropdownItem>
                            <DropdownItem
                              href="#"
                              className="d-block user-profile-show"
                              disabled={lead.isRegister}
                              onClick={() =>
                                dispatch(
                                  togglePatientForm({
                                    data: null,
                                    leadData: {
                                      ...lead,
                                      leadOrigin: "generic",
                                      leadQuery,
                                      centerAccess,
                                      grouped,
                                      date,
                                    },
                                    isOpen: true,
                                  }),
                                )
                              }
                            >
                              <i className="ri-user-2-fill align-bottom text-muted me-2"></i>{" "}
                              Register Patient
                            </DropdownItem>
                            <DropdownItem
                              href="#"
                              className="d-block user-profile-show"
                              onClick={() =>
                                dispatch(
                                  createEditLead({ data: lead, isOpen: true }),
                                )
                              }
                            >
                              <i className="ri-quill-pen-line align-bottom text-muted me-2"></i>{" "}
                              Edit
                            </DropdownItem>
                            <DropdownItem
                              href="#"
                              disabled={lead.isRegister}
                              onClick={() =>
                                setDeleteLead({ id: lead._id, isOpen: true })
                              }
                            >
                              {" "}
                              <i className="ri-delete-bin-5-line align-bottom text-muted me-2"></i>{" "}
                              Delete
                            </DropdownItem>
                          </DropdownMenu>
                        </Portal>
                      </UncontrolledButtonDropdown>
                      {/* <Button size="sm" outline></Button> */}
                    </Col>
                    {/* <Col xs={2}>{lead.}</Col> */}
                  </React.Fragment>
                ))}
              </Row>
            </Col>
          ))}
        </Row>
      </div>
    </React.Fragment>
  );
};

List.propTypes = {
  leads: PropTypes.array,
  leadQuery: PropTypes.string,
  setDeleteLead: PropTypes.func,
};

export default List;
