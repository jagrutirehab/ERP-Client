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
import { History, Share } from "lucide-react";
import { connect, useDispatch } from "react-redux";
import PropTypes from "prop-types";
import {
  addBankDeposit,
  getLastBankDeposits,
} from "../../../store/features/cashManagement/cashSlice";
import { toast } from "react-toastify";
import FileUpload from "../Components/FileUpload";
import ItemCard from "../Components/ItemCard";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import CheckPermission from "../../../Components/HOC/CheckPermission";

const BankDeposits = ({ centers, centerAccess, deposits, loading }) => {
  const dispatch = useDispatch();

  const centerOptions = centers
    ?.filter((c) => centerAccess.includes(c._id))
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
    hasPermission("CASH", "CASHDEPOSITS", "WRITE") ||
    hasPermission("CASH", "CASHDEPOSITS", "DELETE");

  const hasReadPermission = hasPermission("CASH", "CASHDEPOSITS", "READ");

  const validationSchema = Yup.object({
    center: Yup.string().required("Center is required"),
    amount: Yup.number()
      .required("Amount is required")
      .positive("Amount must be positive")
      .min(0.01, "Amount must be greater than 0"),
    comments: Yup.string()
      .required("Comments are required")
      .min(2, "Comments must be at least 2 characters"),
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
      amount: 0,
      comments: "",
      attachment: null,
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const formData = new FormData();
      formData.append("center", values.center);
      formData.append("amount", Number(values.amount));
      formData.append("comments", values.comments);
      formData.append("attachment", values.attachment);

      try {
        await dispatch(addBankDeposit(formData)).unwrap();
        resetForm();
        setAttachment(null);
        setAttachmentTouched(false);
        toast.success("Deposit added successfully");
      } catch (error) {
        toast.error(error.message || "Failed to add deposit.");
      }
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
    dispatch(
      getLastBankDeposits({ page: 1, limit: 10, centers: centerAccess })
    );
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
      <h5 className="fw-bold mb-3">Bank Deposits</h5>
      <Row>
        <CheckPermission
          accessRolePermission={roles?.permissions}
          permission={"create"}
          subAccess={"CASHDEPOSITS"}
        >
          <Col lg={4} className="mb-4">
            <Card className="h-100 shadow-sm">
              <CardHeader className="bg-transparent border-bottom">
                <h5 className="mb-0 fw-semibold">Add New Deposit</h5>
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
                      Comments *
                    </Label>
                    <Input
                      type="textarea"
                      id="comments"
                      name="comments"
                      rows="3"
                      value={formik.values.comments}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Add a description for this deposit (e.g., Revenue, Client Payment, Investment Return)..."
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
                    <Label className="fw-medium">Attachment *</Label>
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
                        Submit Deposit
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
          subAccess={"CASHDEPOSITS"}
        >
          <Col lg={hasCreatePermission ? 8 : 12}>
            <Card className="h-100 shadow-sm">
              <CardHeader className="bg-transparent border-bottom d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-semibold">
                  <History size={18} className="me-2 text-primary" />
                  Last 10 Deposits
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
                      <p className="h5">Fetching deposits...</p>
                    </div>
                  ) : deposits?.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className="fas fa-piggy-bank fa-3x mb-3"></i>
                      <p className="h5">No deposits recorded yet</p>
                      <p>Start by adding your first deposit using the form.</p>
                    </div>
                  ) : (
                    deposits?.map((deposit) => (
                      <ItemCard
                        key={deposit._id}
                        item={deposit}
                        type={"BANKDEPOSIT"}
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

BankDeposits.prototype = {
  centerAccess: PropTypes.array,
  centers: PropTypes.array,
  loading: PropTypes.bool,
  deposits: PropTypes.array,
};

const mapStateToProps = (state) => ({
  centers: state.Center.data,
  centerAccess: state.User?.centerAccess,
  loading: state.Cash.loading,
  deposits: state.Cash.bankDeposits?.data,
});

export default connect(mapStateToProps)(BankDeposits);
