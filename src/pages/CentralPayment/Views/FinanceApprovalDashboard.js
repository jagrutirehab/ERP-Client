import React, { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { Button, Col, Container, Row, Spinner } from "reactstrap"
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { toast } from "react-toastify";
import { getApprovals } from "../../../store/features/centralPayment/centralPaymentSlice";
import PropTypes from "prop-types";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import ItemCard from "../Components/ItemCard";
import Select from "react-select";
import { formatCurrency } from "../../../utils/formatCurrency";

const FinanceApprovalDashboard = ({ centerAccess, userCenters, loading, approvals }) => {

    const dispatch = useDispatch();
    const handleAuthError = useAuthError();
    const [page, setPage] = useState(1);
    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const limit = 12;

    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;
    const { hasPermission } = usePermissions(token);

    const hasCreatePermission =
        hasPermission("CENTRALPAYMENT", "CENTRALPAYMENTFINANCEAPPROVAL", "WRITE") ||
        hasPermission("CENTRALPAYMENT", "CENTRALPAYMENTFINANCEAPPROVAL", "DELETE");

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

    useEffect(() => {
        const fetchPendingFinanceApprovals = async () => {
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
                    financeApprovalStatus: "PENDING"
                })).unwrap();
            } catch (error) {
                if (!handleAuthError(error)) {
                    toast.error(error.message || "Failed to fetch pending finance approvals.");
                }
            }
        }

        fetchPendingFinanceApprovals();
    }, [centerAccess, selectedCenter, dispatch, page, limit]);



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
                    <div className="mb-5">
                        <Row className="mb-3 align-items-center justify-content-between">
                            <Col lg="2" md="6" sm="12">
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
                            <Col xs="auto" className="d-flex align-items-center">
                                <span className="text-muted me-1">Total Balance:</span>
                                <span className="fw-bold">{formatCurrency(approvals?.totalFinalAmount)}</span>
                            </Col>
                        </Row>
                        {approvals?.data?.length > 0 ? (
                            <Row>
                                {(approvals?.data || []).map((payment) => (
                                    <Col xxl="6" lg="6" md="12" sm="12" xs="12" key={payment._id} className="mb-3">
                                        <ItemCard
                                            item={payment}
                                            flag="financeApproval"
                                            border={true}
                                            hasCreatePermission={hasCreatePermission}
                                        />
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <div
                                className="d-flex flex-column justify-content-center align-items-center text-center text-muted"
                                style={{ minHeight: "40vh" }}
                            >
                                <h6 className="mb-1">No pending finance approvals</h6>
                            </div>
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

FinanceApprovalDashboard.prototype = {
    loading: PropTypes.bool,
    approvals: PropTypes.object,
    centerAccess: PropTypes.array,
    userCenters: PropTypes.array,
}


const mapStateToProps = (state) => ({
    centerAccess: state.User?.centerAccess,
    userCenters: state.User?.userCenters,
    loading: state.CentralPayment?.loading,
    approvals: state.CentralPayment?.approvals
});

export default connect(mapStateToProps)(FinanceApprovalDashboard);