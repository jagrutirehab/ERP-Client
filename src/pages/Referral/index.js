import React, { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Row,
  Button,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import classnames from "classnames";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import {
  fetchReferrals,
  fetchPendingReferrals,
  createEditReferral,
  removeReferral,
  approveReferralAction,
  rejectReferralAction,
} from "../../store/actions";
import ReferralForm from "./Form";
import ApprovedReferralsList from "./ApprovedReferralsList";
import PendingReferralsList from "./PendingReferralsList";
import ApproveReferralModal from "./ApproveReferralModal";
import RejectReferralModal from "./RejectReferralModal";
import RenderWhen from "../../Components/Common/RenderWhen";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../../Components/Hooks/useRoles";

const ReferralRegistration = ({
  referrals,
  pendingReferrals,
  loading,
  pendingLoading,
  user,
  paginationMeta,
  pendingPaginationMeta,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("approved");
  const [deleteModal, setDeleteModal] = useState(false);
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState(null);

  // Pagination state for approved referrals
  const [approvedPagination, setApprovedPagination] = useState({
    page: 1,
    limit: 10,
  });

  // Pagination state for pending referrals
  const [pendingPaginationState, setPendingPaginationState] = useState({
    page: 1,
    limit: 10,
  });

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { loading: permissionLoader, hasPermission } = usePermissions(token);
  const hasReferralPermission = hasPermission("REFERRAL", null, "READ");

  useEffect(() => {
    if (permissionLoader) return;
    if (!hasReferralPermission) {
      navigate("/unauthorized");
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasReferralPermission, permissionLoader]);

  const hasCreateReferralPermission = hasPermission("REFERRAL", null, "WRITE");
  const hasUpdateReferralPermission = hasPermission("REFERRAL", null, "WRITE");
  const hasDeleteReferralPermission = hasPermission("REFERRAL", null, "DELETE");

  useEffect(() => {
    dispatch(fetchReferrals(approvedPagination));
  }, [dispatch, approvedPagination]);

  useEffect(() => {
    dispatch(fetchPendingReferrals(pendingPaginationState));
  }, [dispatch, pendingPaginationState]);

  const handleEdit = (referral) => {
    dispatch(createEditReferral({ isOpen: true, data: referral }));
  };

  const handleDelete = (referral) => {
    setSelectedReferral(referral);
    setDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedReferral) {
      dispatch(removeReferral(selectedReferral._id));
      setDeleteModal(false);
      setSelectedReferral(null);
    }
  };

  const handleAddNew = () => {
    dispatch(createEditReferral({ isOpen: true, data: null }));
  };

  const handleApprove = (referral) => {
    setSelectedReferral(referral);
    setApproveModal(true);
  };

  const handleReject = (referral) => {
    setSelectedReferral(referral);
    setRejectModal(true);
  };

  const confirmApprove = (formData) => {
    if (selectedReferral) {
      dispatch(
        approveReferralAction({
          referralId: selectedReferral._id,
          ...formData,
        })
      ).then(() => {
        dispatch(fetchReferrals(approvedPagination));
        dispatch(fetchPendingReferrals(pendingPaginationState));
        setApproveModal(false);
        setSelectedReferral(null);
      });
    }
  };

  const confirmReject = () => {
    if (selectedReferral) {
      dispatch(
        rejectReferralAction({
          referralId: selectedReferral._id,
          deletePatient: false,
        })
      ).then(() => {
        dispatch(fetchPendingReferrals(pendingPaginationState));
        setRejectModal(false);
        setSelectedReferral(null);
      });
    }
  };

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  document.title = "Referral Registration | ERP";

  // Filter approved referrals (status === 'approved' or no status for legacy)
  const approvedReferrals =
    referrals?.filter((r) => r.status === "approved" || !r.status) || [];

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Referral Registration" pageTitle="Settings" />
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">Referral Doctors</h5>

                  <RenderWhen isTrue={hasCreateReferralPermission}>
                    <Button color="primary" size="sm" onClick={handleAddNew}>
                      <i className="ri-add-line align-middle me-1"></i>
                      Add Referral
                    </Button>
                  </RenderWhen>
                </CardHeader>
                <CardBody>
                  {/* Tabs */}
                  <Nav
                    tabs
                    className="nav-tabs-custom nav-success"
                    style={{ flexWrap: "nowrap", overflowX: "auto" }}
                  >
                    <NavItem>
                      <NavLink
                        style={{
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                          padding: "0.5rem 0.75rem",
                        }}
                        className={classnames({
                          active: activeTab === "approved",
                        })}
                        onClick={() => toggleTab("approved")}
                      >
                        <i className="ri-check-line me-1"></i>
                        Approved Referrals
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        style={{
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                          padding: "0.5rem 0.75rem",
                        }}
                        className={classnames({
                          active: activeTab === "pending",
                        })}
                        onClick={() => toggleTab("pending")}
                      >
                        <i className="ri-time-line me-1"></i>
                        Pending Referrals
                        {pendingReferrals && pendingReferrals.length > 0 && (
                          <span className="badge bg-warning ms-1">
                            {pendingReferrals.length}
                          </span>
                        )}
                      </NavLink>
                    </NavItem>
                  </Nav>

                  {/* Tab Content */}
                  <TabContent activeTab={activeTab} className="mt-3">
                    <TabPane tabId="approved">
                      <ApprovedReferralsList
                        referrals={approvedReferrals}
                        loading={loading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        hasUpdatePermission={hasUpdateReferralPermission}
                        hasDeletePermission={hasDeleteReferralPermission}
                        pagination={paginationMeta}
                        onPageChange={setApprovedPagination}
                      />
                    </TabPane>

                    <TabPane tabId="pending">
                      <PendingReferralsList
                        pendingReferrals={pendingReferrals}
                        loading={pendingLoading}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        pagination={pendingPaginationMeta}
                        onPageChange={setPendingPaginationState}
                      />
                    </TabPane>
                  </TabContent>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>

        {/* Referral Form Modal */}
        <ReferralForm />

        {/* Approve Modal */}
        <ApproveReferralModal
          isOpen={approveModal}
          toggle={() => setApproveModal(false)}
          referral={selectedReferral}
          onConfirm={confirmApprove}
        />

        {/* Reject Modal */}
        <RejectReferralModal
          isOpen={rejectModal}
          toggle={() => setRejectModal(false)}
          onConfirm={confirmReject}
        />

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModal}
          toggle={() => setDeleteModal(false)}
          centered
        >
          <ModalHeader toggle={() => setDeleteModal(false)}>
            Confirm Delete
          </ModalHeader>
          <ModalBody>Are you sure you want to delete this referral?</ModalBody>
          <ModalFooter>
            <Button color="light" onClick={() => setDeleteModal(false)}>
              Cancel
            </Button>
            <Button color="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => ({
  referrals: state.Referral.data,
  pendingReferrals: state.Referral.pendingReferrals,
  loading: state.Referral.loading,
  pendingLoading: state.Referral.pendingLoading,
  user: state.User.user,
  paginationMeta: state.Referral.pagination,
  pendingPaginationMeta: state.Referral.pendingPagination,
});

export default connect(mapStateToProps)(ReferralRegistration);
