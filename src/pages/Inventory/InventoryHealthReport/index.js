import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardBody, Input, Label, FormGroup, Button, Nav, NavItem, NavLink } from "reactstrap";
import Select from "react-select";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { startOfMonth, endOfDay } from "date-fns";
import moment from "moment";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import CompactDataGrid from "../Components/CompactDataGrid";
import DateRangeFilter from "../../../Components/Common/DateRangeFilter";
import RefreshButton from "../../../Components/Common/RefreshButton";
import {
  fetchInventoryHealthReport,
  fetchInventoryHealthDetailed,
} from "../../../store/features/pharmacy/pharmacySlice";
import { getInventoryHealthReport as getInventoryHealthReportApi } from "../../../helpers/backend_helper";
import {
  getInventoryHealthSummaryGridColumns,
  getInventoryHealthDetailedGridColumns,
} from "../Columns/Pharmacy/InventoryHealthColumns";

const ISSUE_TYPE_OPTIONS = [
  { value: "TRANSIT_LOSS", label: "Transit Loss" },
  { value: "VARIANCE", label: "Variance" },
  { value: "EXPIRY", label: "Expiry" },
];

const TABS = [
  { value: "SUMMARY", label: "Summary" },
  { value: "DETAILED", label: "Detailed" },
];

// Shrinks react-select's default control height/padding/font so it matches
// the compact Input/Button sizing used in the rest of this filter bar.
const compactSelectStyles = {
  control: (base) => ({ ...base, minHeight: 31, fontSize: 12 }),
  valueContainer: (base) => ({ ...base, padding: "0 6px" }),
  input: (base) => ({ ...base, margin: 0, padding: 0 }),
  indicatorsContainer: (base) => ({ ...base, height: 31 }),
  option: (base) => ({ ...base, fontSize: 12, padding: "4px 10px" }),
  multiValue: (base) => ({ ...base, fontSize: 11 }),
  placeholder: (base) => ({ ...base, fontSize: 12 }),
  singleValue: (base) => ({ ...base, fontSize: 12 }),
};

const SummaryStat = ({ label, value, tone }) => (
  <div className="d-flex align-items-baseline gap-2">
    <span className={`fw-bold fs-5 ${tone || ""}`}>{value}</span>
    <span className="text-muted fs-13">{label}</span>
  </div>
);

