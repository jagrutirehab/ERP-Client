import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Spinner,
} from "reactstrap";
import { Share, History, Receipt } from "lucide-react";
import { connect, useDispatch } from "react-redux";
import PropTypes from "prop-types";

import { toast } from "react-toastify";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import CheckPermission from "../../../Components/HOC/CheckPermission";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { format } from "date-fns";
import { addPayment, getLastCentralPayments } from "../../../store/features/centralPayment/centralPaymentSlice";
import ItemCard from "../Components/ItemCard";
import FileUpload from "../Components/FileUpload";
import SpendingForm from "../Components/SpendingForm";

const Spending = ({ centers, centerAccess, spendings, loading }) => {
  const dispatch = useDispatch();
  const handleAuthError = useAuthError();

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission, roles } = usePermissions(token);
  const hasCreatePermission =
    hasPermission("CENTRALPAYMENT", "CENTRALPAYMENTSPENDING", "WRITE") ||
    hasPermission("CENTRALPAYMENT", "CENTRALPAYMENTSPENDING", "DELETE");

  const hasReadPermission = hasPermission("CENTRALPAYMENT", "CENTRALPAYMENTSPENDING", "READ");

  useEffect(() => {
    if (!hasReadPermission) return;

    const fetchSpendings = async () => {
      try {
        await dispatch(getLastCentralPayments({
          page: 1, limit: 10, centers: centerAccess
        })).unwrap();
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error(error.message || "Failed to fetch spendings.");
        }
      }
    }
    fetchSpendings();
  }, [centerAccess, dispatch, roles]);


  if (!hasCreatePermission && !hasReadPermission) {
    return (
      <div className="text-center py-5">
        <h5 className="text-muted">
          You don't have permission to access this section
        </h5>
      </div>
    );
  }
  const cacheKey = centerAccess?.length ? [...centerAccess].sort().join(",") : "all";
  const data = spendings?.[cacheKey]?.data || [];

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
              <CardHeader className="bg-transparent border-bottom d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-semibold">
                  <History size={18} className="me-2 text-primary" />
                  Last 10 Spendings
                </h5>
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
  centers: PropTypes.array,
  loading: PropTypes.bool,
  spendings: PropTypes.object,
};

const mapStateToProps = (state) => ({
  centers: state.Center.data,
  centerAccess: state.User?.centerAccess,
  loading: state.CentralPayment.loading,
  spendings: state.CentralPayment.spendings,
});

export default connect(mapStateToProps)(Spending);
