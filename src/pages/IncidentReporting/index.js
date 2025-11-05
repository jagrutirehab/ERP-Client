import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../../Components/Hooks/useRoles";
import {
  Container,
  Spinner,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Row,
  Col,
  Button,
} from "reactstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import { connect, useDispatch, useSelector } from "react-redux";
import {
  fetchIncidents,
  setIncidentForm,
  setCurrentIncident,
  fetchIncidentById,
} from "../../store/features/incident/incidentSlice";
import IncidentForm from "./Components/IncidentForm";
import IncidentList from "./Components/IncidentList";
import IncidentDetailsModal from "./Components/IncidentDetailsModal";
import classnames from "classnames";
import CustomModal from "../../Components/Common/Modal";
import RenderWhen from "../../Components/Common/RenderWhen";

const IncidentReporting = ({ user, incidents, loading, centerAccess }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { loading: permissionLoader, hasPermission } = usePermissions(token);
  const hasIncidentPermission = hasPermission(
    "INCIDENT_REPORTING",
    null,
    "READ"
  );
  const hasIncidentCreatePermission = hasPermission(
    "INCIDENT_REPORTING",
    "RAISE_INCIDENT",
    "READ"
  );

  const [activeTab, setActiveTab] = useState("list");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingIncident, setViewingIncident] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    incidentType: "",
    search: "",
    page: 1,
    limit: 10,
  });
  const formState = useSelector(
    (state) => state.Incident?.form || { isOpen: false }
  );
  const currentIncident = useSelector(
    (state) => state.Incident?.currentIncident
  );
  const incidentLoading = useSelector(
    (state) => state.Incident?.loading || false
  );

  useEffect(() => {
    if (permissionLoader) return;
    if (!hasIncidentPermission) {
      navigate("/unauthorized");
      return;
    }
    loadIncidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, hasIncidentPermission, permissionLoader]);

  const loadIncidents = () => {
    const params = {
      ...filters,
      center: centerAccess?.[0]?._id || "",
    };
    dispatch(fetchIncidents(params));
  };

  const handleIncidentClick = (incident) => {
    setViewingIncident(incident);
    dispatch(setCurrentIncident(incident));
    dispatch(fetchIncidentById(incident._id));
    setViewModalOpen(true);
  };

  const handleCreateNew = () => {
    dispatch(setCurrentIncident(null));
    dispatch(
      setIncidentForm({
        isOpen: true,
        data: null,
        mode: "create",
      })
    );
    // Ensure we clear any previous incident from view
    setActiveTab("list");
  };

  const handleEdit = (incident) => {
    dispatch(setCurrentIncident(incident));
    dispatch(
      setIncidentForm({
        isOpen: true,
        data: incident,
        mode: "edit",
      })
    );
  };

  if (permissionLoader) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner
          color="primary"
          className="d-block"
          style={{ width: "3rem", height: "3rem" }}
        />
      </div>
    );
  }

  if (!hasIncidentPermission) {
    return null;
  }

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Incident Reporting" pageTitle="Incident Reporting" />

        <Row className="mb-3">
          <Col>
            <Nav tabs className="nav-tabs-custom nav-justified">
              <NavItem>
                <NavLink
                  style={{ cursor: "pointer" }}
                  className={classnames(
                    {
                      active: activeTab === "list",
                    },
                    "d-flex align-items-center"
                  )}
                  onClick={() => {
                    setActiveTab("list");
                  }}
                >
                  <i className="ri-file-list-line me-1"></i>
                  All Incidents
                </NavLink>
              </NavItem>
            </Nav>
          </Col>
          <RenderWhen isTrue={hasIncidentCreatePermission}>
            <Col xs="auto">
              <Button color="primary" onClick={handleCreateNew}>
                <i className="ri-add-line me-1"></i>
                Create New Incident
              </Button>
            </Col>
          </RenderWhen>
        </Row>

        <TabContent activeTab={activeTab}>
          <TabPane tabId="list">
            <IncidentList
              incidents={incidents}
              loading={loading}
              onIncidentClick={handleIncidentClick}
              onEdit={handleEdit}
              filters={filters}
              setFilters={setFilters}
              onRefresh={loadIncidents}
            />
          </TabPane>
        </TabContent>

        {/* Create/Edit Modal */}
        <CustomModal
          centered
          isOpen={formState.isOpen}
          size="xl"
          title={
            formState.mode === "edit" ? "Edit Incident" : "Create New Incident"
          }
          toggle={() => {
            dispatch(
              setIncidentForm({
                isOpen: false,
                data: null,
                mode: "create",
              })
            );
          }}
        >
          <IncidentForm
            incident={formState.data || null}
            onClose={() => {
              dispatch(
                setIncidentForm({
                  isOpen: false,
                  data: null,
                  mode: "create",
                })
              );
              dispatch(setCurrentIncident(null));
              loadIncidents();
            }}
          />
        </CustomModal>

        {/* View Details Modal */}
        <CustomModal
          centered
          isOpen={viewModalOpen}
          size="xl"
          title="Incident Details"
          toggle={() => {
            setViewModalOpen(false);
            setViewingIncident(null);
            dispatch(setCurrentIncident(null));
          }}
        >
          <IncidentDetailsModal
            incident={currentIncident || viewingIncident}
            loading={incidentLoading}
          />
        </CustomModal>
      </Container>
    </div>
  );
};

const mapStateToProps = (state) => ({
  user: state.User?.user,
  incidents: state.Incident?.data || [],
  loading: state.Incident?.loading || false,
  centerAccess: state.User?.centerAccess || [],
});

export default connect(mapStateToProps)(IncidentReporting);
