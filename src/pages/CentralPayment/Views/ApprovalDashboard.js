// import React, { useState } from 'react'
// import { NavItem, Nav, NavLink, TabContent, TabPane } from 'reactstrap';
// import classnames from "classnames";
// import PaymentProcessing from '../Components/PaymentProcessing';
// import PendingApprovals from '../Components/PendingApprovals';
// import { usePermissions } from '../../../Components/Hooks/useRoles';

// const ApprovalDashboard = () => {

//   const [activeTab, setActiveTab] = useState("approval");
//   const microUser = localStorage.getItem("micrologin");
//   const token = microUser ? JSON.parse(microUser).token : null;
//   const { hasPermission, roles } = usePermissions(token);

//   const hasCreatePermission =
//     hasPermission("CENTRALPAYMENT", "CENTRALPAYMENTAPPROVAL", "WRITE") ||
//     hasPermission("CENTRALPAYMENT", "CENTRALPAYMENTAPPROVAL", "DELETE");

//   return (
//     <React.Fragment>
//       <h5 className="fw-bold mb-3">Approval Dashboard</h5>
//       <Nav tabs className="mb-2">
//         <NavItem>
//           <NavLink
//             className={classnames({ active: activeTab === "approval" })}
//             onClick={() => setActiveTab("approval")}
//             style={{ cursor: "pointer" }}
//           >
//             Pending Approvals
//           </NavLink>
//         </NavItem>
//         <NavItem>
//           <NavLink
//             className={classnames({ active: activeTab === "paymentProcessing" })}
//             onClick={() => setActiveTab("paymentProcessing")}
//             style={{ cursor: "pointer" }}
//           >
//             Payment Processing
//           </NavLink>
//         </NavItem>
//       </Nav>

//       <TabContent activeTab={activeTab}>
//         <TabPane tabId="approval">
//           <PendingApprovals activeTab={activeTab} hasCreatePermission={hasCreatePermission} roles={roles} />
//         </TabPane>
//         <TabPane tabId="paymentProcessing">
//           <PaymentProcessing activeTab={activeTab} hasCreatePermission={hasCreatePermission} roles={roles} />
//         </TabPane>
//       </TabContent>
//     </React.Fragment>
//   )
// }



// export default ApprovalDashboard;

