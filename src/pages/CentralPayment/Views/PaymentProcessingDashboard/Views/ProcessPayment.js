import { useDispatch } from "react-redux";
import { useAuthError } from "../../../../../Components/Hooks/useAuthError";
import React, { useEffect, useState } from "react";
import { usePermissions } from "../../../../../Components/Hooks/useRoles";
import { getApprovals } from "../../../../../store/features/centralPayment/centralPaymentSlice";
import { toast } from "react-toastify";
import { getAllENets, updateCentralPaymentProcessStatus, updateProcessStatus } from "../../../../../helpers/backend_helper";
import { Button, Col, Container, Row, Spinner } from "reactstrap";
import { Copy, CopyCheck } from "lucide-react";
import ItemCard from "../../../Components/ItemCard";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import ConfirmationModal from "../../../../../Components/Common/ConfirmationModal";

const ProcessPayment = ({ loading, approvals, centerAccess, activeTab }) => {

    const dispatch = useDispatch();
    const handleAuthError = useAuthError();
    const [page, setPage] = useState(1);
    const [selectedItems, setSelectedItems] = useState([]);
    const [eNetCopyLoader, setENetCopyLoader] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [copiedENets, setCopiedENets] = useState([]);
    const [processLoader, setProcessLoader] = useState(false);
    const [processPayload, setProcessPayload] = useState({});

    const limit = 12;

    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;
    const { hasPermission } = usePermissions(token);
    const hasCreatePermission =
        hasPermission("CENTRALPAYMENT", "CENTRALPAYMENTPROCESSING", "WRITE") ||
        hasPermission("CENTRALPAYMENT", "CENTRALPAYMENTPROCESSING", "DELETE");

    // approved payments whose paymentstatus is pending
    const fetchApprovedPayments = async () => {
        try {
            await dispatch(getApprovals({
                page,
                limit,
                centers: centerAccess,
                approvalStatus: "APPROVED",
                currentPaymentStatus: "PENDING",
                processStatus: "PENDING",
            })).unwrap();
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error.message || "Failed to fetch spendings.");
            }
        }
    }

    useEffect(() => {
        if (activeTab === "PROCESS_PAYMENT") {
            fetchApprovedPayments();
        }
    }, [centerAccess, dispatch, page, limit, activeTab]);


    const toggleItemSelection = (id) => {
        setSelectedItems(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id]
        );
    };

    const handleCopySelectedENets = async () => {
        const selectedPayments = approvals?.data
            ?.filter(item => selectedItems.includes(item._id));

        const selectedECodes = selectedPayments.map(p => p.eNet);

        setProcessPayload({
            paymentIds: selectedPayments.map(p => p._id),
        });

        await copyEnetsAndAskToProcess(selectedECodes);
    };



    const handleCopyAllEnets = async () => {
        setENetCopyLoader(true);
        try {
            const response = await getAllENets({ centers: centerAccess, processStatus: "PENDING" });
            const { eNets } = response.data;

            setProcessPayload({
                centers: centerAccess,
            });

            await copyEnetsAndAskToProcess(eNets);
        } catch (err) {
            toast.error("Failed to copy E-Nets.");
        } finally {
            setENetCopyLoader(false);
        }
    };



    const copyEnetsAndAskToProcess = async (eNets) => {
        const cleaned = eNets
            .map(e => (e || "").replace(/[\r\n]+/g, "").trim())
            .filter(Boolean);

        if (!cleaned.length) return toast.error("No E-Nets to copy.");

        await navigator.clipboard.writeText(cleaned.join("\n"));
        setCopiedENets(cleaned);

        toast.success(`${cleaned.length} ${cleaned.length > 1 ? "E-Nets" : "E-Net"} copied!`);

        if (hasCreatePermission) {
            setModalOpen(true);
        }
    };


    const handleProcessENets = async () => {
        if (!hasCreatePermission) return;
        try {
            setProcessLoader(true);

            const res = await updateCentralPaymentProcessStatus({
                centers: processPayload.centers,
                paymentIds: processPayload.paymentIds,
            });

            toast.success(res.data.processCount > 0 ? `Processed ${res.data.processCount} payment(s) successfully.` : "No payment(s) were processed.");
            setModalOpen(false);
            setSelectedItems([]);
            setProcessPayload({});
            setPage(1);
            await fetchApprovedPayments();
        } catch (err) {
            toast.error("Processing failed.");
        } finally {
            setProcessLoader(false);
        }
    };




    const toggleModal = () => setModalOpen(!modalOpen);

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
                        {approvals?.data?.length > 0 ? (
                            <>
                                <div className='d-flex justify-content-end mb-2 gap-2'>
                                    <Button
                                        onClick={handleCopyAllEnets}
                                        color='primary'
                                        className='text-white'
                                    >
                                        {eNetCopyLoader ? <Spinner className="me-1" size={"sm"} /> : <Copy className="me-1" size={16} />}
                                        Copy ALl E-Nets
                                    </Button>
                                    <Button
                                        onClick={handleCopySelectedENets}
                                        color='primary'
                                        className='text-white'
                                        disabled={selectedItems.length === 0}
                                    >
                                        <CopyCheck className="me-1" size={16} />
                                        Copy Selected E-Nets ({selectedItems.length})
                                    </Button>
                                </div>
                                <Row>
                                    {(approvals?.data || []).map((payment) => (
                                        <Col xxl="6" lg="6" md="12" sm="12" xs="12" key={payment._id} className="mb-3">
                                            <ItemCard
                                                hasCreatePermission={hasCreatePermission}
                                                item={payment}
                                                border={true}
                                                flag="processPayment"
                                                showSelect={true}
                                                selected={selectedItems.includes(payment._id)}
                                                onSelect={toggleItemSelection}
                                                onCopyENet={(enet) => {
                                                    setProcessPayload({
                                                        paymentIds: [payment._id],
                                                    });
                                                    copyEnetsAndAskToProcess([enet]);
                                                }}
                                            />
                                        </Col>
                                    ))}
                                </Row>
                            </>
                        ) : (
                            <p className="text-muted text-center py-3">No pending payment processing requests</p>
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
            {hasCreatePermission && (
                <ConfirmationModal
                    isOpen={modalOpen}
                    toggle={toggleModal}
                    title="Process Payment?"
                    message={`You copied ${copiedENets.length} E-Net(s). Do you want to process them?`}
                    confirmText={processLoader ? <Spinner size="sm" /> : "Process"}
                    confirmColor="primary"
                    onConfirm={handleProcessENets}
                    onCancel={toggleModal}
                />
            )}


        </React.Fragment>
    )
}

ProcessPayment.prototype = {
    loading: PropTypes.bool,
    approvals: PropTypes.object,
    centerAccess: PropTypes.array,
    activeTab: PropTypes.string,
}

const mapStateToProps = (state) => ({
    centerAccess: state.User?.centerAccess,
    loading: state.CentralPayment?.loading,
    approvals: state.CentralPayment?.approvals
});

export default connect(mapStateToProps)(ProcessPayment);