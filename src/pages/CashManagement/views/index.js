import React, { useState, useEffect } from "react";
import {
  BASE_BALANCE_VIEW,
  DEPOSITS_VIEW,
  REPORTS_VIEW,
  SPENDING_VIEW,
} from "../../../Components/constants/cash";
import { Button, ButtonGroup, Spinner } from "reactstrap";
import Reports from "./Reports";
import Balance from "./Balance";
import Deposits from "./Deposits";
import Spending from "./Spending";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import CheckPermission from "../../../Components/HOC/CheckPermission";
import { useNavigate } from "react-router-dom";

const pageOrder = ["Reports", "Balance", "Deposits", "Spending"];

const Views = ({ pageAccess }) => {
  const navigate = useNavigate();
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission, roles } = usePermissions(token);

  const vws = {
    Reports: REPORTS_VIEW,
    Balance: BASE_BALANCE_VIEW,
    Deposits: DEPOSITS_VIEW,
    Spending: SPENDING_VIEW,
  };

  const hasReportsPermission =
    hasPermission("CASH", "CASHREPORTS", "READ") ||
    hasPermission("CASH", "CASHREPORTS", "WRITE") ||
    hasPermission("CASH", "CASHREPORTS", "DELETE");

  const hasBalancePermission =
    hasPermission("CASH", "CASHBALANCE", "READ") ||
    hasPermission("CASH", "CASHBALANCE", "WRITE") ||
    hasPermission("CASH", "CASHBALANCE", "DELETE");

  const hasDepositsPermission =
    hasPermission("CASH", "CASHDEPOSITS", "READ") ||
    hasPermission("CASH", "CASHDEPOSITS", "WRITE") ||
    hasPermission("CASH", "CASHDEPOSITS", "DELETE");

  const hasSpendingPermission =
    hasPermission("CASH", "CASHSPENDING", "READ") ||
    hasPermission("CASH", "CASHSPENDING", "WRITE") ||
    hasPermission("CASH", "CASHSPENDING", "DELETE");

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
        <div className="position-relative overflow-auto mt-1 px-3 py-3">
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
              {view === REPORTS_VIEW && <Reports view={view} />}
            </CheckPermission>

            <CheckPermission
              accessRolePermission={roles?.permissions}
              permission={"read"}
              subAccess={"CASHBALANCE"}
            >
              {view === BASE_BALANCE_VIEW && <Balance view={view} />}
            </CheckPermission>

            <CheckPermission
              accessRolePermission={roles?.permissions}
              permission={"read"}
              subAccess={"CASHDEPOSITS"}
            >
              {view === DEPOSITS_VIEW && <Deposits view={view} />}
            </CheckPermission>

            <CheckPermission
              accessRolePermission={roles?.permissions}
              permission={"read"}
              subAccess={"CASHSPENDING"}
            >
              {view === SPENDING_VIEW && <Spending view={view} />}
            </CheckPermission>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

Views.propTypes = {
  pageAccess: PropTypes.array,
};

const mapStateToProps = (state) => {
  return {
    pageAccess: state.User?.user?.pageAccess?.pages,
  };
};

export default connect(mapStateToProps)(Views);
