import React, { useState, useEffect, useRef } from "react";
import {
  BASE_BALANCE_VIEW,
  DEPOSITS_VIEW,
  INFLOW_VIEW,
  REPORTS_VIEW,
  SPENDING_VIEW,
  LEDGER_REPORT_VIEW,
  CASH_MANAGEMENT_GROUP,
  CASH_DAILY_RECO_GROUP,
} from "../../../Components/constants/cash";
import { Button, ButtonGroup, Nav, NavItem, NavLink, Spinner } from "reactstrap";
import Reports from "./Reports";
import LedgerReport from "./LedgerReport";
import Balance from "./Balance";
import Deposits from "./Deposits";
import Spending from "./Spending";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import CheckPermission from "../../../Components/HOC/CheckPermission";
import { useNavigate } from "react-router-dom";
import Inflows from "./Inflows";
import CashReco from "./CashReco";

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
  const hasLedgerReportPermission = hasPermission(
    "CASH",
    "LEDGERREPORT",
    "READ",
  );
  const hasCashRecoPermission = hasPermission("CASH", "CASHRECO", "READ");

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
    {
      name: "Ledger Report",
      view: LEDGER_REPORT_VIEW,
      hasAccess: hasLedgerReportPermission,
      order: 5,
    },
  ]
    .filter((view) => view.hasAccess)
    .sort((a, b) => a.order - b.order);

  const availableGroups = [
    {
      name: "Cash Management",
      group: CASH_MANAGEMENT_GROUP,
      hasAccess: availableViews.length > 0,
    },
    {
      name: "Cash Daily Reco",
      group: CASH_DAILY_RECO_GROUP,
      hasAccess: hasCashRecoPermission,
    },
  ].filter((g) => g.hasAccess);

  const getDefaultView = () => {
    if (availableViews.length === 0) return null;

    const priorityOrder = [
      REPORTS_VIEW,
      BASE_BALANCE_VIEW,
      DEPOSITS_VIEW,
      SPENDING_VIEW,
      INFLOW_VIEW,
      LEDGER_REPORT_VIEW,
    ];

    for (const view of priorityOrder) {
      const availableView = availableViews.find((v) => v.view === view);
      if (availableView) {
        return availableView.view;
      }
    }

    return availableViews[0]?.view || null;
  };

  const [group, setGroup] = useState(availableGroups[0]?.group || null);
  const [view, setView] = useState(getDefaultView());
  const tabStripRef = useRef(null);

  const handleView = (v) => setView(v);

  useEffect(() => {
    const strip = tabStripRef.current;
    const activeTab = strip?.querySelector(`[data-view="${view}"]`);
    if (!strip || !activeTab) return;
    if (strip.scrollWidth <= strip.clientWidth) return;

    const target =
      activeTab.offsetLeft - (strip.clientWidth - activeTab.clientWidth) / 2;
    strip.scrollTo({ left: Math.max(target, 0), behavior: "smooth" });
  }, [view, group]);

  useEffect(() => {
    if (!group || !availableGroups.some((g) => g.group === group)) {
      const defaultGroup = availableGroups[0]?.group;
      if (defaultGroup) setGroup(defaultGroup);
    }
  }, [availableGroups, group]);

  useEffect(() => {
    if (!view || !availableViews.some((v) => v.view === view)) {
      const defaultView = getDefaultView();
      if (defaultView) {
        setView(defaultView);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableViews, view]);

  if (availableGroups.length === 0) {
    navigate("/unauthorized");
  }

  if (!group) {
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

  const showManagement = group === CASH_MANAGEMENT_GROUP;

  return (
    <React.Fragment>
      <div className="h-auto" style={{ overflow: "auto !important" }}>
        <div className="position-relative overflow-auto mt-1 py-3">
          {availableGroups.length > 1 && (
            <div className="tab-scroll-strip mb-3">
              <Nav tabs className="flex-nowrap border-bottom-0">
                {availableGroups.map((g) => (
                  <NavItem key={g.group}>
                    <NavLink
                      href="#"
                      active={group === g.group}
                      className="fw-semibold"
                      onClick={(e) => {
                        e.preventDefault();
                        setGroup(g.group);
                      }}
                    >
                      {g.name}
                    </NavLink>
                  </NavItem>
                ))}
              </Nav>
            </div>
          )}

          {showManagement && (
            <div className="tab-scroll-strip mb-3" ref={tabStripRef}>
              <ButtonGroup size="sm">
                {availableViews.map((sub) => (
                  <Button
                    key={sub.view}
                    data-view={sub.view}
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
          )}

          <div className="bg-white px-2 px-md-3 py-3 vh-90">
            {showManagement ? (
              <>
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

                {view === LEDGER_REPORT_VIEW && (
                  <CheckPermission
                    accessRolePermission={roles?.permissions}
                    permission={"read"}
                    subAccess={"LEDGERREPORT"}
                  >
                    <LedgerReport
                      activeTab="dateRange"
                      hasUserPermission={hasLedgerReportPermission}
                    />
                  </CheckPermission>
                )}
              </>
            ) : (
              <CheckPermission
                accessRolePermission={roles?.permissions}
                permission={"read"}
                subAccess={"CASHRECO"}
              >
                <CashReco />
              </CheckPermission>
            )}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Views;
