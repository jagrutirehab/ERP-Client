import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, CardBody, Input, Spinner } from "reactstrap";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { endOfMonth, startOfMonth, endOfYear, startOfYear } from "date-fns";
import { Calendar, Download, RotateCcw } from "lucide-react";
import Flatpickr from "react-flatpickr";
import monthSelectPlugin from "flatpickr/dist/plugins/monthSelect";
import "flatpickr/dist/themes/material_blue.css";
import "flatpickr/dist/plugins/monthSelect/style.css";
import { toast } from "react-toastify";
import DataTableComponent from "../../../../Components/Common/DataTable";
import RefreshButton from "../../../../Components/Common/RefreshButton";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { fetchMyPayslips } from "../../../../store/features/HR/hrSlice";
import {
  displayMoney,
  displayValue,
  downloadPayslipPdfById,
  monthLabel,
  readStickyFilters,
  useDebouncedValue,
  writeStickyFilters,
} from "../payslipUtils";

const FILTER_KEY = "hr_my_payslip_filters";

const TYPE_OPTIONS = [
  { value: "FORM",    label: "Form"    },
  { value: "PAYSLIP", label: "Payslip" },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => {
  const y = currentYear - i;
  return { value: y, label: String(y) };
});

const initialFilters = readStickyFilters(FILTER_KEY, {
  type:   "PAYSLIP",
  search: "",
  month:  "",
  year:   "",
});

