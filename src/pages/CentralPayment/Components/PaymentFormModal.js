import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner, Form, FormGroup, Label, Input, Row, Col } from "reactstrap";
import { capitalizeWords } from "../../../utils/toCapitalize";
import PropTypes from "prop-types";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ExpandableText } from "../../../Components/Common/ExpandableText";
import { downloadFile } from "../../../Components/Common/downloadFile";
import { useEffect } from "react";
import { connect, useDispatch } from "react-redux";
import { getPaymentDetails } from "../../../store/features/centralPayment/centralPaymentSlice";

const paymentValidationSchema = Yup.object({
    transactionId: Yup.string()
        .required("Transaction ID is required")
        .min(3, "Transaction ID must be at least 3 characters")
        .max(50, "Transaction ID must be less than 50 characters"),
    currentPaymentStatus: Yup.string()
        .required("Approval status is required")
        .oneOf(["COMPLETED", "PENDING"], "Invalid Current Payment status")
});

const PaymentFormModal = ({
    isOpen,
    toggle,
    item,
    onConfirm,
    isProcessing,
    paymentDetails,
    paymentDetailsLoading
}) => {
    const dispatch = useDispatch();

    const formik = useFormik({
        initialValues: {
            transactionId: "",
            approvalPaymentStatus: "PENDING"
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
    }, [isOpen, item?._id, dispatch]);

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
        toggle();
    };


    if (paymentDetailsLoading) {
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
        <Modal size="xl" isOpen={isOpen} toggle={handleToggle}>
            <Form onSubmit={formik.handleSubmit}>
                <ModalHeader toggle={handleToggle}>
                    Process Payment
                </ModalHeader>
                <ModalBody>
                    <div className="mb-3">
                        <p>Please provide payment details for:</p>
                        <div className="border p-3 rounded bg-light">
                            <Row>
                                <Col md={6}>
                                    <p className="mb-0"><strong>Center:</strong> {capitalizeWords(paymentDetails?.center?.title || "Unknown Center")}</p>
                                    <p className="mb-0"><strong>Items:</strong> {capitalizeWords(paymentDetails?.items)}</p>
                                    <p className="mb-0"><strong>Total Amount (with GST):</strong> ₹{paymentDetails?.totalAmountWithGST?.toFixed(2) || "0.00"}</p>
                                    <p className="mb-0"><strong>GST Amount:</strong> ₹{paymentDetails?.GSTAmount?.toFixed(2) || "0.00"}</p>
                                    <p className="mb-0"><strong>Vendor:</strong> {capitalizeWords(paymentDetails?.vendor)}</p>
                                    {paymentDetails?.invoiceNo && (
                                        <p className="mb-0"><strong>Invoice:</strong> {paymentDetails.invoiceNo}</p>
                                    )}
                                </Col>

                                <Col md={6}>
                                    {paymentDetails?.description && (
                                        <p className="mb-0">
                                            <strong>Description:</strong> <ExpandableText text={capitalizeWords(paymentDetails.description)} />
                                        </p>
                                    )}
                                    {paymentDetails?.eNet && (
                                        <p className="mb-0"><strong>E-Net:</strong> <span className="border-bottom border-dark">{paymentDetails.eNet}</span></p>
                                    )}
                                    {paymentDetails?.TDSRate && (
                                        <p className="mb-0"><strong>TDS Rate:</strong> {paymentDetails.TDSRate}</p>
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
                                    <p className="mb-0"><strong>Initial Payment Status:</strong> {capitalizeWords(paymentDetails?.initialPaymentStatus)}</p>
                                </Col>
                            </Row>

                            {paymentDetails?.attachments && paymentDetails?.attachments.length > 0 && (
                                <div className="mt-3 pt-3 border-top">
                                    <strong>{capitalizeWords(paymentDetails?.attachmentType)}</strong>
                                    <div>
                                        {paymentDetails?.attachments.map((attachment, index) => (
                                            <p
                                                key={attachment._id || index}
                                                onClick={() => downloadFile(attachment)}
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

                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="transactionId">
                                    Transaction ID/UTR *
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
                                    disabled={isProcessing}
                                />
                                {formik.touched.transactionId && formik.errors.transactionId && (
                                    <div className="text-danger small mt-1">
                                        {formik.errors.transactionId}
                                    </div>
                                )}
                            </FormGroup>
                        </Col>
                        <Col md={3}>
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
                                    disabled={isProcessing}
                                >
                                    <option value="PENDING">Pending</option>
                                    <option value="COMPLETED">Completed</option>
                                </Input>
                                {formik.touched.currentPaymentStatus && formik.errors.currentPaymentStatus && (
                                    <div className="text-danger small mt-1">
                                        {formik.errors.currentPaymentStatus}
                                    </div>
                                )}
                            </FormGroup>
                        </Col>
                    </Row>

                    <p className="mt-3 text-warning small">
                        <strong>Note:</strong> Please verify all details before submitting. This action cannot be undone.
                    </p>
                </ModalBody>
                <ModalFooter>
                    <Button
                        type="button"
                        color="secondary"
                        onClick={handleToggle}
                        disabled={isProcessing}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        color="primary"
                        disabled={isProcessing || !formik.isValid}
                    >
                        {isProcessing ? (
                            <>
                                <Spinner size="sm" className="me-2" />
                                Processing...
                            </>
                        ) : (
                            'Process Payment'
                        )}
                    </Button>
                </ModalFooter>
            </Form>
        </Modal>
    );
};

PaymentFormModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    item: PropTypes.object.isRequired,
    onConfirm: PropTypes.func.isRequired,
    isProcessing: PropTypes.bool,
    loading: PropTypes.bool,
    paymentDetails: PropTypes.object
};


const mapStateToProps = (state) => ({
    loading: state.CentralPayment.paymentDetailsLoading,
    paymentDetails: state.CentralPayment?.paymentDetails
})

export default connect(mapStateToProps)(PaymentFormModal);