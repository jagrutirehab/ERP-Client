import { Check, FileText } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Card,
  CardBody,
  CardTitle,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Row,
  Col,
  CardHeader,
  Spinner,
} from "reactstrap";
import PropTypes from "prop-types";
import { connect, useDispatch } from "react-redux";
import FileUpload from "../Components/FileUpload";
import {
  getLastBaseBalanceByCenter,
  addBaseBalance,
  clearLastBaseBalance,
} from "../../../store/features/cashManagement/cashSlice";
import { toast } from "react-toastify";
import moment from "moment";
import { downloadFile } from "../../../Components/Common/downloadFile";
import { format } from "date-fns";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import CheckPermission from "../../../Components/HOC/CheckPermission";

const BaseBalance = ({ centers, centerAccess, loading, lastBaseBalance }) => {
  const dispatch = useDispatch();
  const centerOptions = centers
    ?.filter((c) => centerAccess.includes(c._id))
    .map((c) => ({
      _id: c._id,
      title: c.title,
    }));
  const [attachment, setAttachment] = useState(null);

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission, roles } = usePermissions(token);

  const hasCreatePermission =
    hasPermission("CASH", "CASHBALANCE", "CREATE") ||
    hasPermission("CASH", "CASHBALANCE", "WRITE") ||
    hasPermission("CASH", "CASHBALANCE", "DELETE");

  const hasReadPermission =
    hasPermission("CASH", "CASHBALANCE", "READ") ||
    hasPermission("CASH", "CASHBALANCE", "WRITE") ||
    hasPermission("CASH", "CASHBALANCE", "DELETE");

  const getHeading = () => {
    if (hasCreatePermission && hasReadPermission) {
      return "Set Base Bank Balance";
    } else if (hasCreatePermission) {
      return "Set Base Bank Balance";
    } else if (hasReadPermission) {
      return "Check Base Bank Balance";
    }
    return "Base Bank Balance";
  };

  const validationSchema = Yup.object({
    center: Yup.string().required("Please select a center"),
    amount: Yup.number()
      .typeError("Amount must be a number")
      .required("Please enter a balance amount")
      .positive("Amount must be positive")
      .min(0.01, "Amount must be greater than 0"),
    date: Yup.date().required("Please select a date"),
  });

  const formik = useFormik({
    initialValues: {
      center: "",
      amount: 0,
      date: format(new Date(), "yyyy-MM-dd"),
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!hasCreatePermission) {
        toast.error("You don't have permission to set base balance");
        return;
      }

      const baseBalanceDate = new Date(values.date);
      const now = new Date();
      baseBalanceDate.setHours(
        now.getHours(),
        now.getMinutes(),
        now.getSeconds()
      );
      const formData = new FormData();
      formData.append("center", values.center);
      formData.append("amount", Number(values.amount));
      formData.append("date", baseBalanceDate.toISOString());
      if (attachment) {
        formData.append("attachment", attachment);
      }
      try {
        await dispatch(addBaseBalance(formData)).unwrap();
        toast.success(`Base balance added successfully`);
        resetForm({
          values: {
            ...values,
            amount: 0,
            date: format(new Date(), "yyyy-MM-dd"),
          },
        });
        setAttachment(null);
      } catch (error) {
        toast.error(error.message || "Failed to add base balance.");
      }
    },
  });

  useEffect(() => {
    if (!hasReadPermission) return;
    if (formik.values.center) {
      dispatch(getLastBaseBalanceByCenter(formik.values.center));
    } else {
      dispatch(clearLastBaseBalance());
    }
  }, [formik.values.center, dispatch, hasReadPermission]);

  const hasSelectedCenter = !!formik.values.center;
  const selectedCenterName =
    centers.find((c) => c._id === formik.values.center)?.title ||
    formik.values.center;

  if (!hasCreatePermission && !hasReadPermission) {
    return (
      <div className="text-center py-5">
        <h5 className="text-muted">
          You don't have permission to access this section
        </h5>
      </div>
    );
  }

  return (
    <React.Fragment>
      <h5 className="fw-bold mb-3">{getHeading()}</h5>
      <Row className="h-100">
        <Col lg={4}>
          <Card className="h-100 shadow-sm">
            <CardHeader className="bg-transparent border-bottom">
              <h5 className="mb-0 fw-semibold">Enter EOD Balance</h5>
            </CardHeader>
            <CardBody className="d-flex flex-column">
              <Form
                onSubmit={formik.handleSubmit}
                className="flex-grow-1 d-flex flex-column"
              >
                <div className="flex-grow-1">
                  <FormGroup className="mb-3">
                    <Label for="center" className="fw-medium text-muted">
                      Center
                    </Label>
                    <Input
                      type="select"
                      id="center"
                      name="center"
                      value={formik.values.center}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`form-select ${
                        formik.touched.center && formik.errors.center
                          ? "is-invalid"
                          : ""
                      }`}
                    >
                      <option value="">Select a Center</option>
                      {centerOptions.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.title}
                        </option>
                      ))}
                    </Input>
                    {formik.touched.center && formik.errors.center && (
                      <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {formik.errors.center}
                      </div>
                    )}
                  </FormGroup>
                  <CheckPermission
                    accessRolePermission={roles?.permissions}
                    permission={"create"}
                    subAccess={"CASHBALANCE"}
                  >
                    <FormGroup className="mb-3">
                      <Label for="amount" className="fw-medium text-muted">
                        EOD Balance Amount
                      </Label>
                      <Input
                        type="number"
                        id="amount"
                        name="amount"
                        value={formik.values.amount}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="e.g., 25000.00"
                        step="0.01"
                        min="0"
                        className={`form-control ${
                          formik.touched.amount && formik.errors.amount
                            ? "is-invalid"
                            : ""
                        }`}
                      />
                      {formik.touched.amount && formik.errors.amount && (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle me-1"></i>
                          {formik.errors.amount}
                        </div>
                      )}
                    </FormGroup>

                    <FormGroup className="mb-4">
                      <Label for="date" className="fw-medium text-muted">
                        Date
                      </Label>
                      <Input
                        type="date"
                        id="date"
                        name="date"
                        value={formik.values.date}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        max={format(new Date(), "yyyy-MM-dd")}
                        className={`form-control ${
                          formik.touched.date && formik.errors.date
                            ? "is-invalid"
                            : ""
                        }`}
                      />
                      {formik.touched.date && formik.errors.date && (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle me-1"></i>
                          {formik.errors.date}
                        </div>
                      )}
                    </FormGroup>

                    <FormGroup>
                      <Label className="fw-medium">Attachment</Label>
                      <FileUpload
                        attachment={attachment}
                        setAttachment={setAttachment}
                      />
                    </FormGroup>

                    <div
                      className="p-3 mb-4 border-start rounded"
                      style={{
                        backgroundColor: "rgba(255, 243, 205, 0.5)",
                        borderColor: "#b45309",
                      }}
                    >
                      <small
                        className="fw-semibold"
                        style={{ color: "#78350f" }}
                      >
                        Note: The amount added needs to be the End of Day (EOD)
                        balance of the date selected.
                      </small>
                    </div>
                  </CheckPermission>
                </div>

                <CheckPermission
                  accessRolePermission={roles?.permissions}
                  permission={"create"}
                  subAccess={"CASHBALANCE"}
                >
                  <Button
                    color="primary"
                    type="submit"
                    className="w-100 mt-auto"
                    disabled={formik.isSubmitting || !formik.isValid}
                  >
                    {formik.isSubmitting ? (
                      <Spinner size="sm" />
                    ) : (
                      <>
                        <Check size={18} className="me-2" />
                        Set Balance
                      </>
                    )}
                  </Button>
                </CheckPermission>
              </Form>
            </CardBody>
          </Card>
        </Col>
        <Col lg={8}>
          <Card className="h-100 shadow-sm">
            <CardBody className="d-flex flex-column justify-content-center text-center p-4 h-100">
              <CardTitle tag="h5" className="fw-semibold text-secondary mb-3">
                {hasSelectedCenter
                  ? "Current Base Balance"
                  : "Balance Information"}
              </CardTitle>

              {!hasSelectedCenter ? (
                <div className="py-4 flex-grow-1 d-flex align-items-center justify-content-center">
                  <p className="lead text-muted">
                    Please select a center to view its current base balance
                    information.
                  </p>
                </div>
              ) : loading ? (
                <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                  <Spinner color="primary" />
                </div>
              ) : lastBaseBalance ? (
                <div className="py-4 flex-grow-1 d-flex flex-column justify-content-center">
                  <p className="text-muted mb-1">
                    Current EOD Balance for{" "}
                    <span className="fw-bold text-primary">
                      {selectedCenterName}
                    </span>
                  </p>
                  <p className="text-muted small mb-3">
                    Last updated on{" "}
                    <span className="fw-bold">
                      {moment(lastBaseBalance.date).format("lll")}
                    </span>
                  </p>
                  <h1 className="fw-bold text-dark display-4">
                    ₹
                    {lastBaseBalance.amount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </h1>
                  {lastBaseBalance.attachment && (
                    <p
                      className="text-center text-primary"
                      style={{ textDecoration: "underline", cursor: "pointer" }}
                      onClick={() => downloadFile(lastBaseBalance.attachment)}
                    >
                      <FileText size={14} className="me-1" />
                      {lastBaseBalance.attachment.originalName}
                    </p>
                  )}
                </div>
              ) : (
                <div className="py-4 flex-grow-1 d-flex align-items-center justify-content-center">
                  <div>
                    <p className="text-muted mb-3">
                      No base balance found for{" "}
                      <span className="fw-bold text-primary">
                        {selectedCenterName}
                      </span>
                    </p>
                    <p className="text-warning">
                      This center doesn't have a base balance set yet. Please
                      enter the first EOD balance using the form.
                    </p>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

BaseBalance.propTypes = {
  centerAccess: PropTypes.array,
  centers: PropTypes.array,
  loading: PropTypes.bool,
  baseBalance: PropTypes.array,
  lastBaseBalance: PropTypes.object,
};

const mapStateToProps = (state) => ({
  centers: state.Center.data,
  centerAccess: state.User?.centerAccess,
  loading: state.Cash.loading,
  baseBalance: state.Cash.baseBalance,
  lastBaseBalance: state.Cash.lastBaseBalance,
});

export default connect(mapStateToProps)(BaseBalance);