const MyPaySlipsTab = () => {
  const dispatch        = useDispatch();
  const handleAuthError = useAuthError();

  const [page,          setPage]          = useState(1);
  const [limit,         setLimit]         = useState(10);
  const [type,          setType]          = useState(initialFilters.type);
  const [search,        setSearch]        = useState(initialFilters.search);
  const [selectedMonth, setSelectedMonth] = useState(
    initialFilters.month ? new Date(initialFilters.month) : null
  );
  const [selectedYear,  setSelectedYear]  = useState(
    initialFilters.year ? Number(initialFilters.year) : null
  );
  const [downloadingId, setDownloadingId] = useState("");

  const debouncedSearch = useDebouncedValue(search);

  const { data = [], loading, pagination } =
    useSelector((state) => state.HR.myPayslips);

  useEffect(() => {
    writeStickyFilters(FILTER_KEY, {
      type,
      search,
      month: selectedMonth?.toISOString?.() ?? "",
      year:  selectedYear ?? "",
    });
  }, [type, search, selectedMonth, selectedYear]);

  useEffect(() => {
    if (type === "FORM")    setSelectedMonth(null);
    if (type === "PAYSLIP") setSelectedYear(null);
  }, [type]);

  useEffect(() => {
    setPage(1);
  }, [type, selectedMonth, selectedYear, limit, debouncedSearch]);

  const fetchKey = [
    type,
    selectedMonth?.toISOString() ?? "",
    selectedYear ?? "",
    page,
    limit,
    debouncedSearch.trim(),
  ].join("|");

  const paramsRef = useRef({});
  paramsRef.current = {
    type, selectedMonth, selectedYear,
    page, limit, search: debouncedSearch.trim(),
  };

  const runFetch = useCallback(async () => {
    const { type: t, selectedMonth: m, selectedYear: y, page: p, limit: l, search: s } =
      paramsRef.current;

    let dateRange = {};
    if (t === "PAYSLIP" && m) {
      dateRange = { startDate: startOfMonth(m), endDate: endOfMonth(m) };
    } else if (t === "FORM" && y) {
      dateRange = {
        startDate: startOfYear(new Date(y, 0, 1)),
        endDate:   endOfYear(new Date(y, 0, 1)),
      };
    }

    try {
      await dispatch(fetchMyPayslips({
        page: p, limit: l, type: t,
        ...dateRange,
        ...(s && { search: s }),
      })).unwrap();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.message || "Failed to fetch payslips");
      }
    }
  }, [dispatch, handleAuthError]);

  useEffect(() => { runFetch(); }, [fetchKey]); // eslint-disable-line

  const resetFilters = useCallback(() => {
    setType("PAYSLIP");
    setSearch("");
    setSelectedMonth(null);
    setSelectedYear(null);
    setPage(1);
  }, []);

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

  // ── Columns — earned fields only ─────────────────────────────────────────
  const columns = useMemo(() => [
    {
      name: "S No.",
      cell: (_, i) => (page - 1) * limit + i + 1,
      width: "70px",
    },
    {
      name: "Month",
      cell: (row) => displayValue(monthLabel(row)),
      sortable: true,
      minWidth: "140px",
    },
    {
      name: "Type",
      cell: (row) => displayValue(row.payslipType),
      sortable: true,
      minWidth: "110px",
    },
    {
      name: "Employee Code",
      cell: (row) => displayValue(row.employeeCode),
      minWidth: "140px",
    },
    {
      name: "Employee Name",
      cell: (row) => displayValue(row.employeeName),
      minWidth: "180px",
    },
    {
      name: "Gross Salary",
      cell: (row) => displayMoney(row.grossSalary),
      right: true,
      minWidth: "130px",
    },
    {
      name: "Deductions",
      cell: (row) => displayMoney(row.deductions),
      right: true,
      minWidth: "120px",
    },
    {
      name: "Net Pay",
      cell: (row) => displayMoney(row.inHandSalary),
      right: true,
      minWidth: "140px",
    },
    {
      name: "Download",
      center: true,
      minWidth: "110px",
      cell: (row) => (
        <Button
          color="primary"
          size="sm"
          className="d-inline-flex align-items-center justify-content-center text-white"
          onClick={() => handleDownload(row)}
          disabled={downloadingId === row._id}
          title="Download payslip"
        >
          {downloadingId === row._id ? <Spinner size="sm" /> : <Download size={15} />}
        </Button>
      ),
    },
  ], [data, downloadingId, limit, page]); // eslint-disable-line

  return (
    <CardBody className="p-3 bg-white" style={{ width: "100%" }}>
      <div className="mb-4 text-center text-md-start">
        <h4 className="fw-bold text-primary mb-0">MY PAY SLIPS</h4>
      </div>

      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">

        <div style={{ minWidth: 160 }}>
          <Select
            value={TYPE_OPTIONS.find((o) => o.value === type)}
            onChange={(opt) => opt && setType(opt.value)}
            options={TYPE_OPTIONS}
            classNamePrefix="react-select"
            placeholder="Type"
            isSearchable={false}
          />
        </div>

        <div style={{ minWidth: 250 }}>
          <Input
            type="text"
            placeholder="Search name, employee ID, month…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {type === "PAYSLIP" && (
          <div style={{ minWidth: 175 }}>
            <div className="position-relative month-picker">
              <Calendar size={14} className="position-absolute calendar-icon" />
              <Flatpickr
                value={selectedMonth}
                options={{
                  plugins: [monthSelectPlugin({ shorthand: false, dateFormat: "Y-m", altFormat: "F Y" })],
                  altInput: true,
                  disableMobile: true,
                  allowInput: true,
                }}
                onChange={([date]) => setSelectedMonth(date ?? null)}
                placeholder="Filter by month"
                className="form-control form-control-sm"
              />
            </div>
          </div>
        )}

        {type === "FORM" && (
          <div style={{ minWidth: 140 }}>
            <Select
              isClearable
              value={YEAR_OPTIONS.find((o) => o.value === selectedYear) ?? null}
              onChange={(opt) => setSelectedYear(opt?.value ?? null)}
              options={YEAR_OPTIONS}
              classNamePrefix="react-select"
              placeholder="Year"
              isSearchable={false}
            />
          </div>
        )}

        <div className="d-flex gap-2 ms-auto">
          <RefreshButton loading={loading} onRefresh={runFetch} />
          <Button
            color="light"
            className="d-inline-flex align-items-center gap-1"
            onClick={resetFilters}
          >
            <RotateCcw size={15} /> Reset
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
        loading={loading}
        pagination={pagination}
        noDataComponent="No payslips found"
      />
    </CardBody>
  );
};

export default MyPaySlipsTab;