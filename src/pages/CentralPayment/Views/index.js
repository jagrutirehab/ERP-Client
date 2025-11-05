import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { APPROVAL_VIEW, REPORTS_VIEW, SPENDING_VIEW } from '../../../Components/constants/centralPayment';
import { Button, ButtonGroup, Spinner } from 'reactstrap';
import Reports from './Reports';
import Spending from './Spending';
import ApprovalDashboard from './ApprovalDashboard';
import { usePermissions } from '../../../Components/Hooks/useRoles';

const priorityOrder = [
    SPENDING_VIEW,
    APPROVAL_VIEW,
    REPORTS_VIEW,
];

const Views = () => {
    const navigate = useNavigate();
    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;
    const { hasPermission } = usePermissions(token);

    const hasReportsPermission = hasPermission("CENTRALPAYMENT", "CENTRALPAYMENTREPORTS", "READ");
    const hasApprovalsPermission = hasPermission("CENTRALPAYMENT", "CENTRALPAYMENTAPPROVAL", "READ");
    const hasSpendingPermission = hasPermission("CENTRALPAYMENT", "CENTRALPAYMENTSPENDING", "READ");

    const availableViews = [
        // SPENDING LATER RENAMED AS EXPENSE
        {
            name: "Expense",
            view: SPENDING_VIEW,
            hasAccess: hasSpendingPermission,
            order: 0,
        },
        {
            name: "Approval Dashboard",
            view: APPROVAL_VIEW,
            hasAccess: hasApprovalsPermission,
            order: 1,
        },
        {
            name: "Reports",
            view: REPORTS_VIEW,
            hasAccess: hasReportsPermission,
            order: 2,
        },
    ]
        .filter((view) => view.hasAccess)
        .sort((a, b) => a.order - b.order);

    const getDefaultView = () => {
        if (availableViews.length === 0) return null;

        for (const view of priorityOrder) {
            const availableView = availableViews.find((v) => v.view === view);
            if (availableView) {
                return availableView.view;
            }
        }

        return availableViews[0]?.view || null;
    };

    const [view, setView] = useState(getDefaultView());

    const handleView = (v) => setView(v);

    useEffect(() => {
        if (!view || !availableViews.some((v) => v.view === view)) {
            const defaultView = getDefaultView();
            if (defaultView) {
                setView(defaultView);
            }
        }
    }, [availableViews, view]);

    if (availableViews.length === 0) {
        navigate("/unauthorized");
    }

    if (!view) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner
                    color="primary"
                    className="d-block"
                    style={{ width: "3rem", height: "3rem" }}
                />
            </div>
        );
    }

    return (
        <React.Fragment>
            <div className="h-auto" style={{ overflow: "auto !important" }}>
                <div className="position-relative overflow-auto mt-1 py-3">
                    <div className="d-flex justify-content-between flex-wrap mb-3">
                        <ButtonGroup size="sm">
                            {availableViews.map((sub) => (
                                <Button
                                    key={sub.view}
                                    outline={view !== sub.view}
                                    onClick={() => handleView(sub.view)}
                                >
                                    {sub.name === "Balance"
                                        ? "Set Base Balance"
                                        : sub.name === "Deposits"
                                            ? "Bank Deposits"
                                            : sub.name}
                                </Button>
                            ))}
                        </ButtonGroup>
                    </div>
                    <div className="bg-white px-3 py-3 vh-90">
                        {view === SPENDING_VIEW && <Spending />}
                        {view === APPROVAL_VIEW && <ApprovalDashboard />}
                        {view === REPORTS_VIEW && <Reports />}
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

export default Views;
