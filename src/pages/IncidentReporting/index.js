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
  Input,
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

const IncidentReporting = ({
  user,
  incidents,
  loading,
  centerAccess,
  centers,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { loading: permissionLoader, hasPermission } = usePermissions(token);
  const hasIncidentPermission = hasPermission(
    "INCIDENT_REPORTING",
    null,
    "READ",
  );
  const hasIncidentCreatePermission = hasPermission(
    "INCIDENT_REPORTING",
    "RAISE_INCIDENT",
    "WRITE",
  );

  const [activeTab, setActiveTab] = useState("all");
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
    (state) => state.Incident?.form || { isOpen: false },
  );
  const currentIncident = useSelector(
    (state) => state.Incident?.currentIncident,
  );
  const incidentLoading = useSelector(
    (state) => state.Incident?.loading || false,
  );
  const pagination = useSelector((state) => state.Incident?.pagination) || {};

  // Center selection state
  const [centerOptions, setCenterOptions] = useState(
    centers
      ?.filter((c) => centerAccess.includes(c._id))
      .map((c) => ({
        _id: c._id,
        title: c.title,
      })),
  );
  const [selectedCentersIds, setSelectedCentersIds] = useState(
    centerOptions?.map((c) => c._id) || [],
  );

  // Initialize center options when centers or centerAccess changes
  useEffect(() => {
    setCenterOptions(
      centers
        ?.filter((c) => centerAccess.includes(c._id))
        .map((c) => ({
          _id: c._id,
          title: c.title,
        })),
    );
  }, [centerAccess, centers]);

  // Update selected centers when centerOptions change
  useEffect(() => {
    if (centerOptions && centerOptions?.length > 0) {
      setSelectedCentersIds(centerOptions.map((c) => c._id));
    }
  }, [centerOptions]);

  useEffect(() => {
    if (permissionLoader) return;
    if (!hasIncidentPermission) {
      navigate("/unauthorized");
      return;
    }
    loadIncidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, hasIncidentPermission, permissionLoader, selectedCentersIds]);

  const loadIncidents = () => {
    const statusMap = {
      all: "",
      raised: "Raised",
      investigation: "Under Investigation",
      pending: "Pending Approval",
      approved: "Approved",
      rejected: "Rejected",
      closed: "Closed",
    };
    const enforcedStatus = statusMap[activeTab] ?? "";
    const params = {
      ...filters,
      status: activeTab === "all" ? filters.status : enforcedStatus,
      centerAccess: selectedCentersIds,
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
      }),
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
      }),
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

        <Row className="mb-3 align-items-center">
          <Col>
            <Nav
              tabs
              className="nav-tabs-custom nav-justified d-none d-md-flex flex-nowrap"
              style={{ overflowX: "auto" }}
            >
              <NavItem>
                <NavLink
                  style={{ cursor: "pointer" }}
                  className={classnames(
                    { active: activeTab === "all" },
                    "d-flex align-items-center",
                  )}
                  onClick={() => {
                    setActiveTab("all");
                    setFilters({ ...filters, page: 1 });
                  }}
                >
                  <i className="ri-file-list-line me-1"></i>
                  All
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  style={{ cursor: "pointer" }}
                  className={classnames(
                    { active: activeTab === "raised" },
                    "d-flex align-items-center",
                  )}
                  onClick={() => {
                    setActiveTab("raised");
                    setFilters({ ...filters, page: 1 });
                  }}
                >
                  <i className="ri-alert-line me-1"></i>
                  Raised
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  style={{ cursor: "pointer" }}
                  className={classnames(
                    { active: activeTab === "investigation" },
                    "d-flex align-items-center",
                  )}
                  onClick={() => {
                    setActiveTab("investigation");
                    setFilters({ ...filters, page: 1 });
                  }}
                >
                  <i className="ri-search-line me-1"></i>
                  Investigation
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  style={{ cursor: "pointer" }}
                  className={classnames(
                    { active: activeTab === "pending" },
                    "d-flex align-items-center",
                  )}
                  onClick={() => {
                    setActiveTab("pending");
                    setFilters({ ...filters, page: 1 });
                  }}
                >
                  <i className="ri-time-line me-1"></i>
                  Pending
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  style={{ cursor: "pointer" }}
                  className={classnames(
                    { active: activeTab === "approved" },
                    "d-flex align-items-center",
                  )}
                  onClick={() => {
                    setActiveTab("approved");
                    setFilters({ ...filters, page: 1 });
                  }}
                >
                  <i className="ri-checkbox-circle-line me-1"></i>
                  Approved
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  style={{ cursor: "pointer" }}
                  className={classnames(
                    { active: activeTab === "rejected" },
                    "d-flex align-items-center",
                  )}
                  onClick={() => {
                    setActiveTab("rejected");
                    setFilters({ ...filters, page: 1 });
                  }}
                >
                  <i className="ri-close-circle-line me-1"></i>
                  Rejected
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  style={{ cursor: "pointer" }}
                  className={classnames(
                    { active: activeTab === "closed" },
                    "d-flex align-items-center",
                  )}
                  onClick={() => {
                    setActiveTab("closed");
                    setFilters({ ...filters, page: 1 });
                  }}
                >
                  <i className="ri-lock-line me-1"></i>
                  Closed
                </NavLink>
              </NavItem>
            </Nav>
            {/* Mobile status switcher */}
            <div className="d-md-none mt-2">
              <Input
                type="select"
                value={activeTab}
                onChange={(e) => {
                  setActiveTab(e.target.value);
                  setFilters({ ...filters, page: 1 });
                }}
              >
                <option value="all">All</option>
                <option value="raised">Raised</option>
                <option value="investigation">Under Investigation</option>
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="closed">Closed</option>
              </Input>
            </div>
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
          <TabPane tabId={activeTab}>
            <IncidentList
              incidents={incidents}
              loading={loading}
              onIncidentClick={handleIncidentClick}
              onEdit={handleEdit}
              filters={filters}
              setFilters={setFilters}
              onRefresh={loadIncidents}
              pagination={pagination}
              showStatusFilter={activeTab === "all"}
              centerOptions={centerOptions}
              selectedCentersIds={selectedCentersIds}
              setSelectedCentersIds={setSelectedCentersIds}
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
              }),
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
                }),
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
  centers: state.Center.data,
});

export default connect(mapStateToProps)(IncidentReporting);
