import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Button, CardBody, Input, Spinner } from "reactstrap";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { endOfMonth, startOfMonth } from "date-fns";
import { Calendar, Download, RotateCcw } from "lucide-react";
import Flatpickr from "react-flatpickr";
import monthSelectPlugin from "flatpickr/dist/plugins/monthSelect";
import "flatpickr/dist/themes/material_blue.css";
import "flatpickr/dist/plugins/monthSelect/style.css";
import { toast } from "react-toastify";
import DataTableComponent from "../../../../Components/Common/DataTable";
import RefreshButton from "../../../../Components/Common/RefreshButton";
import { usePermissions } from "../../../../Components/Hooks/useRoles";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { fetchEmployeePayslips } from "../../../../store/features/HR/hrSlice";
import {
  displayMoney,
  displayValue,
  downloadPayslipPdfById,
  monthLabel,
  readStickyFilters,
  useDebouncedValue,
  writeStickyFilters,
} from "../payslipUtils";
import { format } from "date-fns";



const FILTER_KEY = "hr_employee_payslip_filters";

const initialFilters = readStickyFilters(FILTER_KEY, {
  center: "ALL",
  search: "",
  month: new Date().toISOString(),
});

const EmployeePaySlipsTab = () => {
  const dispatch = useDispatch();
  const handleAuthError = useAuthError();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState(() => {
    const saved = initialFilters.center;
    return saved || "ALL";
  });
  const [search, setSearch] = useState(initialFilters.search);
  const [selectedMonth, setSelectedMonth] = useState(
    initialFilters.month ? new Date(initialFilters.month) : new Date(),
  );
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [downloadingId, setDownloadingId] = useState("");

  const debouncedSearch = useDebouncedValue(search);

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission, loading: permissionLoader } = usePermissions(token);

  // Read from user.centerAccess (original full list), not state.User.centerAccess
  // which gets overwritten by changeUserAccess when parent center selector changes
  const { user, userCenters = [] } = useSelector((state) => state.User);
  const centerAccess = useMemo(() => user?.centerAccess || [], [user]);

  const {
    data = [],
    pagination,
    loading,
  } = useSelector((state) => state.HR.employeePayslips.data);

  const hasUserPermission = hasPermission("HR", "EMPLOYEE_PAYSLIPS", "READ");

  console.log(centerAccess, userCenters);

  const centerOptions = useMemo(
    () => [
      ...(centerAccess.length > 1
        ? [{ value: "ALL", label: "All Centers" }]
        : []),
      ...centerAccess.map((id) => {
        const center = userCenters.find((c) => c._id === id);
        return { value: id, label: center?.title || "Unknown Center" };
      }),
    ],
    [centerAccess, userCenters],
  );

  const selectedCenterOption =
    centerOptions.find((opt) => opt.value === selectedCenter) ||
    centerOptions[0];

  const centers = useMemo(
    () =>
      selectedCenter === "ALL"
        ? centerAccess
        : centerAccess.includes(selectedCenter)
          ? [selectedCenter]
          : [],
    [centerAccess, selectedCenter],
  );

  useEffect(() => {
    if (selectedCenter !== "ALL" && !centerAccess.includes(selectedCenter)) {
      setSelectedCenter("ALL");
      setPage(1);
    }
  }, [centerAccess, selectedCenter]);

  useEffect(() => {
    writeStickyFilters(FILTER_KEY, {
      center: selectedCenter,
      search,
      month: selectedMonth?.toISOString?.() || "",
    });
  }, [selectedCenter, search, selectedMonth]);

  useEffect(() => {
    setPage(1);
  }, [selectedCenter, selectedMonth, limit, debouncedSearch]);

  const latestRef = useRef({});
  latestRef.current = {
    centers,
    selectedMonth,
    debouncedSearch,
    page,
    limit,
    hasUserPermission,
  };

  const runFetch = useCallback(
    async (manual = false) => {
      const {
        centers: c,
        selectedMonth: m,
        debouncedSearch: s,
        page: p,
        limit: l,
        hasUserPermission: hasPerm,
      } = latestRef.current;

      if (!hasPerm || !c?.length) return;

      try {
        if (manual) setIsRefreshing(true);

        await dispatch(
          fetchEmployeePayslips({
            page: p,
            limit: l,
            centers: c,
            startDate: format(startOfMonth(m), "yyyy-MM-dd"),
            endDate: format(endOfMonth(m), "yyyy-MM-dd"),
            ...(s?.trim() && { search: s.trim() }),
          }),
        ).unwrap();
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error(error?.message || "Failed to fetch payslips");
        }
      } finally {
        if (manual) setIsRefreshing(false);
      }
    },
    [dispatch, handleAuthError],
  );
  const fetchKey = [
    centers.join(","),
    startOfMonth(selectedMonth).toISOString(),
    page,
    limit,
    debouncedSearch.trim(),
    hasUserPermission,
  ].join("|");

  useEffect(() => {
    runFetch();
  }, [fetchKey]); // eslint-disable-line

  const resetFilters = () => {
    setSelectedCenter("ALL");
    setSearch("");
    setSelectedMonth(new Date());
    setPage(1);
  };

  const handleDownload = async (row) => {
    try {
      setDownloadingId(row._id);
      await downloadPayslipPdfById(row._id, data);
      toast.success("Payslip downloaded");
    } catch {
      toast.error("Failed to generate payslip PDF");
    } finally {
      setDownloadingId("");
    }
  };

  const columns = useMemo(
    () => [
      {
        name: "S No.",
        cell: (_, index) => (page - 1) * limit + index + 1,
        width: "70px",
      },
      {
        name: "Month",
        cell: (row) => displayValue(monthLabel(row)),
        sortable: true,
        minWidth: "130px",
      },
      {
        name: "Emp Code",
        cell: (row) => displayValue(row.employeeCode),
        minWidth: "110px",
      },
      {
        name: "Employee Name",
        cell: (row) => displayValue(row.employeeName),
        sortable: true,
        minWidth: "180px",
      },
      {
        name: "Center",
        cell: (row) => displayValue(row.center?.title),
        minWidth: "130px",
      },
      {
        name: "Designation",
        cell: (row) => displayValue(row.designation),
        minWidth: "150px",
      },
      {
        name: "Total Deductions",
        cell: (row) => displayMoney(row.totalDeductions),
        right: true,
        minWidth: "140px",
      },
      {
        name: "Net Pay",
        cell: (row) => displayMoney(row.inHandSalary),
        right: true,
        minWidth: "110px",
      },
      {
        name: "Total Days",
        cell: (row) => displayValue(row.totalDays),
        right: true,
        minWidth: "100px",
      },
      {
        name: "Payable Days",
        cell: (row) => displayValue(row.workingDaysAttended),
        right: true,
        minWidth: "110px",
      },
      {
        name: "Download",
        center: true,
        minWidth: "100px",
        cell: (row) => (
          <Button
            color="primary"
            size="sm"
            className="d-inline-flex align-items-center justify-content-center text-white"
            onClick={() => handleDownload(row)}
            disabled={downloadingId === row._id}
            title="Download payslip"
          >
            {downloadingId === row._id ? (
              <Spinner size="sm" />
            ) : (
              <Download size={16} />
            )}
          </Button>
        ),
      },
    ],
    [data, downloadingId, limit, page], // eslint-disable-line
  );

  if (!permissionLoader && !hasUserPermission) return null;

  return (
    <CardBody className="p-3 bg-white" style={{ width: "80%" }}>
      <div className="text-center text-md-start mb-4">
        <h4 className="fw-bold text-primary mb-0">EMPLOYEES PAY SLIPS</h4>
      </div>

      <div className="d-flex flex-column flex-lg-row gap-2 align-items-stretch align-items-lg-center mb-3">
        <div style={{ minWidth: 210 }}>
          <Select
            value={selectedCenterOption}
            onChange={(opt) => setSelectedCenter(opt?.value || "ALL")}
            options={centerOptions}
            classNamePrefix="react-select"
          />
        </div>

        <div style={{ minWidth: 280 }}>
          <Input
            type="text"
            placeholder="Search name, emp code, center, designation…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ minWidth: 170 }}>
          <div className="position-relative month-picker">
            <Calendar size={14} className="position-absolute calendar-icon" />
            <Flatpickr
              value={selectedMonth}
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
              onChange={([date]) => date && setSelectedMonth(date)}
              className="form-control form-control-sm"
            />
          </div>
        </div>

        <div className="d-flex gap-2 ms-lg-auto">
          <RefreshButton
            loading={isRefreshing}
            onRefresh={() => runFetch(true)}
          />{" "}
          <Button
            color="light"
            className="d-inline-flex align-items-center gap-1"
            onClick={resetFilters}
          >
            <RotateCcw size={16} />
            Reset
          </Button>
        </div>
      </div>

      <DataTableComponent
        columns={columns}
        data={data}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        loading={loading || permissionLoader}
        pagination={pagination}
        noDataComponent="No payslips found"
      />
    </CardBody>
  );
};

export default EmployeePaySlipsTab;
