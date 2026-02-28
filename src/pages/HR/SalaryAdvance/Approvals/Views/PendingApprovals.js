import { useDispatch, useSelector } from "react-redux";
import { useAuthError } from "../../../../../Components/Hooks/useAuthError";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { usePermissions } from "../../../../../Components/Hooks/useRoles";
import { useMediaQuery } from "../../../../../Components/Hooks/useMediaQuery";
import { fetchAdvanceSalaries } from "../../../../../store/features/HR/hrSlice";
import { toast } from "react-toastify";
import { advanceSalaryAction, deleteAdvanceSalary } from "../../../../../helpers/backend_helper";
import { capitalizeWords } from "../../../../../utils/toCapitalize";
import { format } from "date-fns";
import CheckPermission from "../../../../../Components/HOC/CheckPermission";
import { Button, Input, Spinner } from "reactstrap";
import { CheckCheck, Pencil, Trash2, X } from "lucide-react";
import DataTable from "react-data-table-component";
import DeleteConfirmModal from "../../../components/DeleteConfirmModal";
import ApproveModal from "../../../components/ApproveModal";
import PropTypes from "prop-types";
import Select from "react-select";
import EditSalaryAdvanceModal from "../../../components/EditSalaryAdvanceModal";
import { formatCurrency } from "../../../../../utils/formatCurrency";
import RefreshButton from "../../../../../Components/Common/RefreshButton";

