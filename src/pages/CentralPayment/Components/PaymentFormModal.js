import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner, Form, FormGroup, Label, Input, Row, Col } from "reactstrap";
import { capitalizeWords } from "../../../utils/toCapitalize";
import PropTypes from "prop-types";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ExpandableText } from "../../../Components/Common/ExpandableText";
import { downloadFile } from "../../../Components/Common/downloadFile";
import { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { getPaymentDetails } from "../../../store/features/centralPayment/centralPaymentSlice";
import { Check, Pencil, X } from "lucide-react";
import moment from "moment";
import SpendingForm from "./SpendingForm";
import PreviewFile from "../../../Components/Common/PreviewFile";
import { categoryOptions } from "../../../Components/constants/centralPayment";

const paymentValidationSchema = Yup.object({
    transactionId: Yup.string()
        .required("Transaction ID is required to complete the UTR confirmation")
        .min(3, "Transaction ID must be at least 3 characters")
        .max(50, "Transaction ID must be less than 50 characters"),
    currentPaymentStatus: Yup.string()
        .required("Approval status is required")
        .oneOf(["COMPLETED", "PENDING", "REJECTED"], "Invalid Current Payment status"),
});


const PaymentFormModal = ({
    isOpen,
    toggle,
    item,
    onConfirm,
    isProcessing,
    paymentDetails,
    loading,
    mode,
    hasCreatePermission
}) => {
    const dispatch = useDispatch();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);


    const formik = useFormik({
        initialValues: {
            transactionId: "",
            currentPaymentStatus: "PENDING"
        },
        validationSchema: paymentValidationSchema,
        onSubmit: (values) => {
            onConfirm(values);
        },
        enableReinitialize: true
    });

    useEffect(() => {
        if (isOpen && item?._id) {
            dispatch(getPaymentDetails(item._id));
        }
    }, [isOpen]);


    useEffect(() => {
        if (paymentDetails && paymentDetails._id === item?._id) {
            formik.setValues({
                transactionId: paymentDetails.transactionId || "",
                currentPaymentStatus: paymentDetails.currentPaymentStatus || "PENDING"
            });
        }
    }, [paymentDetails, item?._id]);

    const handleToggle = () => {
        formik.resetForm();
        closePreview();
        toggle();
    };


    const handleSpendingUpdate = () => {
        setIsEditModalOpen(false);
        dispatch(getPaymentDetails(item._id));

    }

    const openPreview = (file) => {
        setPreviewFile(file);
        setPreviewOpen(true);
    };

    const closePreview = () => {
        setPreviewOpen(false);
        setPreviewFile(null);
    };

    if (loading) {
        return (
            <Modal isOpen={isOpen} toggle={handleToggle}>
                <ModalHeader toggle={handleToggle}>
                    Process Payment
                </ModalHeader>
                <ModalBody>
                    <div className="text-center py-4">
                        <Spinner color="primary" />
                        <div className="mt-2">Loading payment details...</div>
                    </div>
                </ModalBody>
            </Modal>
        );
    }

    return (
        <>
            <Modal size="xl" isOpen={isOpen} toggle={handleToggle}>
                <Form onSubmit={formik.handleSubmit}>
                    <ModalHeader toggle={handleToggle}>
                        <div className="d-flex align-items-center gap-2">
                            {
                                hasCreatePermission
                                    ? (mode === "approval" ? "Process Approval" : "UTR Confirmation")
                                    : "Expense Overview"
                            }
                        </div>
                    </ModalHeader>
                    <ModalBody>
                        <div className="mb-3">
                            <p>
                                {
                                    hasCreatePermission
                                    && (mode === "approval"
                                        ? "Expense Details"
                                        : "Please provide payment details for")
                                }
                            </p>
                            <div className="border p-3 rounded bg-light">
                                <Row>
                                    <Col md={6}>
                                        <p className="mb-0"><strong>ID:</strong> {paymentDetails?.id || "-"}</p>
                                        <p className="mb-0"><strong>Name:</strong> {paymentDetails?.name || "-"}</p>
                                        <p className="mb-0"><strong>Center:</strong> {paymentDetails?.center?.title.toUpperCase() || "UNKNOWN CENTER"}</p>
                                        <p className="mb-0"><strong>Items:</strong> {paymentDetails?.items || "-"}</p>
                                        <p className="mb-0"><strong>Item Category:</strong> {categoryOptions.find(
                                            (option) => option.value === paymentDetails?.category
                                        )?.label || "-"}</p>
                                        {paymentDetails?.category === "OTHERS" && <p className="mb-0"><strong>Item Category Details:</strong><ExpandableText text={paymentDetails?.otherCategory || "-"} /></p>}
                                        <p className="mb-0"><strong>Total Amount (with GST):</strong> ₹{paymentDetails?.totalAmountWithGST?.toFixed(2) || "0.00"}</p>
                                        <p className="mb-0"><strong>GST Amount:</strong> ₹{paymentDetails?.GSTAmount?.toFixed(2) || "0.00"}</p>
                                        <p className="mb-0"><strong>Amount To Pay(TDS Deducted):</strong> ₹{paymentDetails?.finalAmount?.toFixed(2) || "0.00"}</p>
                                        <p className="mb-0"><strong>Vendor:</strong> {paymentDetails?.vendor || "-"}</p>
                                        {paymentDetails?.invoiceNo && (
                                            <p className="mb-0"><strong>Invoice:</strong> {paymentDetails.invoiceNo || "-"}</p>
                                        )}
                                        {paymentDetails?.date && (
                                            <p className="mb-0"><strong>Date:</strong> {moment(paymentDetails.date).format("lll")}</p>
                                        )}
                                    </Col>

                                    <Col md={6}>
                                        {paymentDetails?.description && (
                                            <p className="mb-0">
                                                <strong>Description:</strong> <ExpandableText text={paymentDetails.description || "-"} />
                                            </p>
                                        )}
                                        {paymentDetails?.eNet && (
                                            <p className="mb-0 text-break">
                                                <strong>E-Net:</strong>{" "}
                                                <span className="border-bottom border-dark">{paymentDetails.eNet}</span>
                                            </p>
                                        )}
                                        {paymentDetails?.TDSRate !== null &&
                                            paymentDetails?.TDSRate !== undefined && (
                                                <p className="mb-0">
                                                    <strong>TDS Rate:</strong> {paymentDetails.TDSRate}
                                                </p>
                                            )}
                                        {paymentDetails?.transactionType && (
                                            <p className="mb-0"><strong>Transaction Type:</strong> {paymentDetails.transactionType}</p>
                                        )}
                                        {paymentDetails?.bankDetails?.accountHolderName && (
                                            <p className="mb-0"><strong>Account Holder:</strong> {paymentDetails.bankDetails.accountHolderName}</p>
                                        )}
                                        {paymentDetails?.bankDetails?.accountNo && (
                                            <p className="mb-0"><strong>Account No:</strong> {paymentDetails.bankDetails.accountNo}</p>
                                        )}
                                        {paymentDetails?.bankDetails?.IFSCCode && (
                                            <p className="mb-0"><strong>IFSC Code:</strong> {paymentDetails.bankDetails.IFSCCode}</p>
                                        )}
                                        <p className="mb-0"><strong>Initial Payment Status:</strong> {(paymentDetails?.initialPaymentStatus === "PENDING" ? "To Be Paid" : paymentDetails?.initialPaymentStatus === "COMPLETED" ? "Paid" : "-")}</p>
                                    </Col>
                                </Row>

                                {paymentDetails?.attachments && paymentDetails?.attachments.length > 0 && (
                                    <div className="mt-3 pt-3 border-top">
                                        <strong>{capitalizeWords(paymentDetails?.attachmentType)}</strong>
                                        <div>
                                            {paymentDetails?.attachments.map((attachment, index) => (
                                                <p
                                                    key={attachment._id || index}
                                                    onClick={() => openPreview(attachment)}
                                                    className="text-primary text-decoration-underline cursor-pointer mb-1"
                                                >
                                                    {attachment.originalName}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {mode === "UTRConfirmation" && hasCreatePermission && (
                            <>
                                <Row>
                                    <Col md={6}>
                                        <FormGroup>
                                            <Label for="transactionId">
                                                Transaction ID/UTR <span className="text-danger">*</span>
                                            </Label>
                                            <Input
                                                type="text"
                                                id="transactionId"
                                                name="transactionId"
                                                placeholder="Enter transaction ID"
                                                value={formik.values.transactionId}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                invalid={formik.touched.transactionId && Boolean(formik.errors.transactionId)}
                                                disabled={isProcessing.id === item._id && isProcessing.type === "PROCESSING"}
                                            />
                                            {formik.touched.transactionId && formik.errors.transactionId && (
                                                <div className="text-danger small mt-1">
                                                    {formik.errors.transactionId}
                                                </div>
                                            )}
                                        </FormGroup>
                                    </Col>
                                    {/* <Col md={3}>
                                        <FormGroup>
                                            <Label for="currentPaymentStatus">
                                                Current Payment Status *
                                            </Label>
                                            <Input
                                                type="select"
                                                id="currentPaymentStatus"
                                                name="currentPaymentStatus"
                                                value={formik.values.currentPaymentStatus}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                invalid={formik.touched.currentPaymentStatus && Boolean(formik.errors.currentPaymentStatus)}
                                                disabled={isProcessing.id === item._id && isProcessing.type === "PROCESSING"}
                                            >
                                                <option value="PENDING">Pending</option>
                                                <option value="COMPLETED">Completed</option>
                                                <option value="REJECTED">Rejected</option>
                                            </Input>
                                            {formik.touched.currentPaymentStatus && formik.errors.currentPaymentStatus && (
                                                <div className="text-danger small mt-1">
                                                    {formik.errors.currentPaymentStatus}
                                                </div>
                                            )}
                                        </FormGroup>
                                    </Col> */}
                                </Row>

                                <p className="mt-3 text-warning small">
                                    <strong>Note:</strong> Please verify all details before submitting. This action cannot be undone.
                                </p>
                            </>
                        )}
                    </ModalBody>

                    <ModalFooter>
                        {hasCreatePermission && (
                            mode === "approval" ? (
                                <div className="d-flex justify-content-end">
                                    <Button
                                        size="sm"
                                        color="primary"
                                        className="me-2"
                                        outline
                                        onClick={() => setIsEditModalOpen(true)}
                                    >
                                        <Pencil size={16} className="me-1" />
                                        Edit Expense
                                    </Button>

                                    <Button
                                        onClick={() => onConfirm(item._id, "REJECTED")}
                                        color="danger"
                                        size="sm"
                                        className="me-2 d-flex align-items-center text-white"
                                        disabled={isProcessing.id === item._id && isProcessing.type === "REJECTED"}
                                    >
                                        {isProcessing.id === item._id && isProcessing.type === "REJECTED" ? (
                                            <Spinner size="sm" color="light" className="me-1" />
                                        ) : (
                                            <X size={16} className="me-1" />
                                        )}
                                        Reject
                                    </Button>

                                    <Button
                                        onClick={() => onConfirm(item._id, "APPROVED")}
                                        color="success"
                                        size="sm"
                                        className="d-flex align-items-center text-white"
                                        disabled={isProcessing.id === item._id && isProcessing.type === "APPROVED"}
                                    >
                                        {isProcessing.id === item._id && isProcessing.type === "APPROVED" ? (
                                            <Spinner size="sm" color="light" className="me-1" />
                                        ) : (
                                            <Check size={16} className="me-1" />
                                        )}
                                        Approve
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    {/* <Button
                                        type="button"
                                        color="secondary"
                                        onClick={handleToggle}
                                        disabled={isProcessing.id === item._id && isProcessing.type === "PROCESSING"}
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        type="submit"
                                        color="primary"
                                        className="text-white"
                                        disabled={
                                            (isProcessing.id === item._id && isProcessing.type === "PROCESSING") ||
                                            !formik.isValid ||
                                            formik.values.currentPaymentStatus === "PENDING" ||
                                            (formik.values.currentPaymentStatus === "COMPLETED" &&
                                                !formik.values.transactionId.trim())
                                        }
                                    >
                                        {(isProcessing.id === item._id && isProcessing.type === "PROCESSING") ? (
                                            <>
                                                <Spinner size="sm" className="me-2" />
                                                Processing...
                                            </>
                                        ) : (
                                            "Process Payment"
                                        )}
                                    </Button> */}
                                    <div className="d-flex justify-content-end gap-2">
                                        <Button
                                            color="danger"
                                            size="sm"
                                            className="d-flex align-items-center text-white"
                                            disabled={isProcessing.id === item._id && isProcessing.type === "REJECTED"}
                                            onClick={() => {
                                                onConfirm({
                                                    transactionId: formik.values.transactionId,
                                                    currentPaymentStatus: "REJECTED"
                                                });
                                            }}
                                        >
                                            {isProcessing.id === item._id && isProcessing.type === "REJECTED" ? (
                                                <Spinner size="sm" color="light" className="me-1" />
                                            ) : (
                                                <X size={16} className="me-1" />
                                            )}
                                            Reject
                                        </Button>

                                        <Button
                                            color="success"
                                            size="sm"
                                            className="d-flex align-items-center text-white"
                                            disabled={
                                                !formik.values.transactionId.trim() ||
                                                (isProcessing.id === item._id && isProcessing.type === "COMPLETED")
                                            }
                                            onClick={() => {
                                                onConfirm({
                                                    transactionId: formik.values.transactionId,
                                                    currentPaymentStatus: "COMPLETED"
                                                });
                                            }}
                                        >
                                            {isProcessing.id === item._id && isProcessing.type === "COMPLETED" ? (
                                                <Spinner size="sm" color="light" className="me-1" />
                                            ) : (
                                                <Check size={16} className="me-1" />
                                            )}
                                            Complete
                                        </Button>
                                    </div>
                                </>
                            )
                        )}

                    </ModalFooter>

                </Form>
            </Modal >
            <Modal isOpen={isEditModalOpen} toggle={() => setIsEditModalOpen(false)} size="lg">
                <ModalHeader toggle={() => setIsEditModalOpen(false)}>
                    Edit Spending
                </ModalHeader>

                <ModalBody>
                    <SpendingForm
                        paymentData={paymentDetails}
                        onUpdate={handleSpendingUpdate}
                    />
                </ModalBody>
            </Modal>

            <PreviewFile
                title="Attachment Preview"
                file={previewFile}
                isOpen={previewOpen}
                toggle={closePreview}
            />
        </>

    );
};

PaymentFormModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    item: PropTypes.object.isRequired,
    onConfirm: PropTypes.func.isRequired,
    isProcessing: PropTypes.object,
    loading: PropTypes.bool,
    paymentDetails: PropTypes.object,
    mode: PropTypes.string,
    hasCreatePermission: PropTypes.bool
};


const mapStateToProps = (state) => ({
    loading: state.CentralPayment.paymentDetailsLoading,
    paymentDetails: state.CentralPayment?.paymentDetails
})

export default connect(mapStateToProps)(PaymentFormModal);