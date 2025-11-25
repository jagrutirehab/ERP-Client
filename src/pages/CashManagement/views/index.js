import React, { useState, useEffect } from "react";
import {
  BASE_BALANCE_VIEW,
  DEPOSITS_VIEW,
  INFLOW_VIEW,
  REPORTS_VIEW,
  SPENDING_VIEW,
} from "../../../Components/constants/cash";
import { Button, ButtonGroup, Spinner } from "reactstrap";
import Reports from "./Reports";
import Balance from "./Balance";
import Deposits from "./Deposits";
import Spending from "./Spending";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import CheckPermission from "../../../Components/HOC/CheckPermission";
import { useNavigate } from "react-router-dom";
import Inflows from "./Inflows";

const Views = () => {
  const navigate = useNavigate();
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission, roles } = usePermissions(token);

  const hasReportsPermission = hasPermission("CASH", "CASHREPORTS", "READ");
  const hasBalancePermission = hasPermission("CASH", "CASHBALANCE", "READ");
  const hasDepositsPermission = hasPermission("CASH", "CASHDEPOSITS", "READ");
  const hasSpendingPermission = hasPermission("CASH", "CASHSPENDING", "READ");
  const hasInflowPermission = hasPermission("CASH", "CASHINFLOW", "READ");

  const availableViews = [
    {
      name: "Reports",
      view: REPORTS_VIEW,
      hasAccess: hasReportsPermission,
      order: 0,
    },
    {
      name: "Balance",
      view: BASE_BALANCE_VIEW,
      hasAccess: hasBalancePermission,
      order: 1,
    },
    {
      name: "Deposits",
      view: DEPOSITS_VIEW,
      hasAccess: hasDepositsPermission,
      order: 2,
    },
    {
      name: "Spending",
      view: SPENDING_VIEW,
      hasAccess: hasSpendingPermission,
      order: 3,
    },
    {
      name: "Cash Inflow",
      view: INFLOW_VIEW,
      hasAccess: hasInflowPermission,
      order: 4,
    },
  ]
    .filter((view) => view.hasAccess)
    .sort((a, b) => a.order - b.order);

  const getDefaultView = () => {
    if (availableViews.length === 0) return null;

    const priorityOrder = [
      REPORTS_VIEW,
      BASE_BALANCE_VIEW,
      DEPOSITS_VIEW,
      SPENDING_VIEW,
      INFLOW_VIEW
    ];

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
            <CheckPermission
              accessRolePermission={roles?.permissions}
              permission={"read"}
              subAccess={"CASHREPORTS"}
            >
              {view === REPORTS_VIEW && <Reports />}
            </CheckPermission>

            <CheckPermission
              accessRolePermission={roles?.permissions}
              permission={"read"}
              subAccess={"CASHBALANCE"}
            >
              {view === BASE_BALANCE_VIEW && <Balance />}
            </CheckPermission>

            <CheckPermission
              accessRolePermission={roles?.permissions}
              permission={"read"}
              subAccess={"CASHDEPOSITS"}
            >
              {view === DEPOSITS_VIEW && <Deposits />}
            </CheckPermission>

            <CheckPermission
              accessRolePermission={roles?.permissions}
              permission={"read"}
              subAccess={"CASHSPENDING"}
            >
              {view === SPENDING_VIEW && <Spending />}
            </CheckPermission>

            <CheckPermission
              accessRolePermission={roles?.permissions}
              permission={"read"}
              subAccess={"CASHINFLOW"}
            >
              {view === INFLOW_VIEW && <Inflows />}
            </CheckPermission>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Views;
