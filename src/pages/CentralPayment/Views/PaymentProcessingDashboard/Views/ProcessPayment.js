import { useDispatch } from "react-redux";
import { useAuthError } from "../../../../../Components/Hooks/useAuthError";
import React, { useEffect, useState } from "react";
import { usePermissions } from "../../../../../Components/Hooks/useRoles";
import { getApprovals } from "../../../../../store/features/centralPayment/centralPaymentSlice";
import { toast } from "react-toastify";
import { regenerateENets, updateCentralPaymentProcessStatus } from "../../../../../helpers/backend_helper";
import { Button, Col, Container, Row, Spinner } from "reactstrap";
import { Copy, CopyCheck } from "lucide-react";
import ItemCard from "../../../Components/ItemCard";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import ConfirmationModal from "../../../../../Components/Common/ConfirmationModal";
import Select from "react-select";

const ProcessPayment = ({ loading, approvals, centerAccess, userCenters, activeTab }) => {

    const dispatch = useDispatch();
    const handleAuthError = useAuthError();
    const [page, setPage] = useState(1);
    const [selectedItems, setSelectedItems] = useState([]);
    const [eNetCopyLoader, setENetCopyLoader] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [copiedENets, setCopiedENets] = useState([]);
    const [processLoader, setProcessLoader] = useState(false);
    const [processPayload, setProcessPayload] = useState({});
    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const limit = 12;

    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;
    const { hasPermission } = usePermissions(token);
    const hasCreatePermission =
        hasPermission("CENTRALPAYMENT", "CENTRALPAYMENTPROCESSING", "WRITE") ||
        hasPermission("CENTRALPAYMENT", "CENTRALPAYMENTPROCESSING", "DELETE");

    const centerOptions = [
        ...(centerAccess?.length > 1
            ? [{
                value: "ALL",
                label: "All Centers",
                isDisabled: false,
            }]
            : []
        ),
        ...(
            centerAccess?.map(id => {
                const center = userCenters?.find(c => c._id === id);
                return {
                    value: id,
                    label: center?.title || "Unknown Center"
                };
            }) || []
        )
    ];

    const selectedCenterOption = centerOptions.find(
        opt => opt.value === selectedCenter
    ) || centerOptions[0];

    useEffect(() => {
        if (
            selectedCenter !== "ALL" &&
            !centerAccess?.includes(selectedCenter)
        ) {
            setSelectedCenter("ALL");
            setPage(1);
        }
    }, [selectedCenter, centerAccess]);

    const fetchApprovedPayments = async () => {
        try {
            const centers =
                selectedCenter === "ALL"
                    ? centerAccess
                    : !centerAccess.length ? [] : [selectedCenter];

            await dispatch(getApprovals({
                page,
                limit,
                centers: centers,
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
    }, [centerAccess, dispatch, page, limit, activeTab, selectedCenter]);


    const toggleItemSelection = (id) => {
        setSelectedItems(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id]
        );
    };

    const handleCopySelectedENets = async () => {
        const ids = selectedItems;

        if (!ids.length) return;

        setENetCopyLoader(true);

        try {
            const res = await regenerateENets({
                paymentIds: ids
            });

            const eNets = res.eNets.map(x => x.eNet);

            setProcessPayload({
                paymentIds: ids
            });

            await copyEnetsAndAskToProcess(eNets);
        } catch (err) {
            toast.error("Failed to generate E-Nets.");
        } finally {
            setENetCopyLoader(false);
        }
    };


    const handleCopyAllEnets = async () => {
        setENetCopyLoader(true);
        try {
            const res = await regenerateENets({
                centers: centerAccess
            });

            const eNets = res.eNets.map(x => x.eNet);

            setProcessPayload({
                centers: centerAccess
            });

            await copyEnetsAndAskToProcess(eNets);
        } catch (err) {
            toast.error("Failed to generate E-Nets.");
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

        await fetchApprovedPayments();
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


    const copyENetHandler = async (paymentId) => {
        setENetCopyLoader(true);
        try {
            const res = await regenerateENets({
                paymentIds: [paymentId]
            });

            const eNet = res.eNets[0]?.eNet;
            if (!eNet) throw new Error();

            setProcessPayload({ paymentIds: [paymentId] });
            await copyEnetsAndAskToProcess([eNet]);
        } catch {
            toast.error("Failed to generate E-Net.");
        } finally {
            setENetCopyLoader(false);
        }
    }



    const toggleModal = () => setModalOpen(!modalOpen);

    if (loading) {
        return (
            <div
                className="d-flex flex-column justify-content-center align-items-center text-center text-muted"
                style={{ minHeight: "50vh" }}
            >
                <Spinner color="primary" />
            </div>
        );
    }


    return (
        <React.Fragment>
            <div className="d-flex flex-column">
                <Container fluid>

                    <div className="mb-3">
                        <Row className="align-items-center g-2">

                            <Col lg="2" md="4" sm="12">
                                <Select
                                    value={selectedCenterOption}
                                    onChange={(option) => {
                                        setSelectedCenter(option?.value);
                                        setPage(1);
                                    }}
                                    options={centerOptions}
                                    placeholder="All Centers"
                                    classNamePrefix="react-select"
                                />
                            </Col>

                            {approvals?.data?.length > 0 && (
                                <Col
                                    lg="10"
                                    md="8"
                                    sm="12"
                                    className="d-flex flex-column flex-md-row justify-content-md-end align-items-stretch gap-2"
                                >
                                    <Button
                                        onClick={handleCopyAllEnets}
                                        color="primary"
                                        className="text-white px-4"
                                    >
                                        {eNetCopyLoader ? (
                                            <Spinner size="sm" className="me-1" />
                                        ) : (
                                            <Copy size={16} className="me-1" />
                                        )}
                                        Copy All E-Nets
                                    </Button>

                                    <Button
                                        onClick={handleCopySelectedENets}
                                        color="primary"
                                        className="text-white px-4"
                                        disabled={selectedItems.length === 0}
                                    >
                                        <CopyCheck size={16} className="me-1" />
                                        Copy Selected E-Nets ({selectedItems.length})
                                    </Button>
                                </Col>
                            )}
                        </Row>
                    </div>



                    <div className="mb-5">
                        {approvals?.data?.length > 0 ? (
                            <Row>
                                {approvals.data.map((payment) => (
                                    <Col
                                        xxl="6"
                                        lg="6"
                                        md="12"
                                        sm="12"
                                        xs="12"
                                        key={payment._id}
                                        className="mb-3"
                                    >
                                        <ItemCard
                                            hasCreatePermission={hasCreatePermission}
                                            item={payment}
                                            border
                                            flag="processPayment"
                                            showSelect
                                            selected={selectedItems.includes(payment._id)}
                                            onSelect={toggleItemSelection}
                                            onCopyENet={() => copyENetHandler(payment._id)}
                                        />
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <div
                                className="d-flex flex-column justify-content-center align-items-center text-center text-muted"
                                style={{ minHeight: "40vh" }}
                            >
                                <h6 className="mb-1">No pending payment processing requests</h6>
                            </div>
                        )}
                    </div>

                    {!loading && approvals?.pagination?.totalPages > 1 && (
                        <>
                            {/* Mobile */}
                            <div className="d-block d-md-none text-center mt-3">
                                <div className="text-muted mb-2">
                                    Showing {(page - 1) * limit + 1}–
                                    {Math.min(page * limit, approvals.pagination.totalDocs)} of{" "}
                                    {approvals.pagination.totalDocs}
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
                                        disabled={page === approvals.pagination.totalPages}
                                        onClick={() => setPage((p) => p + 1)}
                                    >
                                        Next →
                                    </Button>
                                </div>
                            </div>

                            {/* Desktop */}
                            <Row className="mt-4 justify-content-center align-items-center d-none d-md-flex">
                                <Col xs="auto">
                                    <Button
                                        color="secondary"
                                        disabled={page === 1}
                                        onClick={() => setPage((p) => p - 1)}
                                    >
                                        ← Previous
                                    </Button>
                                </Col>
                                <Col xs="auto" className="text-muted mx-3">
                                    Showing {(page - 1) * limit + 1}–
                                    {Math.min(page * limit, approvals.pagination.totalDocs)} of{" "}
                                    {approvals.pagination.totalDocs}
                                </Col>
                                <Col xs="auto">
                                    <Button
                                        color="secondary"
                                        disabled={page === approvals.pagination.totalPages}
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
    userCenters: PropTypes.array,
}

const mapStateToProps = (state) => ({
    centerAccess: state.User?.centerAccess,
    userCenters: state.User?.userCenters,
    loading: state.CentralPayment?.loading,
    approvals: state.CentralPayment?.approvals
});

export default connect(mapStateToProps)(ProcessPayment);