const PendingApprovals = ({ activeTab }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.User);
  const { data, pagination, loading } = useSelector((state) => state.HR);
  const handleAuthError = useAuthError();
  const [searchParams, setSearchParams] = useSearchParams();
  const querySearch = searchParams.get("q") || "";
  const queryCenter = searchParams.get("center") || "ALL";
  const [search, setSearch] = useState(querySearch);
  const [debouncedSearch, setDebouncedSearch] = useState(querySearch);
  const [selectedCenter, setSelectedCenter] = useState(queryCenter);
  const [page, setPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [limit, setLimit] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null); // APPROVE | REJECT
  const [note, setNote] = useState("");
  const [paymentType, setPaymentType] = useState(""); //CASH | CENTRAL

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { hasPermission, roles } = usePermissions(token);
  const hasUserPermission = hasPermission("HR", "SALARY_ADVANCE_APPROVAL", "READ");

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
      setSearchParams((prev) => {
        if (search.trim()) {
          prev.set("q", search);
        } else {
          prev.delete("q");
          prev.delete("tab");
          prev.delete("center");
        }
        return prev;
      });
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const c = searchParams.get("center") || "ALL";
    setSearch(q);
    setDebouncedSearch(q);
    setSelectedCenter(c);
    setPage(1);
  }, [activeTab]);

  const fetchPendingAdvanceSalaryApprovals = async () => {
    try {
      const centers =
        selectedCenter === "ALL"
          ? user?.centerAccess
          : !user?.centerAccess.length ? [] : [selectedCenter];

      await dispatch(fetchAdvanceSalaries({
        page,
        limit,
        centers,
        view: "PENDING",
        ...search.trim() !== "" && { search: debouncedSearch }
      })).unwrap();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error.message || "Failed to fetch advance salary records");
      }
    }
  };

  useEffect(() => {
    if (activeTab === "PENDING" && hasUserPermission) {
      fetchPendingAdvanceSalaryApprovals();
    }
  }, [page, limit, selectedCenter, debouncedSearch, user?.centerAccess, activeTab]);

  const handleDelete = async () => {
    setModalLoading(true);
    try {
      await deleteAdvanceSalary(selectedRecord._id);
      toast.success("Request deleted successfully");
      setPage(1);
      fetchPendingAdvanceSalaryApprovals();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error.message || "Failed to delete the request")
      }
    } finally {
      setDeleteModalOpen(false);
      setModalLoading(false);
    }
  }

  const handleAction = async () => {
    setModalLoading(true);
    try {
      const response = await advanceSalaryAction(selectedRecord._id, {
        action: actionType,
        note,
        ...(actionType === "APPROVE" ? { paymentType } : {})
      });
      toast.success(response.message);
      setPage(1);
      fetchPendingAdvanceSalaryApprovals();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error.message || "Action failed");
      }
    } finally {
      setApproveModalOpen(false);
      setModalLoading(false);
    }
  }

  const columns = [
    {
      name: <div>ECode</div>,
      selector: row => row?.employeeData?.eCode || "-",
      sortable: true,
    },
    {
      name: <div>Name</div>,
      selector: row => row?.employeeData?.name?.toUpperCase() || "-",
      wrap: true,
      minWidth: "160px"
    },
    {
      name: <div>Current Location</div>,
      selector: row => capitalizeWords(row?.center?.title || "-"),
      wrap: true,
      minWidth: "120px"
    },
    {
      name: <div>Mobile Number</div>,
      selector: row => row?.employeeData?.mobile,
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
      name: <div>Payment Id</div>,
      selector: row => row.centralPaymentId || "-",
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

    ...(hasPermission("HR", "SALARY_ADVANCE_APPROVAL", "WRITE")
      ? [
        {
          name: <div>Actions</div>,
          cell: row => (
            <div className="d-flex gap-2">
              <CheckPermission
                accessRolePermission={roles?.permissions}
                subAccess="SALARY_ADVANCE_APPROVAL"
                permission="edit"
              >
                <Button
                  color="success"
                  className="text-white"
                  size="sm"
                  onClick={() => {
                    setSelectedRecord(row);
                    setActionType("APPROVE")
                    setApproveModalOpen(true);
                  }}
                >
                  <CheckCheck size={18} />
                </Button>

                <Button
                  color="danger"
                  className="text-white"
                  size="sm"
                  onClick={() => {
                    setSelectedRecord(row);
                    setActionType("REJECT");
                    setApproveModalOpen(true);
                  }}
                >
                  <X size={16} />
                </Button>
                <Button
                  color="primary"
                  outline
                  size="sm"
                  onClick={() => {
                    setSelectedRecord(row);
                    setModalOpen(true);
                  }}
                >
                  <Pencil size={16} />
                </Button>
              </CheckPermission>
              <CheckPermission
                accessRolePermission={roles?.permissions}
                subAccess="SALARY_ADVANCE_APPROVAL"
                permission="delete"
              >
                <Button
                  color="danger"
                  size="sm"
                  className="text-white"
                  onClick={() => {
                    setSelectedRecord(row);
                    setDeleteModalOpen(true);
                  }}
                >
                  <Trash2 size={16} />
                </Button>
              </CheckPermission>
            </div>
          ),
          ignoreRowClick: true,
          allowOverflow: true,
          button: true,
          minWidth: "180px"
        }
      ]
      : [])
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

          <RefreshButton loading={loading} onRefresh={fetchPendingAdvanceSalaryApprovals} />
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
              placeholder="Search by name or Ecode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="d-flex justify-content-end">
            <RefreshButton loading={loading} onRefresh={fetchPendingAdvanceSalaryApprovals} />
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

      <EditSalaryAdvanceModal
        isOpen={modalOpen}
        toggle={() => {
          setModalOpen(!modalOpen);
          setSelectedRecord(null);
        }}
        initialData={selectedRecord}
        onUpdate={() => {
          setSelectedRecord(null);
          setPage(1);
          fetchPendingAdvanceSalaryApprovals();
        }}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        toggle={() => {
          setDeleteModalOpen(!deleteModalOpen);
          setSelectedRecord(null);
        }}
        onConfirm={handleDelete}
        loading={modalLoading}
      />

      <ApproveModal
        isOpen={approveModalOpen}
        toggle={() => {
          setApproveModalOpen(false);
          setNote("");
          setActionType(null);
          setSelectedRecord(null);
        }}
        onSubmit={handleAction}
        mode="SALARY_ADVANCE"
        loading={modalLoading}
        actionType={actionType}
        setActionType={setActionType}
        note={note}
        setNote={setNote}
        paymentType={paymentType}
        setPaymentType={setPaymentType}

      />
    </>
  )
}

PendingApprovals.prototype = {
  activeTab: PropTypes.string
};

export default PendingApprovals;