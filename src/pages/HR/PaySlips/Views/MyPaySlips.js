import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, CardBody, Input, Spinner } from "reactstrap";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { endOfYear, startOfYear } from "date-fns";
import { Download, RotateCcw } from "lucide-react";
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
  { value: "PAYSLIP", label: "Payslip" },
  { value: "FORM",    label: "Form"    },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => {
  const y = currentYear - i;
  return { value: y, label: String(y) };
});

const initialFilters = readStickyFilters(FILTER_KEY, {
  type:   "PAYSLIP",
  search: "",
  year:   currentYear,
});

const MyPaySlipsTab = () => {
  const dispatch        = useDispatch();
  const handleAuthError = useAuthError();

  const [page,          setPage]          = useState(1);
  const [limit,         setLimit]         = useState(10);
  const [type,          setType]          = useState(initialFilters.type   || "PAYSLIP");
  const [search,        setSearch]        = useState(initialFilters.search || "");
  const [selectedYear,  setSelectedYear]  = useState(
    initialFilters.year ? Number(initialFilters.year) : currentYear
  );
  const [downloadingId, setDownloadingId] = useState("");

  const debouncedSearch = useDebouncedValue(search);

  const { data = [], loading, pagination } =
    useSelector((state) => state.HR.myPayslips);

  // ── Persist filters ────────────────────────────────────────────────────────
  useEffect(() => {
    writeStickyFilters(FILTER_KEY, {
      type,
      search,
      year: selectedYear ?? "",
    });
  }, [type, search, selectedYear]);

  // ── Reset page on filter change ────────────────────────────────────────────
  useEffect(() => {
    setPage(1);
  }, [type, selectedYear, limit, debouncedSearch]);

  const fetchKey = [
    type,
    selectedYear ?? "",
    page,
    limit,
    debouncedSearch.trim(),
  ].join("|");

  const paramsRef = useRef({});
  paramsRef.current = {
    type, selectedYear,
    page, limit, search: debouncedSearch.trim(),
  };

  const runFetch = useCallback(async () => {
    const { type: t, selectedYear: y, page: p, limit: l, search: s } = paramsRef.current;

    // FORM type → backend returns empty array; still call to keep state consistent
    let dateRange = {};
    if (y) {
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
    setSelectedYear(currentYear);
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
      name: "Deductions",
      cell: (row) => displayMoney(row.totalDeductions),
      right: true,
      minWidth: "120px",
    },
    {
      name: "Net Pay",
      cell: (row) => displayMoney(row.inHandSalary),
      right: true,
      minWidth: "110px",
    },
    {
      name: "LOP Days",
      cell: (row) => displayValue(row.lopDays),
      right: true,
      minWidth: "100px",
    },
    {
      name: "Days Attended",
      cell: (row) => displayValue(row.workingDaysAttended),
      right: true,
      minWidth: "120px",
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
    <CardBody className="p-3 bg-white" style={{ width: "80%" }}>
      <div className="mb-4 text-center text-md-start">
        <h4 className="fw-bold text-primary mb-0">MY PAY SLIPS</h4>
      </div>

      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">

        {/* Type filter */}
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

        {/* Search — works on name, employee code, center, designation */}
        <div style={{ minWidth: 280 }}>
          <Input
            type="text"
            placeholder="Search name, emp code, center, designation…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Year filter — shown for both PAYSLIP and FORM */}
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
        noDataComponent={
          type === "FORM"
            ? "Forms are not available yet"
            : "No payslips found"
        }
      />
    </CardBody>
  );
};

export default MyPaySlipsTab;