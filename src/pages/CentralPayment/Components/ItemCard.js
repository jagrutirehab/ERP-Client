import React from "react";
import moment from "moment";
import { capitalizeWords } from "../../../utils/toCapitalize";
import { Badge, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap";
import { Calendar, Tag, Check, X, CheckCheck } from "lucide-react";
import PropTypes from "prop-types";
import { ExpandableText } from "../../../Components/Common/ExpandableText";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { editCentralPayment } from "../../../store/features/centralPayment/centralPaymentSlice";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { toast } from "react-toastify";
import PaymentFormModal from "./PaymentFormModal";
import AttachmentCell from "./AttachmentCell";

const ItemCard = ({ item, flag, border = false, hasCreatePermission, selected, onSelect, showSelect = false }) => {
    const dispatch = useDispatch();
    const [updating, setUpdating] = useState({ id: null, type: null });
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const handleAuthError = useAuthError();

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case "APPROVED":
                return "success";
            case "PENDING":
                return "warning";
            case "REJECTED":
                return "danger";
            default:
                return "secondary";
        }
    };

    const handleUpdateApprovalStatus = async (paymentId, approvalStatus) => {
        setUpdating({ id: paymentId, type: approvalStatus });
        try {
            await dispatch(editCentralPayment({ paymentId, approvalStatus })).unwrap();
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error.message || "Failed to update approval Status.");
            }
        } finally {
            setUpdating({ id: null, type: null });
        }
    }

    const handleProcessPayment = async (formData) => {
        setUpdating({ id: item._id, type: "PROCESSING" });
        try {
            await dispatch(editCentralPayment({
                paymentId: item._id,
                transactionId: formData.transactionId,
                currentPaymentStatus: formData.currentPaymentStatus
            })).unwrap();

            toast.success(`Payment ${formData.currentPaymentStatus.toLowerCase()} successfully!`);
            setIsPaymentModalOpen(false);
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error.message || "Failed to process payment.");
            }
        } finally {
            setUpdating({ id: null, type: null });
        }
    }

    const openPaymentModal = () => {
        setIsPaymentModalOpen(true);
    }

    const closePaymentModal = () => {
        setIsPaymentModalOpen(false);
    }

    return (
        <React.Fragment>
            <Card
                className={`mb-3 shadow-sm hover-shadow transition-all ${border ? 'border-1' : 'border-0'}`}
                style={{
                    position: "relative",
                    ...(flag === "paymentProcessing" && { minHeight: 265 })
                }}
            >
                <CardBody className="py-3" style={{ position: "relative", paddingTop: 28 }}>
                    {showSelect && (
                        <div
                            style={{
                                position: "absolute",
                                top: 12,
                                right: 12,
                                zIndex: 50,
                            }}
                        >
                            <label
                                style={{
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center"
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={selected}
                                    onChange={() => onSelect(item._id)}
                                    style={{
                                        opacity: 0,
                                        position: "absolute",
                                        width: 0,
                                        height: 0,
                                        cursor: "pointer"
                                    }}
                                />

                                <span
                                    style={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: "50%",
                                        border: selected ? "2px solid #28a745" : "2px solid #aaa",
                                        backgroundColor: selected ? "#28a745" : "transparent",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        transition: "all 0.15s ease"
                                    }}
                                >
                                    <span
                                        style={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: "50%",
                                            backgroundColor: "white",
                                            opacity: selected ? 1 : 0,
                                            transition: "opacity 0.15s ease"
                                        }}
                                    />
                                </span>
                            </label>
                        </div>
                    )}
                    <Row className="align-items-center">
                        <Col md={8}>
                            <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
                                <Badge color="primary" className="me-1">
                                    {capitalizeWords(item.center?.title || "Unknown Center")}
                                </Badge>

                                <Badge color={getStatusBadgeColor(item.approvalStatus)} className="me-2">
                                    <Tag size={12} className="me-1" />
                                    {capitalizeWords(item.approvalStatus || "Unknown")}
                                </Badge>

                                <div className="d-flex align-items-center text-muted">
                                    <Calendar size={14} className="me-1" />
                                    <i>{moment(item.date).format("lll")}</i>
                                </div>
                            </div>

                            {item.items && (
                                <h6 className="mb-1 fw-bold text-dark">
                                    {capitalizeWords(item.items)}
                                </h6>
                            )}

                            {item.description && (
                                <ExpandableText
                                    text={capitalizeWords(item.description)} limit={20}
                                    className="mb-2"
                                />
                            )}

                            {item.eNet && (
                                <p>
                                    <strong>E-Net: </strong><span className="border-bottom border-dark"><ExpandableText text={item.eNet} limit={140} /></span>
                                </p>
                            )}

                            {item.attachments && item.attachments.length > 0 && (
                                <div className="mt-2">
                                    <AttachmentCell attachments={item.attachments} />
                                </div>
                            )}
                        </Col>

                        <Col md={4} className="text-end">
                            <div className="d-flex flex-column align-items-end">
                                <span className="h5 mb-0 fw-bold text-dark">
                                    ₹{item.totalAmountWithGST?.toFixed(2) || "0.00"}
                                </span>
                                {item.totalAmountWithGST && (
                                    <small className="text-muted mt-1">
                                        Total with GST
                                    </small>
                                )}
                                <span className={`mt-1 ${item.initialPaymentStatus === "PENDING" ? "text-danger fw-bold fs-6" : "text-success fw-bold fs-6"}`}>
                                    {item.initialPaymentStatus === "PENDING" ? "To Be Paid" : "Paid"}
                                </span>
                            </div>
                        </Col>
                    </Row>
                    {flag === "approval" && hasCreatePermission && (
                        <>
                            <div className="my-3 border-1 border-top border-dashed"></div>
                            <div className="d-flex justify-content-end">
                                <Button
                                    onClick={() => handleUpdateApprovalStatus(item._id, "REJECTED")}
                                    color="danger"
                                    size="sm"
                                    className="me-2 d-flex align-items-center text-white"
                                    disabled={updating.id === item._id && updating.type === "REJECTED"}
                                >
                                    {updating.id === item._id && updating.type === "REJECTED" ? (
                                        <Spinner size="sm" color="light" className="me-1" />
                                    ) : (
                                        <X size={16} className="me-1" />
                                    )}
                                    Reject
                                </Button>

                                <Button
                                    onClick={() => handleUpdateApprovalStatus(item._id, "APPROVED")}
                                    color="success"
                                    size="sm"
                                    className="d-flex align-items-center text-white"
                                    disabled={updating.id === item._id && updating.type === "APPROVED"}
                                >
                                    {updating.id === item._id && updating.type === "APPROVED" ? (
                                        <Spinner size="sm" color="light" className="me-1" />
                                    ) : (
                                        <Check size={16} className="me-1" />
                                    )}
                                    Approve
                                </Button>
                            </div>
                        </>
                    )}
                    {flag === "paymentProcessing" && hasCreatePermission && (
                        <>
                            <div className="my-3 border-1 border-top border-dashed"></div>
                            <div className="d-flex justify-content-end">
                                <Button
                                    onClick={openPaymentModal}
                                    color="primary"
                                    size="sm"
                                    className="d-flex align-items-center text-white"
                                    disabled={updating.id === item._id}
                                >
                                    {updating.id === item._id ? (
                                        <Spinner size="sm" color="light" className="me-1" />
                                    ) : (
                                        <CheckCheck size={16} className="me-1" />
                                    )}
                                    Process Payment
                                </Button>
                            </div>
                        </>
                    )}
                </CardBody>
            </Card>

            <PaymentFormModal
                isOpen={isPaymentModalOpen}
                toggle={closePaymentModal}
                item={item}
                onConfirm={handleProcessPayment}
                isProcessing={updating.id === item._id}
            />
        </React.Fragment>
    );
};

ItemCard.propTypes = {
    item: PropTypes.object,
    flag: PropTypes.string,
    border: PropTypes.bool,
    hasCreatePermission: PropTypes.bool
};

export default ItemCard;