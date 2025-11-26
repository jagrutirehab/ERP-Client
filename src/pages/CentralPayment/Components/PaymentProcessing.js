import React, { useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Button, Col, Container, Row, Spinner } from "reactstrap"
import ItemCard from './ItemCard';
import { getApprovals } from '../../../store/features/centralPayment/centralPaymentSlice';
import { useAuthError } from '../../../Components/Hooks/useAuthError';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

const PaymentProcessing = ({ loading, approvals, centerAccess, activeTab, hasCreatePermission }) => {

    const dispatch = useDispatch();
    const handleAuthError = useAuthError();
    const [page, setPage] = useState(1);
    const limit = 12;

    useEffect(() => {
        if (activeTab !== "paymentProcessing") return;
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
    }, [centerAccess, dispatch, activeTab, page, limit]);


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
                            <Row>
                                {(approvals?.data || []).map((payment) => (
                                    <Col xxl="6" lg="6" md="12" sm="12" xs="12" key={payment._id} className="mb-3">
                                        <ItemCard hasCreatePermission={hasCreatePermission} item={payment} border={true} flag="paymentProcessing" />
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

PaymentProcessing.prototype = {
    loading: PropTypes.bool,
    approvals: PropTypes.object,
    centerAccess: PropTypes.array,
    activeTab: PropTypes.string,
    hasCreatePermission: PropTypes.bool
}

const mapStateToProps = (state) => ({
    centerAccess: state.User?.centerAccess,
    loading: state.CentralPayment?.loading,
    approvals: state.CentralPayment?.approvals
});

export default connect(mapStateToProps)(PaymentProcessing);