import { useCallback, useEffect, useState } from "react";
import { Input, Spinner } from "reactstrap";
import Select from "react-select";
import DataTable from "react-data-table-component";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useAuthError } from "../../../../../Components/Hooks/useAuthError";
import { useMediaQuery } from "../../../../../Components/Hooks/useMediaQuery";
import { useCenterOptions } from "../../../../../Components/Hooks/useCenterOptions";
import RefreshButton from "../../../../../Components/Common/RefreshButton";
import {
  actionOnNewJoiningBiometricData,
  getNewJoiningBiometricData,
} from "../../../../../helpers/backend_helper";
import { NewJoiningBiometricColumn } from "../../../components/columns/NewJoiningBiometricColumn";
import ApproveModal from "../../../components/ApproveModal";

const customStyles = {
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
};

const PendingApprovals = ({
  activeTab,
  hasUserPermission,
  hasWritePermission,
}) => {
  const user = useSelector((state) => state.User);
  const handleAuthError = useAuthError();
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const centerOptions = useCenterOptions();

  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCenter, setSelectedCenter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [actionType, setActionType] = useState(null); // APPROVE | REJECT
  const [note, setNote] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  const selectedCenterOption =
    centerOptions.find((opt) => opt.value === selectedCenter) ||
    centerOptions[0];

  useEffect(() => {
    if (
      selectedCenter !== "ALL" &&
      user?.centerAccess?.length &&
      !user.centerAccess.includes(selectedCenter)
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

  const fetchRequests = useCallback(async () => {
    if (user?.centerAccess !== undefined && !user?.centerAccess?.length) {
      setData([]);
      setPagination({ totalDocs: 0 });
      return;
    }
    setLoading(true);
    try {
      const centers =
        selectedCenter === "ALL" ? user?.centerAccess : [selectedCenter];
      const response = await getNewJoiningBiometricData({
        status: "addition_pending",
        page,
        limit,
        centers,
        ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
      });
      setData(response?.data);
      setPagination(response?.pagination);
    } catch (err) {
      if (!handleAuthError(err)) {
        toast.error(
          err?.response?.data?.message || "Failed to fetch requests",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [selectedCenter, debouncedSearch, page, limit, user?.centerAccess]);

  useEffect(() => {
    if (activeTab === "PENDING" && hasUserPermission) {
      fetchRequests();
    }
  }, [fetchRequests, activeTab, hasUserPermission]);

  const openModal = (row, type) => {
    setSelectedRow(row);
    setActionType(type);
    setApproveModalOpen(true);
  };

  const handleAction = async () => {
    setModalLoading(true);
    try {
      await actionOnNewJoiningBiometricData({
        doc_id: selectedRow?._id,
        status:
          actionType === "APPROVE" ? "addition_approved" : "addition_rejected",
        ...(note.trim() && { reason: note.trim() }),
      });
      toast.success(
        actionType === "APPROVE"
          ? "Biometric request approved successfully"
          : "Biometric request rejected successfully",
      );
      fetchRequests();
      setApproveModalOpen(false);
      setNote("");
      setActionType(null);
      setSelectedRow(null);
    } catch (err) {
      if (!handleAuthError(err)) {
        toast.error(
          err?.response?.data?.message || "Failed to action request",
        );
      }
    } finally {
      setModalLoading(false);
    }
  };

  const columns = NewJoiningBiometricColumn({
    onApprove: (row) => openModal(row, "APPROVE"),
    onReject: (row) => openModal(row, "REJECT"),
    tab: "PENDING",
    hasWritePermission,
  });

  const centerSelect = (
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
  );

  const searchInput = (
    <Input
      type="text"
      className="form-control"
      placeholder="Search by name..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  );

  return (
    <>
      <div className="mb-3">
        <div className="d-none d-md-flex justify-content-between align-items-center">
          <div className="d-flex gap-3 align-items-center">
            <div style={{ width: "200px" }}>{centerSelect}</div>
            <div style={{ width: "220px" }}>{searchInput}</div>
          </div>
          <RefreshButton loading={loading} onRefresh={fetchRequests} />
        </div>

        <div className="d-flex d-md-none flex-column gap-3">
          <div style={{ width: "100%" }}>{centerSelect}</div>
          <div style={{ width: "100%" }}>{searchInput}</div>
          <div className="d-flex justify-content-end">
            <RefreshButton loading={loading} onRefresh={fetchRequests} />
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={Array.isArray(data) ? data : []}
        highlightOnHover
        pagination
        paginationServer
        paginationTotalRows={pagination?.totalDocs}
        paginationPerPage={limit}
        paginationDefaultPage={page}
        progressPending={loading && data.length === 0}
        striped
        fixedHeader
        fixedHeaderScrollHeight="500px"
        dense={isMobile}
        responsive
        customStyles={customStyles}
        progressComponent={
          <div className="py-4 text-center">
            <Spinner className="text-primary" />
          </div>
        }
        onChangePage={(newPage) => setPage(newPage)}
        onChangeRowsPerPage={(newLimit) => setLimit(newLimit)}
      />

      <ApproveModal
        isOpen={approveModalOpen}
        toggle={() => {
          setApproveModalOpen(false);
          setNote("");
          setActionType(null);
          setSelectedRow(null);
        }}
        onSubmit={handleAction}
        mode="NEW_JOINING_BIOMETRIC"
        targetName={selectedRow?.employee?.name}
        loading={modalLoading}
        actionType={actionType}
        note={note}
        setNote={setNote}
      />
    </>
  );
};

export default PendingApprovals;
