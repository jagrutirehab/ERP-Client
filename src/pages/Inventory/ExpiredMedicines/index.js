import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  CardBody,
  Row,
  Col,
  Input,
  Nav,
  NavItem,
  NavLink,
  Spinner,
} from "reactstrap";
import Select from "react-select";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import DataTableComponent from "../../../Components/Common/DataTable";
import RefreshButton from "../../../Components/Common/RefreshButton";
import ExpiredStockDetailModal from "../Components/ExpiredStockDetailModal";
import ExpiredStockApprovalModal from "../Components/ExpiredStockApprovalModal";
import {
  fetchExpiredStock,
  fetchExpiredStockHistory,
  removeExpiredStock,
} from "../../../store/features/pharmacy/pharmacySlice";
import {
  getExpiredStockColumns,
  getExpiredStockHistoryColumns,
} from "../Columns/Pharmacy/ExpiredStockColumns";

const TABS = [
  { value: "EXPIRED", label: "Expired Stock" },
  { value: "HISTORY", label: "History" },
];

const ExpiredMedicines = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleAuthError = useAuthError();
  const isMobile = useMediaQuery("(max-width: 1000px)");

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission, loading: permissionLoader } = usePermissions(token);

  const hasReadPermission = hasPermission("PHARMACY", "EXPIRED_MEDICINE_REMOVAL", "READ");
  const hasWritePermission = hasPermission("PHARMACY", "EXPIRED_MEDICINE_REMOVAL", "WRITE");

  const { loading, data, pagination, submitLoading } = useSelector((state) => state.Pharmacy);
  const user = useSelector((state) => state.User);
  const centerList = useSelector((state) => state.Center.data);

  const [activeTab, setActiveTab] = useState("EXPIRED");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCenter, setSelectedCenter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [confirmRow, setConfirmRow] = useState(null);
  const [detailRow, setDetailRow] = useState(null);
  const [remarks, setRemarks] = useState("");

  const centerOptions = useMemo(
    () => [
      ...(user?.centerAccess?.length > 1
        ? [{ value: "ALL", label: "All Centers" }]
        : []),
      ...(centerList
        ?.filter((c) => user?.centerAccess?.includes(c._id))
        ?.map((c) => ({ value: c._id, label: c.title })) || []),
    ],
    [centerList, user?.centerAccess]
  );

  const selectedCenterOption =
    centerOptions.find((opt) => opt.value === selectedCenter) || centerOptions[0];

  // A batch is listed once per center, so neither the batch id nor the PHR id
  // is unique across rows — the table needs a composite key.
  const rows = useMemo(
    () =>
      (data || []).map((row) => ({
        ...row,
        rowKey:
          activeTab === "EXPIRED"
            ? `${row._id}-${row.centerId}`
            : String(row._id),
      })),
    [data, activeTab]
  );

  const loadData = (targetPage = page, tab = activeTab) => {
    const centers =
      selectedCenter === "ALL"
        ? user?.centerAccess
        : !user?.centerAccess?.length
          ? []
          : [selectedCenter];

    if (!centers?.length) return;

    const params = {
      page: targetPage,
      limit,
      centers,
      search: searchQuery || undefined,
    };

    const action = tab === "EXPIRED" ? fetchExpiredStock : fetchExpiredStockHistory;

    dispatch(action(params))
      .unwrap()
      .catch((error) => {
        if (!handleAuthError(error)) {
          toast.error(error?.message || "Failed to load expired stock");
        }
      });
  };

  useEffect(() => {
    if (selectedCenter !== "ALL" && !user?.centerAccess?.includes(selectedCenter)) {
      setSelectedCenter("ALL");
    }
  }, [user?.centerAccess, selectedCenter]);

  useEffect(() => {
    setPage(1);
    loadData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedCenter, limit, user?.centerAccess?.join(",")]);

  useEffect(() => {
    loadData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const isFirstSearchRun = useRef(true);
  useEffect(() => {
    if (isFirstSearchRun.current) {
      isFirstSearchRun.current = false;
      return;
    }
    const handler = setTimeout(() => {
      setPage(1);
      loadData(1);
    }, 500);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const openConfirm = (row) => {
    setRemarks("");
    setConfirmRow(row);
  };

  const submitRemoval = async () => {
    if (!confirmRow) return;

    try {
      const result = await dispatch(
        removeExpiredStock({
          center: String(confirmRow.centerId),
          pharmacyIds: [confirmRow._id],
          remarks: remarks.trim(),
        })
      ).unwrap();

      const removedCount = result?.data?.removed?.length || 0;

      if (removedCount > 0) {
        toast.success(
          `Stock cleared for ${confirmRow.medicineName || confirmRow.id}`
        );
      } else {
        toast.warning(
          result?.data?.skipped?.[0]?.reason ||
          "Nothing was removed — this batch is no longer eligible"
        );
      }

      setConfirmRow(null);
      loadData(page);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.message || "Failed to remove expired stock");
      }
    }
  };

  const columns =
    activeTab === "EXPIRED"
      ? getExpiredStockColumns({
        openDetail: (row) => setDetailRow(row),
        handleApprove: openConfirm,
        hasWritePermission,
      })
      : getExpiredStockHistoryColumns();

  if (permissionLoader) {
    return (
      <CardBody
        className="p-3 bg-white d-flex justify-content-center align-items-center"
        style={isMobile ? { width: "100%", minHeight: "60vh" } : { width: "78%", minHeight: "60vh" }}
      >
        <Spinner color="primary" />
      </CardBody>
    );
  }

  if (!hasReadPermission) navigate("/unauthorized");

  return (
    <React.Fragment>
      <CardBody className="p-3 bg-white" style={isMobile ? { width: "100%" } : { width: "78%" }}>
        <div className="d-flex flex-column h-100">
          <div className="mb-3">
            <h5 className="mb-1 fw-semibold">Expired Medicines</h5>
            <p className="text-muted mb-0 fs-13">
              Review expired batches still holding stock and clear them after approval
            </p>
          </div>

          <Nav tabs className="flex-wrap mb-0" style={{ borderBottom: "1px solid #dee2e6" }}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.value;
              return (
                <NavItem key={tab.value}>
                  <NavLink
                    href="#"
                    active={isActive}
                    onClick={(e) => {
                      e.preventDefault();
                      if (activeTab !== tab.value) setActiveTab(tab.value);
                    }}
                    style={{
                      fontSize: 13,
                      fontWeight: isActive ? 700 : 500,
                      cursor: "pointer",
                      color: isActive ? "#212529" : "#0d6efd",
                      background: isActive ? "#fff" : "transparent",
                      border: isActive ? "1px solid #dee2e6" : "none",
                      borderBottom: isActive ? "1px solid #fff" : "none",
                      borderRadius: isActive ? "4px 4px 0 0" : 0,
                      padding: "6px 14px",
                      marginBottom: -1,
                      textDecoration: "none",
                    }}
                  >
                    {tab.label}
                  </NavLink>
                </NavItem>
              );
            })}
          </Nav>

          <Card className="mb-3 shadow-sm border-0" style={{ borderRadius: "0 0 8px 8px" }}>
            <CardBody className="py-3">
              <Row className="g-2 align-items-center">
                <Col md={4} lg={3}>
                  <Select
                    classNamePrefix="react-select"
                    options={centerOptions}
                    value={selectedCenterOption}
                    onChange={(option) => setSelectedCenter(option?.value)}
                    placeholder="All Centers"
                  />
                </Col>
                <Col md={5} lg={4}>
                  <div className="position-relative">
                    <i
                      className="bx bx-search position-absolute text-muted"
                      style={{ top: "50%", left: 10, transform: "translateY(-50%)" }}
                    />
                    <Input
                      type="text"
                      placeholder="Search by medicine, PHR ID or batch..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ paddingLeft: 32 }}
                    />
                  </div>
                </Col>
                <Col md={3} lg={5} className="d-flex justify-content-end">
                  <RefreshButton onRefresh={() => loadData(page)} loading={loading} />
                </Col>
              </Row>
            </CardBody>
          </Card>

          <Card className="flex-grow-1 shadow-sm border-0 mb-0">
            <CardBody className="p-0 d-flex flex-column h-100">
              <div className="flex-grow-1 position-relative" style={{ minHeight: "500px" }}>
                <DataTableComponent
                  columns={columns}
                  data={rows}
                  loading={loading}
                  pagination={pagination}
                  limit={limit}
                  setLimit={setLimit}
                  page={page}
                  setPage={setPage}
                  keyField="rowKey"
                  noDataComponent={
                    activeTab === "EXPIRED"
                      ? "No expired stock at the selected center"
                      : "No removals recorded yet"
                  }
                />
              </div>
            </CardBody>
          </Card>
        </div>
      </CardBody>

      <ExpiredStockDetailModal
        isOpen={!!detailRow}
        toggle={() => setDetailRow(null)}
        row={detailRow}
        handleApprove={openConfirm}
        hasWritePermission={hasWritePermission}
      />

      <ExpiredStockApprovalModal
        isOpen={!!confirmRow}
        row={confirmRow}
        remarks={remarks}
        setRemarks={setRemarks}
        closeModal={() => setConfirmRow(null)}
        submitApproval={submitRemoval}
        loading={submitLoading}
      />
    </React.Fragment>
  );
};

export default ExpiredMedicines;