import React, { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { Button, Col, Container, Row, Spinner } from "reactstrap"
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { toast } from "react-toastify";
import { getApprovals } from "../../../store/features/centralPayment/centralPaymentSlice";
import PropTypes from "prop-types";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import ItemCard from "../Components/ItemCard";
import Select from "react-select";

const ApprovalDashboard = ({ centerAccess, userCenters, loading, approvals }) => {

  const dispatch = useDispatch();
  const handleAuthError = useAuthError();
  const [page, setPage] = useState(1);
  const [selectedCenter, setSelectedCenter] = useState("ALL");
  const limit = 12;

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission } = usePermissions(token);

  const hasCreatePermission =
    hasPermission("CENTRALPAYMENT", "CENTRALPAYMENTAPPROVAL", "WRITE") ||
    hasPermission("CENTRALPAYMENT", "CENTRALPAYMENTAPPROVAL", "DELETE");

  const centerOptions = [
    ...(centerAccess?.length > 1
      ? [{
        value: "ALL",
        label: "All Centers",
        isDisabled: false,
      }]
      : []
    ),
    ...(
      centerAccess?.map(id => {
        const center = userCenters?.find(c => c._id === id);
        return {
          value: id,
          label: center?.title || "Unknown Center"
        };
      }) || []
    )
  ];

  const selectedCenterOption = centerOptions.find(
    opt => opt.value === selectedCenter
  ) || centerOptions[0];

  useEffect(() => {
    if (
      selectedCenter !== "ALL" &&
      !centerAccess?.includes(selectedCenter)
    ) {
      setSelectedCenter("ALL");
      setPage(1);
    }
  }, [selectedCenter, centerAccess]);

  useEffect(() => {
    const fetchPendingApprovals = async () => {
      try {
        const centers =
          selectedCenter === "ALL"
            ? centerAccess
            : !centerAccess.length ? [] : [selectedCenter];

        await dispatch(getApprovals({
          page,
          limit,
          centers: centers,
          approvalStatus: "PENDING"
        })).unwrap();
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error(error.message || "Failed to fetch pending approvals.");
        }
      }
    }

    fetchPendingApprovals();
  }, [centerAccess, selectedCenter, dispatch, page, limit]);



  if (loading) {
    return (
      <Container fluid className="text-center py-5">
        <Spinner color="primary" />
      </Container>
    );
  }
  return (
    <React.Fragment>
      <div className="d-flex flex-column">
        <Container fluid>
          <div className="mb-5">
            <Row className="mb-3 align-items-center">
              <Col lg="2" md="6" sm="12">
                <Select
                  value={selectedCenterOption}
                  onChange={(option) => {
                    setSelectedCenter(option?.value);
                    setPage(1);
                  }}
                  options={centerOptions}
                  placeholder="All Centers"
                  classNamePrefix="react-select"
                />
              </Col>
            </Row>
            {approvals?.data?.length > 0 ? (
              <Row>
                {(approvals?.data || []).map((payment) => (
                  <Col xxl="6" lg="6" md="12" sm="12" xs="12" key={payment._id} className="mb-3">
                    <ItemCard item={payment} flag="approval" border={true} hasCreatePermission={hasCreatePermission} />
                  </Col>
                ))}
              </Row>
            ) : (
              <div
                className="d-flex flex-column justify-content-center align-items-center text-center text-muted"
                style={{ minHeight: "40vh" }}
              >
                <h6 className="mb-1">No pending approvals</h6>
              </div>
            )}
          </div>
          {!loading && approvals?.pagination?.totalPages > 1 && (
            <>
              {/* Mobile Layout */}
              <div className="d-block d-md-none text-center mt-3">
                <div className="text-muted mb-2">
                  Showing {(page - 1) * limit + 1}–
                  {Math.min(page * limit, approvals?.pagination?.totalDocs || 0)} of{" "}
                  {approvals?.pagination?.totalDocs || 0}
                </div>
                <div className="d-flex justify-content-center gap-2">
                  <Button
                    color="secondary"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    ← Previous
                  </Button>
                  <Button
                    color="secondary"
                    disabled={page === approvals?.pagination?.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next →
                  </Button>
                </div>
              </div>

              {/* Desktop Layout */}
              <Row className="mt-4 justify-content-center align-items-center d-none d-md-flex">
                <Col xs="auto" className="d-flex justify-content-center">
                  <Button
                    color="secondary"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    ← Previous
                  </Button>
                </Col>
                <Col xs="auto" className="text-center text-muted mx-3">
                  Showing {(page - 1) * limit + 1}–
                  {Math.min(page * limit, approvals?.pagination?.totalDocs || 0)} of{" "}
                  {approvals?.pagination?.totalDocs || 0}
                </Col>
                <Col xs="auto" className="d-flex justify-content-center">
                  <Button
                    color="secondary"
                    disabled={page === approvals?.pagination?.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next →
                  </Button>
                </Col>
              </Row>
            </>
          )}
        </Container>
      </div>
    </React.Fragment>
  )
}

ApprovalDashboard.prototype = {
  loading: PropTypes.bool,
  approvals: PropTypes.object,
  centerAccess: PropTypes.array,
  userCenters: PropTypes.array,
}


const mapStateToProps = (state) => ({
  centerAccess: state.User?.centerAccess,
  userCenters: state.User?.userCenters,
  loading: state.CentralPayment?.loading,
  approvals: state.CentralPayment?.approvals
});

export default connect(mapStateToProps)(ApprovalDashboard);