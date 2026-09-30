import React, { useEffect, useState } from "react";
import {
  changeRegularizationStatusByHR,
  getAllRegularizations,
} from "../../../helpers/backend_helper";
import { toast } from "react-toastify";
import { CardBody, Nav, NavItem, NavLink } from "reactstrap";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import classnames from "classnames";
import DataTableComponent from "../../../Components/Common/DataTable";
import { allRegularizationsColumn } from "../components/columns/AllRegularizationsColumn";
import CancellationConfirmationModal from "../components/CancellationConfirmationModal";
import { useSelector } from "react-redux";
import Select from "react-select";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import { useCenterOptions } from "../../../Components/Hooks/useCenterOptions";
import RefreshButton from "../../../Components/Common/RefreshButton";
import { useAuthError } from "../../../Components/Hooks/useAuthError";

const AllRegularizations = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const [doc, setDoc] = useState([]);
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [approveLoaderId, setApproveLoaderId] = useState(null);
  const [cancelLoaderId, setCancelLoaderId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReg, setSelectedReg] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCenter, setSelectedCenter] = useState("ALL");

  const user = useSelector((state) => state.User);
  const handleAuthError = useAuthError();

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission } = usePermissions(token);
  const hasWrite = hasPermission("HR", "ALL_REGULARIZATIONS", "WRITE");
  const hasDelete = hasPermission("HR", "ALL_REGULARIZATIONS", "DELETE");

  const loadAllRegularizations = async () => {
    setLoading(true);
    try {
      let centers = [];
      if (selectedCenter === "") {
        centers = [];
      } else if (selectedCenter === "ALL") {
        centers = user?.centerAccess || [];
      } else {
        centers = [selectedCenter];
      }
      const response = await getAllRegularizations({
        status: activeTab,
        year: selectedYear,
        month: selectedMonth,
        page,
        limit,
        search: debouncedSearch,
        centers,
      });
      setDoc(response?.data);
      setPagination({
        ...response?.pagination,
        totalDocs: response?.pagination?.totalRecords,
      });
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.message || "Failed to load regularizations");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllRegularizations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    selectedYear,
    selectedMonth,
    page,
    limit,
    debouncedSearch,
    selectedCenter,
    user?.centerAccess,
  ]);

  const regularizations = doc || [];

  const yearOptions = [
    { value: "all", label: "All Years" },
    ...Array.from({ length: 2031 - 2026 + 1 }, (_, i) => ({
      value: String(2026 + i),
      label: String(2026 + i),
    })),
  ];

  const monthOptions = [
    { value: "all", label: "All Months" },
    ...[
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ].map((m, i) => ({ value: String(i), label: m })),
  ];

  const handleAction = async (row, status) => {
    // Track row + action so only the clicked button shows its spinner.
    setApproveLoaderId(`${row?._id}:${status}`);
    try {
      const response = await changeRegularizationStatusByHR({
        reg_id: row?._id,
        status,
      });
      toast.success(
        response?.message || `Regularization status changed to ${status}`,
      );
      loadAllRegularizations();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.message || "Something went wrong.");
      }
    } finally {
      setApproveLoaderId(null);
    }
  };

  const openCancelModal = (row) => {
    setSelectedReg(row);
    setShowCancelModal(true);
  };

  const handleCancel = async (row, reason = "") => {
    setCancelLoaderId(row?._id);
    try {
      const res = await changeRegularizationStatusByHR({
        reg_id: row?._id,
        status: "cancelled",
        reason,
      });
      toast.success(res?.message || "Regularization Cancelled");
      loadAllRegularizations();
    } catch (err) {
      if (!handleAuthError(err)) {
        toast.error(err?.message || "Failed to cancel");
      }
    } finally {
      setCancelLoaderId(null);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const centerOptions = useCenterOptions();

  useEffect(() => {
    if (
      selectedCenter !== "ALL" &&
      !user?.centerAccess?.includes(selectedCenter)
    ) {
      setSelectedCenter("ALL");
    }
  }, [selectedCenter, user?.centerAccess]);

  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <div className="text-center text-md-left mb-3">
        <h4 className="fw-bold text-primary">ALL REGULARIZATIONS</h4>
      </div>

      <Nav tabs className="mb-3">
        {["pending", "regularized", "rejected", "cancelled"].map((tab) => (
          <NavItem key={tab}>
            <NavLink
              className={classnames({ active: activeTab === tab })}
              onClick={() => setActiveTab(tab)}
              style={{ cursor: "pointer", fontWeight: 500 }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </NavLink>
          </NavItem>
        ))}
      </Nav>

      <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-3">
        {/* Left Section */}
        <div className="d-flex flex-wrap align-items-end gap-2">
          {/* Search */}
          <div
            style={
              isMobile
                ? { flexBasis: "100%", width: "100%" }
                : { minWidth: "220px" }
            }
          >
            <input
              type="text"
              className="form-control"
              placeholder="Search by Name or ECode"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Center Select */}
          <div style={{ minWidth: "180px" }}>
            <Select
              options={centerOptions}
              value={centerOptions.find((c) => c.value === selectedCenter) || null}
              onChange={(selected) =>
                setSelectedCenter(selected ? selected.value : "")
              }
              placeholder="Select Center"
              isDisabled={!centerOptions.length}
            />
          </div>

          {/* Year */}
          <div style={{ minWidth: "150px" }}>
            <Select
              options={yearOptions}
              value={yearOptions.find((o) => o.value === String(selectedYear)) || null}
              onChange={(selected) =>
                setSelectedYear(selected ? selected.value : "all")
              }
              placeholder="Select Year"
            />
          </div>

          {/* Month */}
          <div style={{ minWidth: "150px" }}>
            <Select
              options={monthOptions}
              value={monthOptions.find((o) => o.value === String(selectedMonth)) || null}
              onChange={(selected) =>
                setSelectedMonth(selected ? selected.value : "all")
              }
              placeholder="Select Month"
            />
          </div>
        </div>

        <div>
          <RefreshButton loading={loading} onRefresh={loadAllRegularizations} />
        </div>
      </div>

      <DataTableComponent
        columns={allRegularizationsColumn(
          activeTab,
          handleAction,
          approveLoaderId,
          openCancelModal,
          cancelLoaderId,
          hasWrite,
          hasDelete,
        )}
        data={regularizations}
        loading={loading}
        pagination={pagination}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
      />

      <CancellationConfirmationModal
        show={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        leave={selectedReg}
        onConfirm={(reason) => {
          handleCancel(selectedReg, reason);
          setShowCancelModal(false);
        }}
        loading={cancelLoaderId}
      />
    </CardBody>
  );
};

export default AllRegularizations;
