import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
} from "reactstrap";
import Select from "react-select";
import { History, Receipt } from "lucide-react";
import { connect, useDispatch } from "react-redux";
import PropTypes from "prop-types";

import { toast } from "react-toastify";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import CheckPermission from "../../../Components/HOC/CheckPermission";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { getApprovals } from "../../../store/features/centralPayment/centralPaymentSlice";
import ItemCard from "../Components/ItemCard";
import SpendingForm from "../Components/SpendingForm";

const paymentTypeOptions = [
  { value: "", label: "All" },
  { value: "COMPLETED", label: "Paid" },
  { value: "PENDING", label: "To Be Paid" },
];

const Spending = ({ centerAccess, approvals, loading }) => {
  const dispatch = useDispatch();
  const handleAuthError = useAuthError();

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission, roles } = usePermissions(token);
  const hasCreatePermission =
    hasPermission("CENTRALPAYMENT", "CENTRALPAYMENTSPENDING", "WRITE") ||
    hasPermission("CENTRALPAYMENT", "CENTRALPAYMENTSPENDING", "DELETE");

  const hasReadPermission = hasPermission("CENTRALPAYMENT", "CENTRALPAYMENTSPENDING", "READ");

  const [paymentTypeFilter, setPaymentTypeFilter] = useState("");

  useEffect(() => {
    if (!hasReadPermission) return;

    const fetchSpendings = async () => {
      try {
        await dispatch(getApprovals({
          page: 1,
          limit: 10,
          centers: centerAccess,
          ...(paymentTypeFilter && { initialPaymentStatus: paymentTypeFilter }),
        })).unwrap();
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error(error.message || "Failed to fetch spendings.");
        }
      }
    }
    fetchSpendings();
  }, [centerAccess, dispatch, roles, paymentTypeFilter]);


  if (!hasCreatePermission && !hasReadPermission) {
    return (
      <div className="text-center py-5">
        <h5 className="text-muted">
          You don't have permission to access this section
        </h5>
      </div>
    );
  }
  const data = approvals?.data || [];

  return (
    <React.Fragment>
      <h5 className="fw-bold mb-3">Spending</h5>
      <Row>
        <CheckPermission
          accessRolePermission={roles?.permissions}
          permission={"create"}
          subAccess={"CENTRALPAYMENTSPENDING"}
        >
          <Col lg={4} className="mb-4">
            <Card className="h-100 shadow-sm">
              <CardHeader className="bg-transparent border-bottom">
                <h5 className="mb-0 fw-semibold">Submit Spending Request</h5>
              </CardHeader>
              <CardBody style={{ maxHeight: "600px", overflowY: "auto" }} >
                <SpendingForm />
              </CardBody>
            </Card>
          </Col>
        </CheckPermission>

        <CheckPermission
          accessRolePermission={roles?.permissions}
          permission={"read"}
          subAccess={"CENTRALPAYMENTSPENDING"}
        >
          <Col lg={hasCreatePermission ? 8 : 12}>
            <Card className="h-100 shadow-sm">
              <CardHeader className="bg-transparent border-bottom d-flex flex-wrap align-items-center gap-3">
                <h5 className="mb-0 fw-semibold">
                  <History size={18} className="me-2 text-primary" />
                  Last 10 Spendings
                </h5>
                <div style={{ minWidth: 160 }}>
                  <Select
                    value={paymentTypeOptions.find(opt => opt.value === paymentTypeFilter)}
                    onChange={(option) => setPaymentTypeFilter(option?.value || "")}
                    options={paymentTypeOptions}
                    placeholder="All"
                    classNamePrefix="react-select"
                  />
                </div>
              </CardHeader>
              <CardBody className="p-0">
                <div
                  className="p-3"
                  style={{ maxHeight: "600px", overflowY: "auto" }}
                >
                  {loading ? (
                    <div className="text-center py-5 text-muted">
                      <div
                        className="spinner-border text-primary mb-3"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="h5">Fetching Spendings...</p>
                    </div>
                  ) : data?.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <Receipt size={48} className="mb-3" />
                      <p className="h5">No spending requests yet</p>
                      <p>Start by adding your first spending request using the form.</p>
                    </div>
                  ) : (
                    data?.map((spending) => (
                      <ItemCard
                        key={spending._id}
                        item={spending}
                      />
                    ))
                  )}
                </div>
              </CardBody>
            </Card>
          </Col>
        </CheckPermission>
      </Row>
    </React.Fragment>
  );
};

Spending.prototype = {
  centerAccess: PropTypes.array,
  loading: PropTypes.bool,
  approvals: PropTypes.object,
};

const mapStateToProps = (state) => ({
  centerAccess: state.User?.centerAccess,
  loading: state.CentralPayment.loading,
  approvals: state.CentralPayment.approvals,
});

export default connect(mapStateToProps)(Spending);
