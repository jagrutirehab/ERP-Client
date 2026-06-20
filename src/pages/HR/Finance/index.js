import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { CardBody, Input, Button } from "reactstrap";
import Select from "react-select";
import { toast } from "react-toastify";
import { Pencil } from "lucide-react";
import RefreshButton from "../../../Components/Common/RefreshButton";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import {
  fetchDesignations,
  fetchFinance,
} from "../../../store/features/HR/hrSlice";
import { getDepartments } from "../../../helpers/backend_helper";
import {
  activeFinanceOptions,
  filterEmploymentOptions,
  statusOptions,
} from "../../../Components/constants/HR";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import DataTableComponent from "../../../Components/Common/DataTable";
import { formatCurrency } from "../../../utils/formatCurrency";
import { capitalizeWords } from "../../../utils/toCapitalize";
import FinanceModal from "../components/FinanceModal";
import { format } from "date-fns";
import { ExpandableText } from "../../../Components/Common/ExpandableText";

const AMOUNT_VIEWS = [
  { value: "BOTH", label: "Mo + Yr" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
];

const FinanceDashboard = () => {
  const dispatch = useDispatch();
  const { centerAccess, userCenters } = useSelector((state) => state.User);
  const { data, pagination, loading, designations, designationLoading } =
    useSelector((state) => state.HR);
  const handleAuthError = useAuthError();

  const [selectedCenter, setSelectedCenter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedDesignation, setSelectedDesignation] = useState(null);
  const [selectedEmploymentType, setSelectedEmploymentType] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedActive, setSelectedActive] = useState({
    value: "ACTIVE",
    label: "Active",
  });
  const [amountView, setAmountView] = useState("BOTH");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("CHANGE"); // "EDIT" or "CHANGE"
  const [selectedRecord, setSelectedRecord] = useState(null);

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission, roles } = usePermissions(token);
  const hasUserPermission = hasPermission("HR", "FINANCE", "READ");
  const hasEditPermission =
    hasPermission("HR", "FINANCE", "WRITE") ||
    hasPermission("HR", "FINANCE", "DELETE");
  const hasDeletePermission = hasPermission("HR", "FINANCE", "DELETE");

  const centerOptions = [
    ...(centerAccess?.length > 1
      ? [
        {
          value: "ALL",
          label: "All Centers",
          isDisabled: false,
        },
      ]
      : []),
    ...(centerAccess?.map((id) => {
      const center = userCenters?.find((c) => c._id === id);
      return {
        value: id,
        label: center?.title || "Unknown Center",
      };
    }) || []),
  ];

  const selectedCenterOption =
    centerOptions.find((opt) => opt.value === selectedCenter) ||
    centerOptions[0];

  useEffect(() => {
    if (selectedCenter !== "ALL" && !centerAccess?.includes(selectedCenter)) {
      setSelectedCenter("ALL");
      setPage(1);
    }
  }, [selectedCenter, centerAccess]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const deptRes = await getDepartments();
        setDepartmentOptions(
          (deptRes?.data || []).map((d) => ({
            label: d.department,
            value: d._id,
          })),
        );
        dispatch(fetchDesignations({ status: ["PENDING", "APPROVED"] }));
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error(error.message || "Failed to fetch designations");
        }
      }
    };
    fetchDropdowns();
  }, [dispatch]);

  const fetchEmployeeFinanceList = async () => {
    try {
      const centers =
        selectedCenter === "ALL"
          ? centerAccess
          : !centerAccess.length
            ? []
            : [selectedCenter];

      await dispatch(
        fetchFinance({
          page,
          limit,
          centers,
          view: selectedActive.value,
          ...(search.trim() !== "" && { search: debouncedSearch }),
          ...(selectedDepartment && { department: selectedDepartment.value }),
          ...(selectedDesignation && {
            designation: selectedDesignation.value,
          }),
          ...(selectedEmploymentType && {
            employmentType: selectedEmploymentType.value,
          }),
          ...(selectedStatus && { status: selectedStatus.value }),
        }),
      ).unwrap();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error.message || "Failed to fetch finance list");
      }
    }
  };

  useEffect(() => {
    if (hasUserPermission) {
      fetchEmployeeFinanceList();
    }
  }, [
    page,
    limit,
    selectedCenter,
    debouncedSearch,
    centerAccess,
    roles,
    selectedDepartment,
    selectedDesignation,
    selectedEmploymentType,
    selectedStatus,
    selectedActive,
  ]);

  const renderAmount = (monthlyVal, annualVal) => {
    const monthly = formatCurrency(monthlyVal);
    if (amountView === "MONTHLY") return monthly;
    const yearly = formatCurrency(
      annualVal != null && !isNaN(annualVal) ? annualVal : 0,
    );
    if (amountView === "YEARLY") return yearly;
    return (
      <div style={{ lineHeight: 1.4 }}>
        <div style={{ fontSize: "0.8rem", fontWeight: 500 }}>{monthly}</div>
        <div style={{ fontSize: "0.7rem", color: "#6c757d" }}>{yearly}/yr</div>
      </div>
    );
  };

  const amountHeader = (label) => (
    <div>
      <div>{label}</div>
      {amountView === "BOTH" && (
        <div style={{ fontSize: "0.65rem", color: "#6c757d", fontWeight: 400 }}>
          Mo / Yr
        </div>
      )}
    </div>
  );

  const colWidth = amountView === "BOTH" ? "160px" : "130px";

  const columns = [
    ...(hasEditPermission
      ? [
        {
          name: <div>Action</div>,
          cell: (row) => (
            <button
              className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
              title="Edit Finance"
              onClick={() => {
                setSelectedRecord(row);
                setModalMode("EDIT");
                setModalOpen(true);
              }}
            >
              <Pencil size={16} />
            </button>
          ),
          width: "70px",
          ignoreRowClick: true,
        },
      ]
      : []),
    {
      name: <div>ECode</div>,
      selector: (row) => row?.employee?.eCode || "-",
      sortable: true,
      minWidth: "110px",
    },
    {
      name: <div>Employee Name</div>,
      selector: (row) => row?.employee?.name || "-",
      sortable: true,
      wrap: true,
      minWidth: "180px",
    },
    {
      name: <div>Center</div>,
      selector: (row) => row?.employee?.center?.title || "-",
      sortable: true,
      wrap: true,
      minWidth: "150px",
    },
    {
      name: <div>Department</div>,
      selector: (row) => capitalizeWords(row?.employee?.department || "-"),
      sortable: true,
      wrap: true,
      minWidth: "150px",
    },
    {
      name: <div>Designation</div>,
      selector: (row) =>
        capitalizeWords(
          row?.employee?.designation?.name?.replace(/_/g, " ") || "-",
        ),
      wrap: true,
      minWidth: "150px",
    },
    {
      name: <div>Position</div>,
      selector: (row) =>
        capitalizeWords(
          row?.employee?.position?.name?.replace(/_/g, " ") || "-",
        ),
      wrap: true,
      minWidth: "150px",
    },
    {
      name: <div>Current Status</div>,
      selector: (row) =>
        capitalizeWords(row?.employee?.status?.replace(/_/g, " ") || "-"),
      sortable: true,
      minWidth: "100px",
    },
    {
      name: <div>Change Type</div>,
      selector: (row) =>
        capitalizeWords(row?.changeType?.replace(/_/g, " ") || "-"),
      sortable: true,
      minWidth: "130px",
    },
    {
      name: <div>Employee Group</div>,
      selector: (row) =>
        capitalizeWords(
          row?.financeDetails?.employeeGroups?.replace(/_/g, " "),
        ) || "-",
      sortable: true,
      wrap: true,
      minWidth: "150px",
    },
    {
      name: <div>Account Type</div>,
      selector: (row) =>
        capitalizeWords(row?.financeDetails?.account?.replace(/_/g, " ")) ||
        "-",
      sortable: true,
      wrap: true,
      minWidth: "160px",
    },
    {
      name: amountHeader("Short Wages"),
      selector: (row) => row?.financeDetails?.shortWages,
      cell: (row) => renderAmount(row?.financeDetails?.shortWages),
      sortable: true,
      minWidth: colWidth,
    },
    {
      name: amountHeader("Minimum Wages"),
      selector: (row) => row?.financeDetails?.minimumWages,
      cell: (row) => renderAmount(row?.financeDetails?.minimumWages),
      sortable: true,
      minWidth: colWidth,
    },
    {
      name: <div>HRA %</div>,
      selector: (row) => row?.financeDetails?.HRAPercentage ?? "-",
      sortable: true,
      minWidth: "90px",
    },
    {
      name: <div>Basic %</div>,
      selector: (row) => row?.financeDetails?.basicPercentage ?? "-",
      sortable: true,
      minWidth: "90px",
    },
    {
      name: amountHeader("Basic Salary"),
      selector: (row) => row?.financeDetails?.basicAmount,
      cell: (row) =>
        renderAmount(
          row?.financeDetails?.basicAmount,
          row?.financeDetails?.annual?.basicAmount,
        ),
      sortable: true,
      minWidth: colWidth,
    },
    {
      name: amountHeader("HRA"),
      selector: (row) => row?.financeDetails?.HRAAmount,
      cell: (row) =>
        renderAmount(
          row?.financeDetails?.HRAAmount,
          row?.financeDetails?.annual?.HRAAmount,
        ),
      sortable: true,
      minWidth: colWidth,
    },
    {
      name: amountHeader("SPL Allowance"),
      selector: (row) => row?.financeDetails?.SPLAllowance,
      cell: (row) =>
        renderAmount(
          row?.financeDetails?.SPLAllowance,
          row?.financeDetails?.annual?.SPLAllowance,
        ),
      sortable: true,
      minWidth: colWidth,
    },
    {
      name: amountHeader("Conveyance Allowance"),
      selector: (row) => row?.financeDetails?.conveyanceAllowance,
      cell: (row) =>
        renderAmount(
          row?.financeDetails?.conveyanceAllowance,
          row?.financeDetails?.annual?.conveyanceAllowance,
        ),
      sortable: true,
      minWidth: colWidth,
    },
    {
      name: amountHeader("Statutory Bonus"),
      selector: (row) => row?.financeDetails?.statutoryBonus,
      cell: (row) =>
        renderAmount(
          row?.financeDetails?.statutoryBonus,
          row?.financeDetails?.annual?.statutoryBonus,
        ),
      sortable: true,
      minWidth: colWidth,
    },
    {
      name: amountHeader("Gross Salary"),
      selector: (row) => row?.financeDetails?.grossSalary,
      cell: (row) =>
        renderAmount(
          row?.financeDetails?.grossSalary,
          row?.financeDetails?.annual?.grossSalary,
        ),
      sortable: true,
      minWidth: colWidth,
    },
    {
      name: amountHeader("Variable"),
      selector: (row) => row?.financeDetails?.variable,
      cell: (row) =>
        renderAmount(
          row?.financeDetails?.variable,
          row?.financeDetails?.annual?.variable,
        ),
      sortable: true,
      minWidth: colWidth,
    },
    {
      name: amountHeader("Reimbursement"),
      selector: (row) => row?.financeDetails?.reimbursement,
      cell: (row) =>
        renderAmount(
          row?.financeDetails?.reimbursement,
          row?.financeDetails?.annual?.reimbursement,
        ),
      sortable: true,
      minWidth: colWidth,
    },
    {
      name: amountHeader("Insurance"),
      selector: (row) => row?.financeDetails?.insurance,
      cell: (row) =>
        renderAmount(
          row?.financeDetails?.insurance,
          row?.financeDetails?.annual?.insurance,
        ),
      sortable: true,
      minWidth: colWidth,
    },
    {
      name: amountHeader("ESIC Salary"),
      selector: (row) => row?.financeDetails?.ESICSalary,
      cell: (row) => renderAmount(row?.financeDetails?.ESICSalary, row?.financeDetails?.annual?.ESICSalary),
      sortable: true,
      minWidth: colWidth,
    },
    {
      name: amountHeader("LWF Employer"),
      selector: (row) => row?.financeDetails?.LWFEmployer,
      cell: (row) =>
        renderAmount(
          row?.financeDetails?.LWFEmployer,
          row?.financeDetails?.annual?.LWFEmployer,
        ),
      sortable: true,
      minWidth: colWidth,
    },
    {
      name: amountHeader("PF Employee"),
      selector: (row) => row?.financeDetails?.PFEmployee,
      cell: (row) =>
        renderAmount(
          row?.financeDetails?.PFEmployee,
          row?.financeDetails?.annual?.PFEmployee,
        ),
      sortable: true,
      minWidth: colWidth,
    },
    {
      name: amountHeader("PF Employer"),
      selector: (row) => row?.financeDetails?.PFEmployer,
      cell: (row) =>
        renderAmount(
          row?.financeDetails?.PFEmployer,
          row?.financeDetails?.annual?.PFEmployer,
        ),
      sortable: true,
      minWidth: colWidth,
    },
    {
      name: amountHeader("PF Amount"),
      selector: (row) => row?.financeDetails?.PFAmount,
      cell: (row) =>
        renderAmount(
          row?.financeDetails?.PFAmount,
          row?.financeDetails?.annual?.PFAmount,
        ),
      sortable: true,
      minWidth: colWidth,
    },
    {
      name: amountHeader("PT"),
      selector: (row) => row?.financeDetails?.PT,
      cell: (row) =>
        renderAmount(
          row?.financeDetails?.PT,
          row?.financeDetails?.annual?.PT,
        ),
      sortable: true,
      minWidth: colWidth,
    },
    {
      name: amountHeader("ESIC Employee"),
      selector: (row) => row?.financeDetails?.ESICEmployee,
      cell: (row) =>
        renderAmount(
          row?.financeDetails?.ESICEmployee,
          row?.financeDetails?.annual?.ESICEmployee,
        ),
      sortable: true,
      minWidth: colWidth,
    },
    {
      name: amountHeader("ESIC Employer"),
      selector: (row) => row?.financeDetails?.ESICEmployer,
      cell: (row) =>
        renderAmount(
          row?.financeDetails?.ESICEmployer,
          row?.financeDetails?.annual?.ESICEmployer,
        ),
      sortable: true,
      minWidth: colWidth,
    },
    {
      name: amountHeader("In Hand Salary"),
      selector: (row) => row?.financeDetails?.inHandSalary,
      cell: (row) =>
        renderAmount(
          row?.financeDetails?.inHandSalary,
          row?.financeDetails?.annual?.inHandSalary,
        ),
      sortable: true,
      minWidth: colWidth,
    },
    {
      name: <div>Debit Statement Narration</div>,
      selector: (row) => row?.financeDetails?.debitStatementNarration || "-",
      sortable: true,
      wrap: true,
      minWidth: "180px",
    },
    {
      name: <div>Increment Issued</div>,
      selector: (row) => {
        const date = row?.financeDetails?.incrementIssued;
        if (!date || isNaN(new Date(date))) return "-";
        return format(new Date(date), "dd MMM yyyy");
      },
      wrap: true,
      minWidth: "150px",
    },
    {
      name: <div>Increment Letter</div>,
      selector: (row) => {
        if (!row?.financeDetails?.incrementLetter) return "-";
        return (
          <a
            href={row.financeDetails.incrementLetter}
            target="_blank"
            rel="noreferrer"
            style={{
              color: "#007bff",
              textDecoration: "underline",
              fontSize: "0.875rem",
            }}
          >
            View
          </a>
        );
      },
      wrap: true,
      minWidth: "130px",
    },
    {
      name: <div>Active</div>,
      selector: (row) => (row?.isActive ? "Yes" : "No"),
    },
    {
      name: <div>Note</div>,
      selector: (row) => (
        <ExpandableText text={capitalizeWords(row?.note)} maxLength={50} />
      ),
      wrap: true,
      minWidth: "200px",
    },
    {
      name: <div>Start From</div>,
      selector: (row) => {
        const createdAt = row?.createdAt;
        if (!createdAt || isNaN(new Date(createdAt))) {
          return "-";
        }
        return format(new Date(createdAt), "dd MMM yyyy, hh:mm a");
      },
      wrap: true,
      minWidth: "180px",
    },
    {
      name: <div>Ended At</div>,
      selector: (row) => {
        const endedAt = row?.endedAt;
        if (!endedAt || isNaN(new Date(endedAt))) {
          return "-";
        }
        return format(new Date(endedAt), "dd MMM yyyy, hh:mm a");
      },
      wrap: true,
      minWidth: "180px",
    },
    {
      name: <div>Last Updated</div>,
      selector: (row) => {
        const updatedAt = row?.updatedAt;
        if (!updatedAt || isNaN(new Date(updatedAt))) {
          return "-";
        }
        return format(new Date(updatedAt), "dd MMM yyyy, hh:mm a");
      },
      wrap: true,
      minWidth: "180px",
    },
  ];

  return (
    <CardBody
      className="bg-white p-2 p-md-3"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <div className="content-wrapper">
        <div className="text-center text-md-left mb-2">
          <h1 className="h4 fw-bold text-primary mb-0">FINANCE</h1>
        </div>
      </div>
      <div className="mb-3">
        <div className="row g-2 mb-2">
          <div className="col-md-2">
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
          </div>
          <div className="col-md-2">
            <Input
              type="text"
              className="form-control"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <Select
              value={selectedActive}
              onChange={(option) => {
                setSelectedActive(option);
                setPage(1);
              }}
              options={activeFinanceOptions}
              placeholder="Filter by Active"
              classNamePrefix="react-select"
            />
          </div>
          <div className="col-md-3">
            <Select
              value={selectedStatus}
              onChange={(option) => {
                setSelectedStatus(option);
                setPage(1);
              }}
              options={statusOptions}
              placeholder="Filter by Status"
              classNamePrefix="react-select"
              isClearable
            />
          </div>
          <div className="col-md-3">
            <Select
              value={selectedEmploymentType}
              onChange={(option) => {
                setSelectedEmploymentType(option);
                setPage(1);
              }}
              options={filterEmploymentOptions}
              placeholder="Filter by Employment"
              classNamePrefix="react-select"
              isClearable
            />
          </div>
        </div>

        <div className="row g-2 mb-2">
          <div className="col-md-3">
            <Select
              value={selectedDepartment}
              onChange={(option) => {
                setSelectedDepartment(option);
                setPage(1);
              }}
              options={departmentOptions}
              placeholder="Filter by Department"
              classNamePrefix="react-select"
              isClearable
            />
          </div>
          <div className="col-md-3">
            <Select
              value={selectedDesignation}
              onChange={(option) => {
                setSelectedDesignation(option);
                setPage(1);
              }}
              options={designations}
              placeholder="Filter by Designation"
              classNamePrefix="react-select"
              isClearable
              isLoading={designationLoading}
            />
          </div>
          <div className="col-md-6 d-flex justify-content-end gap-2 align-items-center flex-wrap">
            <div
              className="btn-group btn-group-sm"
              role="group"
              title="Amount display mode"
            >
              {AMOUNT_VIEWS.map((v) => (
                <button
                  key={v.value}
                  type="button"
                  className={`btn btn-${amountView === v.value ? "primary" : "outline-primary"}`}
                  onClick={() => setAmountView(v.value)}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <RefreshButton
              loading={loading}
              onRefresh={fetchEmployeeFinanceList}
            />
            {hasDeletePermission && (
              <Button
                color="primary"
                className="text-white"
                size="sm"
                onClick={() => {
                  setSelectedRecord(null);
                  setModalMode("CHANGE");
                  setModalOpen(true);
                }}
              >
                + Manage Salary
              </Button>
            )}
          </div>
        </div>
      </div>
      <DataTableComponent
        columns={columns}
        data={data}
        loading={loading}
        pagination={pagination}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
      />

      <FinanceModal
        isOpen={modalOpen}
        toggle={() => {
          setModalOpen(false);
          setSelectedRecord(null);
        }}
        initialData={selectedRecord}
        onUpdate={() => {
          setSelectedRecord(null);
          fetchEmployeeFinanceList();
        }}
        mode={modalMode}
      />
    </CardBody>
  );
};

export default FinanceDashboard;
