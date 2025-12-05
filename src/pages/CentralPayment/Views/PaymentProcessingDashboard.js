import React, { useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Button, Col, Container, Row, Spinner } from "reactstrap"
import ItemCard from '../Components/ItemCard';
import { getApprovals } from '../../../store/features/centralPayment/centralPaymentSlice';
import { useAuthError } from '../../../Components/Hooks/useAuthError';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { Copy, CopyCheck } from 'lucide-react';
import { getAllENets } from '../../../helpers/backend_helper';
import { usePermissions } from '../../../Components/Hooks/useRoles';

const PaymentProcessingDashboard = ({ loading, approvals, centerAccess }) => {

    const dispatch = useDispatch();
    const handleAuthError = useAuthError();
    const [page, setPage] = useState(1);
    const [selectedItems, setSelectedItems] = useState([]);
    const [eNetCopyLoader, setENetCopyLoader] = useState(false);
    const limit = 12;

    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;
    const { hasPermission } = usePermissions(token);
    const hasCreatePermission =
        hasPermission("CENTRALPAYMENT", "CENTRALPAYMENTPROCESSING", "WRITE") ||
        hasPermission("CENTRALPAYMENT", "CENTRALPAYMENTPROCESSING", "DELETE");

    useEffect(() => {
        // approved payments whose paymentstatus is pending
        const fetchApprovedPayments = async () => {
            try {
                await dispatch(getApprovals({
                    page,
                    limit,
                    centers: centerAccess,
                    approvalStatus: "APPROVED",
                    currentPaymentStatus: "PENDING"
                })).unwrap();
            } catch (error) {
                if (!handleAuthError(error)) {
                    toast.error(error.message || "Failed to fetch spendings.");
                }
            }
        }

        fetchApprovedPayments();
    }, [centerAccess, dispatch, page, limit]);


    const toggleItemSelection = (id) => {
        setSelectedItems(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id]
        );
    };

    const handleCopySelectedENets = async () => {
        const selectedECodes = approvals?.data?.filter(item => selectedItems.includes(item._id))
            .map(item => item.eNet)
            .filter(Boolean);

        await navigator.clipboard.writeText(selectedECodes.join("\n\n"));
        toast.success("Selected E-Nets copied to clipboard");
    }

    const handleCopyAllEnets = async () => {
        setENetCopyLoader(true);
        try {
            const response = await getAllENets({ centers: centerAccess });
            const { eNets, count } = response.data;

            if (!eNets?.length) {
                toast.info("No E-Nets found.");
                return;
            }

            const textToCopy = eNets.join("\n\n");

            await navigator.clipboard.writeText(textToCopy);

            toast.success(`Copied ${count} E-Nets to clipboard!`);
        } catch (err) {
            console.error(err);
            toast.error("Failed to copy E-Nets.");
        } finally {
            setENetCopyLoader(false);
        }
    };



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
                        {approvals?.data?.length > 0 ? (
                            <Row>
                                {(approvals?.data || []).map((payment) => (
                                    <Col xxl="6" lg="6" md="12" sm="12" xs="12" key={payment._id} className="mb-3">
                                        <ItemCard
                                            hasCreatePermission={hasCreatePermission}
                                            item={payment}
                                            border={true}
                                            flag="paymentProcessing"
                                            showSelect={true}
                                            selected={selectedItems.includes(payment._id)}
                                            onSelect={toggleItemSelection}
                                        />
                                    </Col>
                                ))}
                            </Row>
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
        </React.Fragment>
    )
}

PaymentProcessingDashboard.prototype = {
    loading: PropTypes.bool,
    approvals: PropTypes.object,
    centerAccess: PropTypes.array,
}

const mapStateToProps = (state) => ({
    centerAccess: state.User?.centerAccess,
    loading: state.CentralPayment?.loading,
    approvals: state.CentralPayment?.approvals
});

export default connect(mapStateToProps)(PaymentProcessingDashboard);