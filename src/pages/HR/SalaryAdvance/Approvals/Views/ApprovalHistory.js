import { useDispatch, useSelector } from "react-redux";
import { useAuthError } from "../../../../../Components/Hooks/useAuthError";
import { useEffect, useState } from "react";
import { usePermissions } from "../../../../../Components/Hooks/useRoles";
import { useMediaQuery } from "../../../../../Components/Hooks/useMediaQuery";
import { fetchAdvanceSalaries } from "../../../../../store/features/HR/hrSlice";
import { toast } from "react-toastify";
import { capitalizeWords } from "../../../../../utils/toCapitalize";
import { format } from "date-fns";
import { Input, Spinner } from "reactstrap";
import DataTable from "react-data-table-component";
import PropTypes from "prop-types";
import Select from "react-select";
import { ExpandableText } from "../../../../../Components/Common/ExpandableText";
import { renderStatusBadge } from "../../../../../Components/Common/renderStatusBadge";
import { formatCurrency } from "../../../../../utils/formatCurrency";

const ApprovalHistory = ({ activeTab }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.User);
  const { data, pagination, loading } = useSelector((state) => state.HR);
  const handleAuthError = useAuthError();
  const [selectedCenter, setSelectedCenter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [limit, setLimit] = useState(10);

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { hasPermission, roles } = usePermissions(token);
  const hasUserPermission = hasPermission("HR", "EXIT_EMPLOYEE_APPROVAL", "READ");

  const isMobile = useMediaQuery("(max-width: 1000px)");

  const centerOptions = [
    ...(user?.centerAccess?.length > 1
      ? [{
        value: "ALL",
        label: "All Centers",
        isDisabled: false,
      }]
      : []
    ),
    ...(
      user?.centerAccess?.map(id => {
        const center = user?.userCenters?.find(c => c._id === id);
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
      !user?.centerAccess?.includes(selectedCenter)
    ) {
      setSelectedCenter("ALL");
      setPage(1);
    }
  }, [selectedCenter, user?.centerAccess]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);


  const fetchAdvanceSalaryHistory = async () => {
    try {
      const centers =
        selectedCenter === "ALL"
          ? user?.centerAccess
          : !user?.centerAccess.length ? [] : [selectedCenter];

      await dispatch(fetchAdvanceSalaries({
        page,
        limit,
        centers,
        view: "HISTORY",
        ...search.trim() !== "" && { search: debouncedSearch }
      })).unwrap();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error.message || "Failed to fetch advance salary records");
      }
    }
  };

  useEffect(() => {
    if (activeTab === "HISTORY" && hasUserPermission) {
      fetchAdvanceSalaryHistory();
    }
  }, [page, limit, selectedCenter, debouncedSearch, user?.centerAccess, activeTab, roles]);

  const columns = [
    {
      name: <div>ECode</div>,
      selector: row => row?.employeeData?.eCode || "-",
      sortable: true,
    },
    {
      name: <div>Name</div>,
      selector: row => row?.employeeData?.name.toUpperCase() || "-",
      wrap: true,
      minWidth: "160px",
    },
    {
      name: <div>Current Location</div>,
      selector: row => capitalizeWords(row?.center?.title || "-"),
      wrap: true,
      minWidth: "120px",
    },
    {
      name: <div>Mobile Number</div>,
      selector: row => row?.employeeData?.mobile || "-",
      wrap: true,
      minWidth: "140px"
    },
    {
      name: <div>Date</div>,
      selector: row => {
        if (!row?.date) return "-";
        const date = new Date(row.date);
        if (isNaN(date)) return "-";
        return format(new Date(row.date), "dd-MM-yyyy")
      },
      wrap: true,
    },
    {
      name: <div>Amount</div>,
      selector: row => formatCurrency(row?.amount),
      wrap: true,
      minWidth: "140px"
    },
    {
      name: <div>Employee's Monthly Deduction Amount</div>,
      selector: row => formatCurrency(row?.monthlyDeductionAmount),
      wrap: true,
      minWidth: "160px"
    },
    {
      name: <div>Remaining Amount</div>,
      selector: row => formatCurrency(row?.remainingAmount),
      wrap: true,
      minWidth: "160px"
    },
    {
      name: <div>Payment Id</div>,
      selector: row => row?.centralPaymentId || "-",
      wrap: true,
      center: true
    },
    {
      name: <div>Filled By</div>,
      selector: row => (
        <div>
          <div>{capitalizeWords(row?.filledBy?.name || "-")}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {row?.filledBy?.email || "-"}
          </div>
        </div>
      ),
      wrap: true,
      minWidth: "200px",
    },
    {
      name: <div>Filled At</div>,
      selector: row => {
        if (!row?.filledAt) return "-";
        const date = new Date(row.filledAt);
        if (isNaN(date)) return "-";
        return format(date, "dd MMM yyyy, hh:mm a");
      },
      wrap: true,
      minWidth: "180px",
    },

    {
      name: <div>Acted By</div>,
      selector: row => (
        <div>
          <div>{capitalizeWords(row?.actedBy?.name || "-")}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {row?.actedBy?.email || "-"}
          </div>
        </div>
      ),
      wrap: true,
      minWidth: "200px",
    },
    {
      name: <div>Action Time</div>,
      selector: row => {
        const t = row?.actedAt;
        if (!t) return "-";
        const date = new Date(t);
        if (isNaN(date)) return "-";
        return format(date, "dd MMM yyyy, hh:mm a");
      },
      wrap: true,
      minWidth: "180px",
    },
    {
      name: <div>Note</div>,
      selector: row => <ExpandableText text={capitalizeWords(row?.note || "-")} />,
      wrap: true,
      minWidth: "180px",
    },
    {
      name: <div>Payment Type</div>,
      selector: row => row?.paymentType || "-",
      wrap: true,
      minWidth: "180px",
    },
    {
      name: <div>Status</div>,
      selector: row => renderStatusBadge(row?.status) || "-",
      wrap: true,
      minWidth: "140px"
    }

  ];


  return (
    <>
      <div className="mb-3">
        {/*  DESKTOP VIEW */}
        <div className="d-none d-md-flex justify-content-between align-items-center">

          <div className="d-flex gap-3 align-items-center">

            <div style={{ width: "200px" }}>
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

            <div style={{ width: "220px" }}>
              <Input
                type="text"
                className="form-control"
                placeholder="Search by name or Ecode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

          </div>

        </div>

        {/*  MOBILE VIEW */}
        <div className="d-flex d-md-none flex-column gap-3">
          <div style={{ width: "100%" }}>
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
          <div style={{ width: "100%" }}>
            <Input
              type="text"
              className="form-control"
              placeholder="Search by name name or Ecode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={data}
        highlightOnHover
        pagination
        paginationServer
        paginationTotalRows={pagination?.totalDocs}
        paginationPerPage={limit}
        paginationDefaultPage={page}
        progressPending={loading}
        striped
        fixedHeader
        fixedHeaderScrollHeight="500px"
        dense={isMobile}
        responsive
        customStyles={{
          table: {
            style: {
              minHeight: "450px",
            },
          },
          headCells: {
            style: {
              backgroundColor: "#f8f9fa",
              fontWeight: "600",
              borderBottom: "2px solid #e9ecef",
            },
          },
          rows: {
            style: {
              minHeight: "60px",
              borderBottom: "1px solid #f1f1f1",
            },
          },
        }}
        progressComponent={
          <div className="py-4 text-center">
            <Spinner className="text-primary" />
          </div>
        }
        onChangePage={(newPage) => setPage(newPage)}
        onChangeRowsPerPage={(newLimit) => setLimit(newLimit)}
      />
    </>
  )
}

ApprovalHistory.prototype = {
  activeTab: PropTypes.string
}

export default ApprovalHistory;