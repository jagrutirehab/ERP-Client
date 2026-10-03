import React, { useEffect, useMemo, useState } from "react";
import { Card, CardBody, Input, Label, FormGroup, Button } from "reactstrap";
import Select from "react-select";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { startOfMonth, endOfDay } from "date-fns";
import moment from "moment";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import DataTableComponent from "../../../Components/Common/DataTable";
import DateRangeFilter from "../../../Components/Common/DateRangeFilter";
import RefreshButton from "../../../Components/Common/RefreshButton";
import InventoryHealthDetailModal from "../Components/InventoryHealthDetailModal";
import { fetchInventoryHealthReport } from "../../../store/features/pharmacy/pharmacySlice";
import { getInventoryHealthReport as getInventoryHealthReportApi } from "../../../helpers/backend_helper";
import { getInventoryHealthColumns } from "../Columns/Pharmacy/InventoryHealthColumns";

const ISSUE_TYPE_OPTIONS = [
  { value: "TRANSIT_LOSS", label: "Transit Loss" },
  { value: "VARIANCE", label: "Variance" },
  { value: "EXPIRY", label: "Expiry" },
];

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
  const user = useSelector((state) => state.User);
  const centerList = useSelector((state) => state.Center.data);

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
  const [detailRow, setDetailRow] = useState(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [exporting, setExporting] = useState(false);

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

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await getInventoryHealthReportApi({
        ...buildFilterParams(),
        exportExcel: true,
      });

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `inventory-health-report-${moment().format("YYYY-MM-DD")}.xlsx`;
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

  const handleViewReport = () => {
    setPage(1);
    loadData(1, limit);
  };

  const columns = getInventoryHealthColumns({ openDetail: (row) => setDetailRow(row) });

  if (!permissionLoader && !hasReadPermission) navigate("/unauthorized");

  return (
    <React.Fragment>
      <CardBody className="p-3 bg-white" style={isMobile ? { width: "100%" } : { width: "78%" }}>
        <div className="d-flex flex-column h-100">
          <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between gap-2 mb-3">
            <div>
              <h5 className="mb-1 fw-semibold">Inventory Health Report</h5>
              <p className="text-muted mb-0 fs-13">
                Transit loss, stock variance and expired stock, per batch per center
              </p>
            </div>
            <div className="d-flex flex-wrap gap-3 gap-lg-4">
              <SummaryStat
                label="Transit Loss"
                value={summary?.totalLoss || 0}
                tone="text-danger"
              />
              <SummaryStat
                label="Stuck In Transit"
                value={summary?.overdueInTransitQty || 0}
                tone="text-warning"
              />
              <SummaryStat
                label="Net Variance"
                value={summary?.totalVariance > 0 ? `+${summary.totalVariance}` : summary?.totalVariance || 0}
                tone={summary?.totalVariance < 0 ? "text-danger" : summary?.totalVariance > 0 ? "text-success" : ""}
              />
              <SummaryStat
                label="Pending Expired"
                value={summary?.pendingExpiredBatches || 0}
                tone="text-danger"
              />
              <SummaryStat label="Discarded" value={summary?.totalDiscarded || 0} />
            </div>
          </div>

          <Card className="mb-3 shadow-sm border-0">
            <CardBody className="py-3">
              <div className="d-flex flex-wrap align-items-center gap-2">
                <FormGroup className="mb-0" style={{ minWidth: 180 }}>
                  <Select
                    classNamePrefix="react-select"
                    options={centerOptions}
                    value={selectedCenterOption}
                    onChange={(option) => setSelectedCenter(option?.value)}
                    placeholder="All Centers"
                  />
                </FormGroup>
                <FormGroup className="mb-0">
                  <DateRangeFilter reportDate={reportDate} setReportDate={setReportDate} />
                </FormGroup>
                <FormGroup className="mb-0" style={{ minWidth: 200 }}>
                  <Select
                    isMulti
                    classNamePrefix="react-select"
                    options={ISSUE_TYPE_OPTIONS}
                    value={issueTypes}
                    onChange={(selected) => setIssueTypes(selected || [])}
                    placeholder="All flag types"
                  />
                </FormGroup>
                <FormGroup className="mb-0" style={{ minWidth: 220 }}>
                  <Input
                    type="text"
                    placeholder="Medicine, PHR ID or generic name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleViewReport();
                    }}
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
                  <Label check for="onlyIssuesCheck" className="fs-13 ms-1">
                    Flagged Only
                  </Label>
                </FormGroup>

                <div className="d-flex gap-2 ms-auto">
                  <Button
                    color="primary"
                    onClick={handleExport}
                    disabled={exporting || loading}
                    className="text-white"
                  >
                    {exporting ? "Exporting..." : "Export Excel"}
                  </Button>
                  <Button color="primary" onClick={handleViewReport} disabled={loading} className="text-white">
                    {loading ? "Loading..." : "View Report"}
                  </Button>
                  <RefreshButton onRefresh={() => loadData(page, limit)} loading={loading} />
                </div>
              </div>
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
                  noDataComponent="No flagged rows for the selected filters"
                />
              </div>
            </CardBody>
          </Card>
        </div>
      </CardBody>

      <InventoryHealthDetailModal
        isOpen={!!detailRow}
        toggle={() => setDetailRow(null)}
        row={detailRow}
      />
    </React.Fragment>
  );
};

export default InventoryHealthReport;
