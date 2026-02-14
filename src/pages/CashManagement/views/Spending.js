import React, { useEffect, useState } from "react";
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
import FileUpload from "../Components/FileUpload";
import ItemCard from "../Components/ItemCard";
import {
  addSpending,
  getLastSpendings,
} from "../../../store/features/cashManagement/cashSlice";
import { toast } from "react-toastify";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import CheckPermission from "../../../Components/HOC/CheckPermission";
import { useAuthError } from "../../../Components/Hooks/useAuthError";

const Spending = ({ centers, centerAccess, spendings, loading }) => {
  const dispatch = useDispatch();
  const handleAuthError = useAuthError();

  const centerOptions = centers
    ?.filter((c) => centerAccess.includes(c._id))
    .filter((c) => c.title?.toLowerCase() !== "online")
    .map((c) => ({
      _id: c._id,
      title: c.title,
    }));

  const [attachment, setAttachment] = useState(null);
  const [attachmentTouched, setAttachmentTouched] = useState(false);
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission, roles } = usePermissions(token);
  const hasCreatePermission =
    hasPermission("CASH", "CASHSPENDING", "WRITE") ||
    hasPermission("CASH", "CASHSPENDING", "DELETE");

  const hasReadPermission = hasPermission("CASH", "CASHSPENDING", "READ");

  const validationSchema = Yup.object({
    center: Yup.string().required("Center is required"),
    summary: Yup.string()
      .required("Summary is required")
      .min(2, "Summary must be at least 2 characters"),
    amount: Yup.number()
      .required("Amount is required")
      .positive("Amount must be positive")
      .min(0.01, "Amount must be greater than 0"),
    comments: Yup.string().max(500, "Comments must not exceed 500 characters"),
    attachment: Yup.mixed()
      .required("Attachment is required")
      .test("fileSize", "File size must be less than 10 MB", (value) => {
        if (!value) return false;
        return value && value.size <= 10 * 1024 * 1024;
      })
      .test("fileType", "Unsupported file format", (value) => {
        if (!value) return false;
        const supportedFormats = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "application/pdf",
        ];
        return value && supportedFormats.includes(value.type);
      }),
  });

  const formik = useFormik({
    initialValues: {
      center: "",
      summary: "",
      amount: 0,
      comments: "",
      attachment: null,
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const formData = new FormData();
      formData.append("center", values.center);
      formData.append("amount", Number(values.amount));
      formData.append("summary", values.summary);
      if (values.comments) {
        formData.append("comments", values.comments);
      }
      formData.append("attachment", attachment);
      try {
        await dispatch(addSpending({ formData, centers: centerAccess })).unwrap();
        resetForm();
        setAttachment(null);
        setAttachmentTouched(false);
        toast.success("spending logged successfully");
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error(error.message || "Failed to log spending.");
        }
      }
      resetForm();
      setAttachment(null);
    },
  });

  useEffect(() => {
    formik.setFieldValue("attachment", attachment);
  }, [attachment]);

  useEffect(() => {
    if (attachmentTouched) {
      formik.validateField("attachment");
    }
  }, [attachment, attachmentTouched]);

  const handleAttachmentChange = (file) => {
    setAttachment(file);
    setAttachmentTouched(true);
  };

  const handleSubmit = (e) => {
    setAttachmentTouched(true);
    formik.handleSubmit(e);
  };

  useEffect(() => {
    if (!hasReadPermission) return;
    const fetchSpendings = async () => {
      try {
        await dispatch(getLastSpendings({ page: 1, limit: 10, centers: centerAccess })).unwrap();
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
          subAccess={"CASHSPENDING"}
        >
          <Col lg={4} className="mb-4">
            <Card className="h-100 shadow-sm">
              <CardHeader className="bg-transparent border-bottom">
                <h5 className="mb-0 fw-semibold">Log New Expense</h5>
              </CardHeader>
              <CardBody>
                <Form onSubmit={handleSubmit}>
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
                    <Label for="summary" className="fw-medium">
                      Summary *
                    </Label>
                    <Input
                      type="text"
                      id="summary"
                      name="summary"
                      value={formik.values.summary}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g., Office Supplies, Client Meeting, Equipment Purchase"
                      className={`form-control ${formik.touched.summary && formik.errors.summary
                        ? "is-invalid"
                        : ""
                        }`}
                    />
                    {formik.touched.summary && formik.errors.summary && (
                      <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {formik.errors.summary}
                      </div>
                    )}
                  </FormGroup>
                  <FormGroup>
                    <Label for="amount" className="fw-medium">
                      Amount *
                    </Label>
                    <Input
                      type="text"
                      id="amount"
                      name="amount"
                      value={formik.values.amount}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="0.00"
                      className={`form-control ${formik.touched.amount && formik.errors.amount
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

                  <FormGroup>
                    <Label for="comments" className="fw-medium">
                      Comments
                    </Label>
                    <Input
                      type="textarea"
                      id="comments"
                      name="comments"
                      rows="3"
                      value={formik.values.comments}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Add extra details, approval information, or notes..."
                      className={`form-control ${formik.touched.comments && formik.errors.comments
                        ? "is-invalid"
                        : ""
                        }`}
                    />
                    {formik.touched.comments && formik.errors.comments && (
                      <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {formik.errors.comments}
                      </div>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label className="fw-medium">
                      Attachment (Receipt/Invoice) *
                    </Label>
                    <FileUpload
                      setAttachment={handleAttachmentChange}
                      attachment={attachment}
                    />
                    {attachmentTouched && formik.errors.attachment && (
                      <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {formik.errors.attachment}
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
                        Log Expense
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
          subAccess={"CASHSPENDING"}
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
                      <p className="h5">No spendings recorded yet</p>
                      <p>Start by logging your first expense using the form.</p>
                    </div>
                  ) : (
                    data?.map((spending) => (
                      <ItemCard
                        key={spending._id}
                        item={spending}
                        type={"SPENDING"}
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
  loading: state.Cash.loading,
  spendings: state.Cash.spendings,
});

export default connect(mapStateToProps)(Spending);
