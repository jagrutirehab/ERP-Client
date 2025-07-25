import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Input,
  Row,
  Spinner,
} from "reactstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import RenderWhen from "../../Components/Common/RenderWhen";
import Header from "../Report/Components/Header";

//redux
import { connect, useDispatch } from "react-redux";
import {
  createEditLead,
  fetchAllCenters,
  removeLead,
  searchLead,
} from "../../store/actions";

//components
import PatientForm from "../../Components/Patient/AddPatient";
import LeadForm from "./Form";
import LeadList from "./List";
import DeleteModal from "../../Components/Common/DeleteModal";
import { CSVLink } from "react-csv";
import { endOfDay, format, startOfDay } from "date-fns";
import Merge from "./Merge";
import UnMerge from "./UnMerge";
import HubspotContacts from "../Report/Components/Hubspot";

const Lead = ({ searchLoading, leads, centerAccess }) => {
  const dispatch = useDispatch();

  const [date, setDate] = useState({
    start: startOfDay(new Date()),
    end: endOfDay(new Date()),
  });
  const [mergeLead, setMergeLead] = useState();
  const [unMergeLead, setUnMergeLead] = useState();
  const [leadQuery, setLeadQuery] = useState("");
  const [deleteLead, setDeleteLead] = useState({
    id: null,
    isOpen: false,
  });

  useEffect(() => {
    dispatch(
      searchLead({
        leadQuery,
        grouped: true,
        centerAccess: JSON.stringify(centerAccess),
        ...date,
      })
    );
  }, [dispatch, leadQuery, centerAccess, date]);

  useEffect(() => {
    dispatch(fetchAllCenters());
  }, [dispatch]);

  //delete lead
  const onCloseClick = () => {
    setDeleteLead({ id: null, isOpen: false });
  };

  const onDeleteClick = () => {
    dispatch(removeLead(deleteLead?.id));
    onCloseClick();
  };

  const headers = [
    { label: "Date", key: "date" },
    { label: "Patient Name", key: "patient.name" },
    { label: "Patient Phone Number", key: "patient.phoneNumber" },
    { label: "Patient Age", key: "patient.age" },
    { label: "Attended By", key: "attendedBy" },
    { label: "Location", key: "location" },
    { label: "Referred By", key: "refferedBy" },
    { label: "Inquiry Details", key: "inquiry" },
    { label: "Comment", key: "comment" },
    { label: "Inquiry Type", key: "inquiryType" },
    { label: "Given Updates", key: "givenUpdates" },
    { label: "Follow up", key: "followUp" },
    { label: "Registered", key: "isRegister" },
  ];

  const documents = () => {
    let lds = [];
    (leads || []).forEach((lead) => {
      lead.leads?.forEach((val) => {
        lds.push({
          ...val,
          date: format(new Date(val.date), "dd MMM yyyy hh:mm a"),
          followUp:
            val.followUp?.length > 0
              ? val.followUp.map((vl) => vl.value).join(", \n")
              : "",
          location:
            val.location?.length > 0
              ? val.location.map((vl) => vl.title).join(", \n")
              : "",
        });
      });
    });
    return lds;
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Leads" pageTitle="Leads" />
          <Card className="mb-0">
            <CardBody className="bg-white">
              <Row className="g-2">
                <Col sm={4}>
                  <div className="search-box">
                    <Input
                      type="text"
                      value={leadQuery}
                      onChange={
                        (e) => setLeadQuery(e.target.value)
                        // dispatch(searchLead({ phoneNumber: e.target.value }))
                      }
                      className="form-control"
                      placeholder="Search for title, address"
                    />
                    <i className="ri-search-line search-icon"></i>
                    <RenderWhen isTrue={searchLoading}>
                      <Spinner
                        className="position-absolute"
                        style={{ right: 10, top: 10 }}
                        color="success"
                        size={"sm"}
                      />
                    </RenderWhen>
                  </div>
                </Col>
                <Col className="col-sm-auto ms-auto d-flex gap-3">
                  <Header reportDate={date} setReportDate={setDate} />

                  <div className="list-grid-nav hstack gap-1">
                    <Button
                      color="success"
                      onClick={() =>
                        dispatch(createEditLead({ isOpen: true, data: null }))
                      }
                    >
                      <i className="ri-add-fill me-1 align-bottom"></i> Add New
                      Lead
                    </Button>
                  </div>

                  <div className="list-grid-nav hstack gap-1">
                    <CSVLink
                      data={documents() || []}
                      title="CSV Download"
                      filename={"leads.csv"}
                      headers={headers}
                      className="btn btn-info px-2 ms-3"
                    >
                      <i className="ri-file-paper-2-line text-light text-decoration-none"></i>
                    </CSVLink>
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>
          {/* Create Edit Lead */}
          <PatientForm />
          {/* <HubspotContacts leadDate={date} /> */}
          <LeadForm date={date} />
          <Merge date={date} lead={mergeLead} setLead={setMergeLead} />
          <UnMerge
            date={date}
            lead={unMergeLead}
            setUnMergeLead={setUnMergeLead}
          />
          <DeleteModal
            show={deleteLead?.isOpen}
            onCloseClick={onCloseClick}
            onDeleteClick={onDeleteClick}
          />
          <LeadList
            leads={leads}
            leadQuery={leadQuery}
            setDeleteLead={setDeleteLead}
            setMergeLead={setMergeLead}
            setUnMergeLead={setUnMergeLead}
          />
        </Container>
      </div>
    </React.Fragment>
  );
};

Lead.propTypes = {
  leads: PropTypes.array,
  searchLoading: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  leads: state.Lead.data,
  searchLoading: state.Lead.searchLoading,
  centerAccess: state.User.centerAccess,
});

export default connect(mapStateToProps)(Lead);
