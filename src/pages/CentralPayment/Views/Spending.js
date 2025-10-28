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

const Spending = ({ centers, centerAccess, spendings, loading }) => {
  const dispatch = useDispatch();
  const handleAuthError = useAuthError();

  const centerOptions = centers
    ?.filter((c) => centerAccess.includes(c._id))
    .map((c) => ({
      _id: c._id,
      title: c.title,
    }));

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission, roles } = usePermissions(token);
  const hasCreatePermission =
    hasPermission("CENTRALPAYMENT", "CENTRALPAYMENTSPENDING", "WRITE") ||
    hasPermission("CENTRALPAYMENT", "CENTRALPAYMENTSPENDING", "DELETE");

  const hasReadPermission = hasPermission("CENTRALPAYMENT", "CENTRALPAYMENTSPENDING", "READ");

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    center: Yup.string().required("Center is required"),
    items: Yup.string().required("Items are required"),
    date: Yup.string().required("Transaction date is required"),
    description: Yup.string().nullable(),
    vendor: Yup.string().required("Vendor is required"),
    invoiceNo: Yup.string().nullable(),
    totalAmountWithGST: Yup.number()
      .typeError("Total amount must be a number")
      .required("Total amount with GST is required"),
    GSTAmount: Yup.number()
      .typeError("GST amount must be a number")
      .required("GST amount is required"),
    IFSCCode: Yup.string().nullable(),
    accountHolderName: Yup.string().nullable(),
    accountNo: Yup.string().nullable(),
    TDSRate: Yup.number()
      .typeError("TDS Rate must be a number")
      .nullable(),
    initialPaymentStatus: Yup.string()
      .oneOf(["PENDING", "COMPLETED"], "Invalid payment status")
      .required("Payment status is required"),
    attachmentType: Yup.string().oneOf(["INVOICE/BILL", "QUOTATION", "PROFORMA_INVOICE", "VOUCHER"], "Invalid attachment type").required("Attachment type is required"),
    attachments: Yup.array()
      .test("fileSize", "Each file must be under 100MB", (files) => {
        if (!files || files.length === 0) return true;
        return files.every((f) => f.size <= 100 * 1024 * 1024);
      })
      .test("fileCount", "Upload at least one file", (files) => {
        return files && files.length > 0;
      }),

  });

  const formik = useFormik({
    initialValues: {
      name: "",
      center: "",
      items: "",
      date: format(new Date(), "yyyy-MM-dd"),
      description: "",
      vendor: "",
      invoiceNo: "",
      totalAmountWithGST: 0,
      GSTAmount: 0,
      IFSCCode: "",
      accountHolderName: "",
      accountNo: "",
      initialPaymentStatus: "",
      attachmentType: "",
      attachments: []
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const formData = new FormData();

      Object.entries(values).forEach(([key, val]) => {
        if (key === "attachments") return;
        if (key === "date") {
          const now = new Date();
          const spendingDate = new Date(val);
          spendingDate.setHours(
            now.getHours(),
            now.getMinutes(),
            now.getSeconds()
          );
          formData.append(key, spendingDate.toISOString());
        } else if (val !== undefined && val !== null && val !== "") {
          formData.append(key, val);
        }
      });

      values.attachments.forEach(f => formData.append("attachments", f));

      try {
        await dispatch(addPayment(formData)).unwrap();
        toast.success("Spending request submitted successfully");
        resetForm();
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error(error.message || "Failed to submit spending request");
        }
      }
    },
  });

  const handleSubmit = (e) => {
    formik.handleSubmit(e);
  };

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
                <Form onSubmit={handleSubmit}>
                  <FormGroup>
                    <Label for="name" className="fw-medium">
                      Name *
                    </Label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`form-control ${formik.touched.name && formik.errors.name
                        ? "is-invalid"
                        : ""
                        }`}
                    />
                    {formik.touched.name && formik.errors.name && (
                      <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {formik.errors.name}
                      </div>
                    )}
                  </FormGroup>
                  <FormGroup>
                    <Label for="center" className="fw-medium">
                      Center *
                    </Label>
                    <Input
                      type="select"
                      id="center"
                      name="center"
                      value={formik.values.center}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`form-select ${formik.touched.center && formik.errors.center
                        ? "is-invalid"
                        : ""
                        }`}
                    >
                      <option value="" disabled>
                        Select a Center
                      </option>
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
                  <FormGroup>
                    <Label for="items" className="fw-medium">
                      Items *
                    </Label>
                    <Input
                      type="text"
                      id="items"
                      name="items"
                      value={formik.values.items}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`form-control ${formik.touched.items && formik.errors.items
                        ? "is-invalid"
                        : ""
                        }`}
                    />
                    {formik.touched.items && formik.errors.items && (
                      <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {formik.errors.items}
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
                      className={`form-control ${formik.touched.date && formik.errors.date
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
                    <Label for="description" className="fw-medium">
                      Description
                    </Label>
                    <Input
                      type="textarea"
                      id="description"
                      name="description"
                      rows="3"
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`form-control ${formik.touched.description && formik.errors.description
                        ? "is-invalid"
                        : ""
                        }`}
                    />
                    {formik.touched.description && formik.errors.description && (
                      <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {formik.errors.description}
                      </div>
                    )}
                  </FormGroup>
                  <FormGroup>
                    <Label for="vendor" className="fw-medium">
                      Vendor *
                    </Label>
                    <Input
                      type="text"
                      id="vendor"
                      name="vendor"
                      value={formik.values.vendor}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`form-control ${formik.touched.vendor && formik.errors.vendor
                        ? "is-invalid"
                        : ""
                        }`}
                    />
                    {formik.touched.vendor && formik.errors.vendor && (
                      <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {formik.errors.vendor}
                      </div>
                    )}
                  </FormGroup>
                  <FormGroup>
                    <Label for="invoiceNo" className="fw-medium">
                      Invoice No
                    </Label>
                    <Input
                      type="text"
                      id="invoiceNo"
                      name="invoiceNo"
                      value={formik.values.invoiceNo}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`form-control ${formik.touched.invoiceNo && formik.errors.invoiceNo
                        ? "is-invalid"
                        : ""
                        }`}
                    />
                    {formik.touched.invoiceNo && formik.errors.invoiceNo && (
                      <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {formik.errors.invoiceNo}
                      </div>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label for="totalAmountWithGST" className="fw-medium">
                      Total Amount including GST *
                    </Label>
                    <Input
                      type="text"
                      id="totalAmountWithGST"
                      name="totalAmountWithGST"
                      value={formik.values.totalAmountWithGST}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="0.00"
                      className={`form-control ${formik.touched.totalAmountWithGST && formik.errors.totalAmountWithGST
                        ? "is-invalid"
                        : ""
                        }`}
                    />
                    {formik.touched.totalAmountWithGST && formik.errors.totalAmountWithGST && (
                      <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {formik.errors.totalAmountWithGST}
                      </div>
                    )}
                  </FormGroup>
                  <FormGroup>
                    <Label for="GSTAmount" className="fw-medium">
                      GST Amount (Mention amount from the bill, dont mention the %) *
                    </Label>
                    <Input
                      type="text"
                      id="GSTAmount"
                      name="GSTAmount"
                      value={formik.values.GSTAmount}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="0.00"
                      className={`form-control ${formik.touched.GSTAmount && formik.errors.GSTAmount
                        ? "is-invalid"
                        : ""
                        }`}
                    />
                    {formik.touched.GSTAmount && formik.errors.GSTAmount && (
                      <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {formik.errors.GSTAmount}
                      </div>
                    )}
                  </FormGroup>
                  <FormGroup>
                    <Label for="IFSCCode" className="fw-medium">
                      Bank IFSC Code
                    </Label>
                    <Input
                      type="text"
                      id="IFSCCode"
                      name="IFSCCode"
                      value={formik.values.IFSCCode}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`form-control ${formik.touched.IFSCCode && formik.errors.IFSCCode
                        ? "is-invalid"
                        : ""
                        }`}
                    />
                    {formik.touched.IFSCCode && formik.errors.IFSCCode && (
                      <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {formik.errors.IFSCCode}
                      </div>
                    )}
                  </FormGroup>
                  <FormGroup>
                    <Label for="accountHolderName" className="fw-medium">
                      Account Holder Name
                    </Label>
                    <Input
                      type="text"
                      id="accountHolderName"
                      name="accountHolderName"
                      value={formik.values.accountHolderName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`form-control ${formik.touched.accountHolderName && formik.errors.accountHolderName
                        ? "is-invalid"
                        : ""
                        }`}
                    />
                    {formik.touched.accountHolderName && formik.errors.accountHolderName && (
                      <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {formik.errors.accountHolderName}
                      </div>
                    )}
                  </FormGroup>
                  <FormGroup>
                    <Label for="accountNo" className="fw-medium">
                      Account No
                    </Label>
                    <Input
                      type="text"
                      id="accountNo"
                      name="accountNo"
                      value={formik.values.accountNo}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`form-control ${formik.touched.accountNo && formik.errors.accountNo
                        ? "is-invalid"
                        : ""
                        }`}
                    />
                    {formik.touched.accountNo && formik.errors.accountNo && (
                      <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {formik.errors.accountNo}
                      </div>
                    )}
                  </FormGroup>
                  <FormGroup>
                    <Label for="TDSRate" className="fw-medium">
                      Rate of TDS (%) (Just write the no. Eg. in case of 10% TDS, mention 10 and not 0.1)
                    </Label>
                    <Input
                      type="text"
                      id="TDSRate"
                      name="TDSRate"
                      value={formik.values.TDSRate}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`form-control ${formik.touched.TDSRate && formik.errors.TDSRate
                        ? "is-invalid"
                        : ""
                        }`}
                    />
                    {formik.touched.TDSRate && formik.errors.TDSRate && (
                      <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {formik.errors.TDSRate}
                      </div>
                    )}
                  </FormGroup>
                  <FormGroup>
                    <Label className="fw-medium">Status of the Payment *</Label>
                    <div>
                      <FormGroup check inline>
                        <Input
                          type="radio"
                          id="paid"
                          name="initialPaymentStatus"
                          value="COMPLETED"
                          checked={formik.values.initialPaymentStatus === "COMPLETED"}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        <Label for="paid" check>
                          Paid
                        </Label>
                      </FormGroup>

                      <FormGroup check inline>
                        <Input
                          type="radio"
                          id="pending"
                          name="initialPaymentStatus"
                          value="PENDING"
                          checked={formik.values.initialPaymentStatus === "PENDING"}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        <Label for="pending" check>
                          To be Paid
                        </Label>
                      </FormGroup>
                    </div>

                    {formik.touched.initialPaymentStatus && formik.errors.initialPaymentStatus && (
                      <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {formik.errors.initialPaymentStatus}
                      </div>
                    )}
                  </FormGroup>
                  <FormGroup>
                    <Label className="fw-medium">
                      You need to upload at least one of the following *
                    </Label>

                    <div className="d-flex flex-wrap gap-3 mt-2">
                      <FormGroup check>
                        <Input
                          type="radio"
                          id="invoice-bill"
                          name="attachmentType"
                          value="INVOICE/BILL"
                          checked={formik.values.attachmentType === "INVOICE/BILL"}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        <Label for="invoice-bill" check>
                          Invoice/Bill
                        </Label>
                      </FormGroup>

                      <FormGroup check>
                        <Input
                          type="radio"
                          id="quotation"
                          name="attachmentType"
                          value="QUOTATION"
                          checked={formik.values.attachmentType === "QUOTATION"}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        <Label for="quotation" check>
                          Quotation
                        </Label>
                      </FormGroup>

                      <FormGroup check>
                        <Input
                          type="radio"
                          id="performa-invoice"
                          name="attachmentType"
                          value="PROFORMA_INVOICE"
                          checked={formik.values.attachmentType === "PROFORMA_INVOICE"}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        <Label for="performa-invoice" check>
                          Performa Invoice
                        </Label>
                      </FormGroup>

                      <FormGroup check>
                        <Input
                          type="radio"
                          id="voucher"
                          name="attachmentType"
                          value="VOUCHER"
                          checked={formik.values.attachmentType === "VOUCHER"}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        <Label for="voucher" check>
                          Voucher
                        </Label>
                      </FormGroup>
                    </div>

                    {formik.touched.attachmentType && formik.errors.attachmentType && (
                      <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {formik.errors.attachmentType}
                      </div>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label className="fw-medium">
                      Upload Attachment *
                    </Label>
                    <FileUpload
                      files={formik.values.attachments || []}
                      setFiles={(files) => formik.setFieldValue("attachments", files)}
                    />
                    {formik.touched.attachments && formik.errors.attachments && (
                      <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {formik.errors.attachments}
                      </div>
                    )}
                  </FormGroup>

                  <Button
                    color="primary"
                    type="submit"
                    className="w-100"
                    disabled={formik.isSubmitting}
                  >
                    {formik.isSubmitting ? (
                      <Spinner size="sm" className="me-2" />
                    ) : (
                      <>
                        <Share size={16} className="me-2" />
                        Submit for Approval
                      </>
                    )}
                  </Button>

                </Form>
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
                  ) : spendings?.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <Receipt size={48} className="mb-3" />
                      <p className="h5">No spending requests yet</p>
                      <p>Start by adding your first spending request using the form.</p>
                    </div>
                  ) : (
                    spendings?.map((spending) => (
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
  spendings: PropTypes.array,
};

const mapStateToProps = (state) => ({
  centers: state.Center.data,
  centerAccess: state.User?.centerAccess,
  loading: state.CentralPayment.loading,
  spendings: state.CentralPayment.spendings?.data,
});

export default connect(mapStateToProps)(Spending);
