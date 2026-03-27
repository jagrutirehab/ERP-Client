import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Button,
  CardBody,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";
import classnames from "classnames";
import { parse } from "date-fns";
import Flatpickr from "react-flatpickr";
import monthSelectPlugin from "flatpickr/dist/plugins/monthSelect";
import "flatpickr/dist/themes/material_blue.css";
import "flatpickr/dist/plugins/monthSelect/style.css";
import { ArrowLeft, Calendar } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import DataTableComponent from "../../../Components/Common/DataTable";
import RefreshButton from "../../../Components/Common/RefreshButton";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import { fetchRegularizationsByEmployee } from "../../../store/features/HR/hrSlice";
import { toast } from "react-toastify";
import { MyRegularizationsColumn } from "../../HRMS/components/Table/Columns/myRegularizationColumn";
import { getMonthRange } from "../../../utils/time";

const tabs = [
  { id: "pending", label: "Pending", statuses: ["PENDING"] },
  { id: "regularized", label: "Regularized", statuses: ["REGULARIZED"] },
  { id: "rejected", label: "Rejected", statuses: ["REJECTED"] },
];

const EmployeeRegularizationDetails = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const [searchParams] = useSearchParams();
  const handleAuthError = useAuthError();
  const isMobile = useMediaQuery("(max-width: 1000px)");

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission, loading: permissionLoading } = usePermissions(token);
  const hasUserPermission = hasPermission("HR", "REGULARIZATION_DASHBOARD", "READ");
  const initialMonth = searchParams.get("month");

  const [selectedMonth, setSelectedMonth] = useState(() => {
    if (!initialMonth) return new Date();
    try {
      return parse(initialMonth, "yyyy-MM", new Date());
    } catch (error) {
      return new Date();
    }
  });

  const { data, loading, selectedEmployee, pagination } = useSelector((state) => state.HR);

  const loadEmployeeRegularizations = async () => {
    if (!employeeId) return;
    try {
      const { startDate, endDate } = getMonthRange(selectedMonth);
      await dispatch(
        fetchRegularizationsByEmployee({
          employeeId,
          view: activeTab,
          startDate,
          endDate,
          page,
          limit,
        }),
      ).unwrap();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error.message || "Failed to fetch employee regularizations.");
      }
    }
  };

  useEffect(() => {
    if (!permissionLoading && !hasUserPermission) {
      navigate("/unauthorized");
    }
  }, [hasUserPermission, navigate, permissionLoading]);

  useEffect(() => {
    if (hasUserPermission && employeeId) {
      loadEmployeeRegularizations();
    }
  }, [activeTab, dispatch, employeeId, hasUserPermission, limit, page, selectedMonth]);

  const filteredRegularizations = useMemo(() => data || [], [data]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setPage(1);
  };

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
  };

  const handleLimitChange = (nextLimit) => {
    setLimit(nextLimit);
    setPage(1);
  };

  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <Button
              color="link"
              className="p-0 text-decoration-none"
              onClick={() => navigate("/hr/regularization/dashboard")}
            >
              <ArrowLeft size={16} className="me-1" />
              Back to Summary
            </Button>
          </div>
          {loading && !selectedEmployee ? (
            <div>
              <Skeleton width={220} height={28} style={{ marginBottom: 8 }} />
              <Skeleton width={320} height={18} />
            </div>
          ) : (
            <>
              <h4 className="fw-bold text-primary mb-1">
                {selectedEmployee?.name || "Employee Regularizations"}
              </h4>
              <div className="text-muted">
                {(selectedEmployee?.eCode || "-") +
                  " | " +
                  (selectedEmployee?.center?.title || "Unknown Center") +
                  " | " +
                  (selectedEmployee?.status || "-")}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-3">
        <Nav tabs className="mb-0">
          {tabs.map((tab) => (
            <NavItem key={tab.id}>
              <NavLink
                className={classnames({ active: activeTab === tab.id })}
                onClick={() => handleTabChange(tab.id)}
                style={{ cursor: "pointer", fontWeight: 500 }}
              >
                {tab.label}
              </NavLink>
            </NavItem>
          ))}
        </Nav>

        <div className="d-flex align-items-center gap-2">
          <RefreshButton loading={loading} onRefresh={loadEmployeeRegularizations} />
          <div className="position-relative month-picker" style={{ minWidth: 220 }}>
            <Calendar
              size={14}
              className="position-absolute calendar-icon"
            />
            <Flatpickr
              value={selectedMonth}
              disabled={loading}
              options={{
                plugins: [
                  monthSelectPlugin({
                    shorthand: false,
                    dateFormat: "Y-m",
                    altFormat: "F Y",
                  }),
                ],
                altInput: true,
                disableMobile: true,
              }}
              onChange={([date]) => {
                if (date) {
                  setSelectedMonth(date);
                  setPage(1);
                }
              }}
              className="form-control form-control-sm"
            />
          </div>
        </div>
      </div>

      <DataTableComponent
        columns={MyRegularizationsColumn()}
        data={filteredRegularizations}
        loading={loading}
        page={page}
        setPage={handlePageChange}
        limit={limit}
        setLimit={handleLimitChange}
        pagination={pagination}
      />
    </CardBody>
  );
};

export default EmployeeRegularizationDetails;