const InventoryHealthReport = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleAuthError = useAuthError();
  const isMobile = useMediaQuery("(max-width: 1000px)");

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission, loading: permissionLoader } = usePermissions(token);
  const hasReadPermission = hasPermission("PHARMACY", "INVENTORY_HEALTH_REPORT", "READ");

  const { loading, data, pagination, summary } = useSelector(
    (state) => state.Pharmacy.inventoryHealthReport
  );
  // Kept separate from inventoryHealthReport — this is the only fetch that
  // asks for transferHistory/auditHistory/discardHistory, so it's loaded
  // lazily (only once the Detailed tab is actually opened) rather than
  // paying for that heavier payload on every Summary-tab load.
  const {
    loading: detailedLoading,
    data: detailedData,
    pagination: detailedPagination,
    maxEventCounts,
  } = useSelector((state) => state.Pharmacy.inventoryHealthDetailed);
  const user = useSelector((state) => state.User);
  const centerList = useSelector((state) => state.Center.data);

  const [activeTab, setActiveTab] = useState("SUMMARY");

  const [selectedCenter, setSelectedCenter] = useState("ALL");
  const [reportDate, setReportDate] = useState({
    start: startOfMonth(new Date()),
    end: endOfDay(new Date()),
  });
  const [onlyIssues, setOnlyIssues] = useState(true);
  const [issueTypes, setIssueTypes] = useState([]);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [detailedPage, setDetailedPage] = useState(1);
  const [detailedLimit, setDetailedLimit] = useState(25);
  const [hasLoadedDetailedOnce, setHasLoadedDetailedOnce] = useState(false);

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

  const activeCenters =
    selectedCenter === "ALL"
      ? user?.centerAccess || []
      : !user?.centerAccess?.length
        ? []
        : [selectedCenter];

  // A batch is listed once per center, so the pharmacy id alone isn't unique.
  const rows = useMemo(
    () => (data || []).map((row) => ({ ...row, rowKey: `${row.pharmacyId}-${row.centerId}` })),
    [data]
  );

  const detailedRows = useMemo(
    () => (detailedData || []).map((row) => ({ ...row, rowKey: `${row.pharmacyId}-${row.centerId}` })),
    [detailedData]
  );

  // Shared by the live fetch and the export — export must read the exact
  // same center/date/issues/search filters currently applied on screen, not
  // a second, independently-typed set.
  const buildFilterParams = () => ({
    centers: activeCenters,
    from: reportDate.start?.toISOString(),
    to: reportDate.end?.toISOString(),
    onlyIssues: onlyIssues ? "true" : undefined,
    issueTypes: issueTypes.length ? issueTypes.map((t) => t.value) : undefined,
    search: search.trim() || undefined,
  });

  const loadData = (targetPage = page, targetLimit = limit) => {
    setHasLoadedOnce(true);
    dispatch(
      fetchInventoryHealthReport({
        page: targetPage,
        limit: targetLimit,
        ...buildFilterParams(),
      })
    )
      .unwrap()
      .catch((error) => {
        if (!handleAuthError(error)) {
          toast.error(error?.message || "Failed to load inventory health report");
        }
      });
  };

  const loadDetailed = (targetPage = detailedPage, targetLimit = detailedLimit) => {
    setHasLoadedDetailedOnce(true);
    dispatch(
      fetchInventoryHealthDetailed({
        page: targetPage,
        limit: targetLimit,
        ...buildFilterParams(),
      })
    )
      .unwrap()
      .catch((error) => {
        if (!handleAuthError(error)) {
          toast.error(error?.message || "Failed to load transaction details");
        }
      });
  };

  // Mirrors whichever tab is active — Detailed asks for the same
  // transferHistory/auditHistory/discardHistory the grid itself uses, so the
  // exported sheet gets the same Transfer N/Audit N/Discard N columns.
  const handleExport = async () => {
    const isDetailed = activeTab === "DETAILED";
    setExporting(true);
    try {
      const res = await getInventoryHealthReportApi({
        ...buildFilterParams(),
        exportExcel: true,
        ...(isDetailed ? { includeHistory: "true" } : {}),
      });

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `inventory-health-report${isDetailed ? "-detailed" : ""}-${moment().format("YYYY-MM-DD")}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.message || "Failed to export report");
      }
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    if (selectedCenter !== "ALL" && !user?.centerAccess?.includes(selectedCenter)) {
      setSelectedCenter("ALL");
    }
  }, [user?.centerAccess, selectedCenter]);

  // Default view on first mount only — after that, nothing re-fetches until
  // the button is clicked, except pagination/page-size on an already-loaded
  // result set.
  useEffect(() => {
    setPage(1);
    loadData(1, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hasLoadedOnce) return;
    loadData(page, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  useEffect(() => {
    if (!hasLoadedDetailedOnce) return;
    loadDetailed(detailedPage, detailedLimit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailedPage, detailedLimit]);

  // Both tabs share the same filters, but only Summary is loaded eagerly —
  // Detailed is fetched the first time that tab is opened, and refreshed
  // alongside Summary afterward so "View Report" never leaves it stale.
  const handleViewReport = () => {
    setPage(1);
    loadData(1, limit);
    if (activeTab === "DETAILED" || hasLoadedDetailedOnce) {
      setDetailedPage(1);
      loadDetailed(1, detailedLimit);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "DETAILED" && !hasLoadedDetailedOnce) {
      loadDetailed(1, detailedLimit);
    }
  };

  // Enter anywhere on this page re-runs the report with whatever filters are
  // currently set — including inside the date picker's popup, which flatpickr
  // renders straight to document.body outside React's tree, so a React
  // onKeyDown on the filter bar never sees those keydowns. A page-level
  // native listener on `document` catches it regardless of where focus is.
  // The ref always points at the latest handleViewReport (a new function
  // every render, closing over current filters) so the listener itself only
  // needs to be attached once.
  const handleViewReportRef = useRef(handleViewReport);
  handleViewReportRef.current = handleViewReport;

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Enter") handleViewReportRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const columns = useMemo(() => getInventoryHealthSummaryGridColumns(), []);
  // Column count comes from the whole filtered result set (maxEventCounts,
  // from the backend), not from the rows on the current page — see
  // getInventoryHealthDetailedGridColumns for why per-page counts would be
  // unreliable (a page sorted by severity can easily have zero of some event
  // type even though other pages have plenty).
  const detailedColumns = useMemo(
    () => getInventoryHealthDetailedGridColumns(maxEventCounts),
    [maxEventCounts]
  );

  if (!permissionLoader && !hasReadPermission) navigate("/unauthorized");

  return (
    <React.Fragment>
      <CardBody className="p-3 bg-white" style={isMobile ? { width: "100%" } : { width: "78%" }}>
        <div className="d-flex flex-column h-100">
          <h6 className="mb-0 fw-semibold">Inventory Health Report</h6>
          <p className="text-muted mb-2 fs-12">
            Transit loss, stock variance and expired stock, per batch per center
          </p>
          <div className="d-flex flex-wrap gap-3 mb-2">
              <SummaryStat
                label="Transit Loss"
                value={summary?.totalLoss || 0}
                tone="text-danger"
              />
              <SummaryStat
                label="In Transit"
                value={summary?.inTransitQty || 0}
                tone="text-warning"
              />
              <SummaryStat
                label="Net Variance"
                value={summary?.totalVariance > 0 ? `+${summary.totalVariance}` : summary?.totalVariance || 0}
                tone={summary?.totalVariance < 0 ? "text-danger" : summary?.totalVariance > 0 ? "text-success" : ""}
              />
              <SummaryStat
                label="Discard Pending"
                value={summary?.pendingExpiredBatches || 0}
                tone="text-danger"
              />
              <SummaryStat label="Discarded" value={summary?.totalDiscarded || 0} />
          </div>

          <Card className="mb-2 shadow-sm border-0">
            <CardBody className="py-2 px-2">
              <div className="d-flex flex-wrap align-items-center gap-1">
                <FormGroup className="mb-0" style={{ minWidth: 140, width: 140 }}>
                  <Select
                    classNamePrefix="react-select"
                    styles={compactSelectStyles}
                    options={centerOptions}
                    value={selectedCenterOption}
                    onChange={(option) => setSelectedCenter(option?.value)}
                    placeholder="All Centers"
                  />
                </FormGroup>
                <FormGroup className="mb-0">
                  <DateRangeFilter reportDate={reportDate} setReportDate={setReportDate} />
                </FormGroup>
                <FormGroup className="mb-0" style={{ minWidth: 160, width: 160 }}>
                  <Select
                    isMulti
                    classNamePrefix="react-select"
                    styles={compactSelectStyles}
                    options={ISSUE_TYPE_OPTIONS}
                    value={issueTypes}
                    onChange={(selected) => setIssueTypes(selected || [])}
                    placeholder="All flag types"
                  />
                </FormGroup>
                <FormGroup className="mb-0" style={{ minWidth: 180, width: 180 }}>
                  <Input
                    bsSize="sm"
                    type="text"
                    placeholder="Medicine, PHR ID or generic name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </FormGroup>
                <FormGroup check className="mb-0">
                  <Input
                    type="checkbox"
                    checked={onlyIssues}
                    onChange={(e) => setOnlyIssues(e.target.checked)}
                    id="onlyIssuesCheck"
                    disabled={issueTypes.length > 0}
                  />
                  <Label check for="onlyIssuesCheck" className="fs-12 ms-1">
                    Flagged Only
                  </Label>
                </FormGroup>

                <div className="d-flex gap-1 ms-auto">
                  <Button
                    size="sm"
                    color="primary"
                    onClick={handleExport}
                    disabled={exporting || loading}
                    className="text-white"
                  >
                    {exporting ? "Exporting..." : "Export Excel"}
                  </Button>
                  <Button size="sm" color="primary" onClick={handleViewReport} disabled={loading} className="text-white">
                    {loading ? "Loading..." : "View Report"}
                  </Button>
                  <RefreshButton onRefresh={() => loadData(page, limit)} loading={loading} />
                </div>
              </div>
            </CardBody>
          </Card>

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
                      if (activeTab !== tab.value) handleTabChange(tab.value);
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

          <Card className="flex-grow-1 shadow-sm border-0 mb-0" style={{ borderRadius: "0 0 8px 8px" }}>
            <CardBody className="p-0 d-flex flex-column h-100">
              <div className="flex-grow-1 position-relative" style={{ minHeight: "500px" }}>
                {activeTab === "SUMMARY" ? (
                  <CompactDataGrid
                    columns={columns}
                    data={rows}
                    loading={loading}
                    page={page}
                    setPage={setPage}
                    limit={limit}
                    setLimit={setLimit}
                    total={pagination?.totalDocs || 0}
                    keyField="rowKey"
                    noDataComponent="No flagged rows for the selected filters"
                  />
                ) : (
                  <CompactDataGrid
                    columns={detailedColumns}
                    data={detailedRows}
                    loading={detailedLoading}
                    page={detailedPage}
                    setPage={setDetailedPage}
                    limit={detailedLimit}
                    setLimit={setDetailedLimit}
                    total={detailedPagination?.totalDocs || 0}
                    keyField="rowKey"
                    noDataComponent="No transfers, audits or discards for the selected filters"
                  />
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </CardBody>
    </React.Fragment>
  );
};

export default InventoryHealthReport;
