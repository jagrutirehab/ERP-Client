import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuthError } from "../../../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../../../Components/Hooks/useRoles";
import { useMediaQuery } from "../../../../../Components/Hooks/useMediaQuery";
import {
  fetchDesignations,
  fetchHirings,
} from "../../../../../store/features/HR/hrSlice";
import { toast } from "react-toastify";
import {
  deleteHiring,
  hiringAction,
} from "../../../../../helpers/backend_helper";
import ApproveModal from "../../../components/ApproveModal";
import DeleteConfirmModal from "../../../components/DeleteConfirmModal";
import EditHiringModal from "../../../components/EditHiringModal";
import { Button, Spinner } from "reactstrap";
import DataTable from "react-data-table-component";
import Select from "react-select";
import { HiringPreferredGenderOptions } from "../../../../../Components/constants/HR";
import { capitalizeWords } from "../../../../../utils/toCapitalize";
import { renderStatusBadge } from "../../../../../Components/Common/renderStatusBadge";
import { format } from "date-fns";
import CheckPermission from "../../../../../Components/HOC/CheckPermission";
import { CheckCheck, Pencil, Trash2, X } from "lucide-react";

const PendingApprovals = ({ activeTab }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.User);
  const {
    data,
    pagination,
    loading,
    designations: designationOptions,
  } = useSelector((state) => state.HR);
  const handleAuthError = useAuthError();
  const [filters, setFilters] = useState({
    center: "ALL",
    designation: null,
    gender: null,
  });
  const [page, setPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [limit, setLimit] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [note, setNote] = useState("");

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { hasPermission, roles } = usePermissions(token);
  const hasUserPermission = hasPermission("HR", "HIRING_APPROVAL", "READ");

  const isMobile = useMediaQuery("(max-width: 1000px)");

  const centerOptions = [
    ...(user?.centerAccess?.length > 1
      ? [
          {
            value: "ALL",
            label: "All Centers",
            isDisabled: false,
          },
        ]
      : []),
    ...(user?.centerAccess?.map((id) => {
      const center = user?.userCenters?.find((c) => c._id === id);
      return {
        value: id,
        label: center?.title || "Unknown Center",
      };
    }) || []),
  ];

  const selectedCenterOption =
    centerOptions.find((opt) => opt.value === filters.center) ||
    centerOptions[0];

  const selectedGenderOption =
    HiringPreferredGenderOptions.find((opt) => opt.value === filters.gender) ||
    null;

  const selectedDesignationOption =
    designationOptions.find((opt) => opt.value === filters.designation) || null;

  useEffect(() => {
    if (
      filters.center !== "ALL" &&
      !user?.centerAccess?.includes(filters.center)
    ) {
      setFilters("ALL");
      setPage(1);
    }
  }, [filters.center, user?.centerAccess]);

  useEffect(() => {
    const loadDesignations = async () => {
      try {
        dispatch(
          fetchDesignations({ status: ["PENDING", "APPROVED"] }),
        ).unwrap();
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error("Something went wrong while getting the designations");
        }
      }
    };

    loadDesignations();
  }, []);

  const fetchPendingHiringApprovals = async () => {
    try {
      const centers =
        filters.center === "ALL"
          ? user?.centerAccess
          : !user?.centerAccess.length
            ? []
            : [filters.center];

      await dispatch(
        fetchHirings({
          page,
          limit,
          centers,
          view: "PENDING",
          ...(filters.designation ? { designation: filters.designation } : {}),
          ...(filters.gender ? { gender: filters.gender } : {}),
        }),
      ).unwrap();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error.message || "Failed to fetch Hiring Requests");
      }
    }
  };

  useEffect(() => {
    if (activeTab === "PENDING" && hasUserPermission) {
      fetchPendingHiringApprovals();
    }
  }, [page, limit, filters, user?.centerAccess, activeTab]);

  const handleDelete = async () => {
    setModalLoading(true);
    try {
      await deleteHiring(selectedRecord._id);
      toast.success("Request deleted successfully");
      setPage(1);
      fetchPendingHiringApprovals();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error.message || "Failed to delete the request");
      }
    } finally {
      setDeleteModalOpen(false);
      setModalLoading(false);
    }
  };

  const handleAction = async (payload) => {
    setModalLoading(true);
    try {
      const response = await hiringAction(selectedRecord._id, {
        action: actionType,
        note,
        hr: payload.hr,
      });
      toast.success(response.message);
      setPage(1);
      fetchPendingHiringApprovals();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error.message || "Action failed");
      }
    } finally {
      setApproveModalOpen(false);
      setModalLoading(false);
    }
  };

  const columns = [
    {
      name: <div>Designation</div>,
      selector: (row) => {
        return (
          <div className="d-flex align-items-center flex-wrap gap-1">
            <span className="fw-semibold">
              {capitalizeWords(
                row.designation?.name?.toLowerCase().replace(/_/g, " "),
              )}
            </span>
            {row?.designation?.status === "PENDING" &&
              renderStatusBadge(row?.designation?.status)}
          </div>
        );
      },
      wrap: true,
      minWidth: "150px",
    },
    {
      name: <div>Center</div>,
      selector: (row) => capitalizeWords(row?.center?.title || "-"),
      wrap: true,
      minWidth: "120px",
    },
    {
      name: <div>Raised For</div>,
      selector: (row) => (
        <div>
          <div>{capitalizeWords(row?.centerManager?.name || "-")}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {row?.centerManager?.email || "-"}
          </div>
        </div>
      ),
      wrap: true,
      minWidth: "200px",
    },
    {
      name: <div>Preferred Gender</div>,
      selector: (row) =>
        HiringPreferredGenderOptions.find(
          (opt) => opt.value === row?.preferredGender
        )?.label || row?.preferredGender || "-",
       minWidth: "160px"
    },
    {
      name: <div>Position Approval Status</div>,
      selector: (row) => renderStatusBadge(row?.status),
       minWidth: "170px"
    },
    {
      name: <div>Contact Number</div>,
      selector: (row) => row?.contactNumber || "-",
      wrap: true,
      minWidth: "140px",
    },
    {
      name: <div>Required Count</div>,
      selector: (row) => row?.requiredCount || "-",
      wrap: true,
      center: true,
    },
    {
      name: <div>Filled By</div>,
      selector: (row) => (
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
      selector: (row) => {
        if (!row?.updatedAt) return "-";
        const date = new Date(row.updatedAt);
        if (isNaN(date)) return "-";
        return format(date, "dd MMM yyyy, hh:mm a");
      },
      wrap: true,
      minWidth: "180px",
    },
    ...(hasPermission("HR", "HIRING_APPROVAL", "WRITE")
      ? [
          {
            name: <div>Actions</div>,
            cell: (row) => (
              <div className="d-flex gap-2">
                <CheckPermission
                  accessRolePermission={roles?.permissions}
                  subAccess="HIRING_APPROVAL"
                  permission="edit"
                >
                  <Button
                    color="success"
                    className="text-white"
                    size="sm"
                    onClick={() => {
                      setSelectedRecord(row);
                      setActionType("APPROVE");
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
                  subAccess="HIRING_APPROVAL"
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
            minWidth: "180px",
          },
        ]
      : []),
  ];

  return (
    <>
      <div className="mb-3">
        <div className="d-flex flex-wrap gap-3 mb-3">
          {/* Center */}
          <div style={{ width: isMobile ? "100%" : "200px" }}>
            <Select
              options={centerOptions}
              value={selectedCenterOption}
              onChange={(opt) => {
                setFilters((prev) => ({
                  ...prev,
                  center: opt?.value || "ALL",
                }));
                setPage(1);
              }}
              placeholder="All Centers"
            />
          </div>

          {/* Gender */}
          <div style={{ width: isMobile ? "100%" : "180px" }}>
            <Select
              options={HiringPreferredGenderOptions}
              value={selectedGenderOption}
              onChange={(opt) => {
                setFilters((prev) => ({
                  ...prev,
                  gender: opt ? opt.value : null,
                }));
                setPage(1);
              }}
              placeholder="Gender"
              isClearable
            />
          </div>

          {/* Designation */}
          <div style={{ width: isMobile ? "100%" : "250px" }}>
            <Select
              options={designationOptions}
              value={selectedDesignationOption}
              onChange={(opt) => {
                setFilters((prev) => ({
                  ...prev,
                  designation: opt ? opt.value : null,
                }));
                setPage(1);
              }}
              placeholder="Designation"
              isClearable
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

      <EditHiringModal
        isOpen={modalOpen}
        toggle={() => {
          setModalOpen(!modalOpen);
          setSelectedRecord(null);
        }}
        initialData={selectedRecord}
        onUpdate={() => {
          setSelectedRecord(null);
          setPage(1);
          fetchPendingHiringApprovals();
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
        mode="HIRING"
        loading={modalLoading}
        actionType={actionType}
        setActionType={setActionType}
        note={note}
        setNote={setNote}
        {...(selectedRecord?.designation?.status === "PENDING"
          ? {
              designation: selectedRecord.designation.name
                ?.toLowerCase()
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase()),
            }
          : {})}
      />
    </>
  );
};

PendingApprovals.prototype = {
  activeTab: PropTypes.string,
};

export default PendingApprovals;
