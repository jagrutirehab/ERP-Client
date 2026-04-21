import React, { useEffect, useState, useRef } from "react";
import { TabPane, Input, Spinner, Button } from "reactstrap";
import { connect, useDispatch } from "react-redux";
import { getRangeReport } from "../../../store/features/cashManagement/cashSlice";
import PropTypes from "prop-types";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { toast } from "react-toastify";
import { createPortal } from "react-dom";

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n || 0);

const fmtDate = (dateStr) => {
  try {
    if (!dateStr || typeof dateStr !== "string" || dateStr.length !== 10)
      return "";
    const date = new Date(dateStr + "T00:00:00Z");
    if (isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      timeZone: "UTC",
    }).format(date);
  } catch {
    return "";
  }
};

const fmtDateFull = (dateStr) => {
  try {
    if (!dateStr || typeof dateStr !== "string" || dateStr.length !== 10)
      return "";
    const date = new Date(dateStr + "T00:00:00Z");
    if (isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  } catch {
    return "";
  }
};

const getTodayBusinessDate = () => {
  try {
    const now = new Date();
    const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    const hours = ist.getUTCHours();
    const minutes = ist.getUTCMinutes();
    if (hours < 3 || (hours === 3 && minutes === 0)) {
      ist.setUTCDate(ist.getUTCDate() - 1);
    }
    const yyyy = ist.getUTCFullYear();
    const mm = String(ist.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(ist.getUTCDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  } catch {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  }
};

const addDays = (businessDateStr, days) => {
  const [yyyy, mm, dd] = businessDateStr.split("-").map(Number);
  const d = new Date(Date.UTC(yyyy, mm - 1, dd + days));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
};

const getDateRange = (days) => {
  const end = getTodayBusinessDate();
  const [yyyy, mm, dd] = end.split("-").map(Number);
  const startD = new Date(Date.UTC(yyyy, mm - 1, dd - (days - 1)));
  const start = `${startD.getUTCFullYear()}-${String(startD.getUTCMonth() + 1).padStart(2, "0")}-${String(startD.getUTCDate()).padStart(2, "0")}`;
  return { start, end };
};

const getBusinessDatesInRange = (start, end) => {
  if (
    !start ||
    !end ||
    typeof start !== "string" ||
    typeof end !== "string" ||
    start.length !== 10 ||
    end.length !== 10
  )
    return [];
  const dates = [];
  let current = start;
  let safety = 0;
  while (current <= end && safety < 365) {
    dates.push(current);
    current = addDays(current, 1);
    safety++;
  }
  return dates;
};

const TooltipCard = ({ record, branchName, position }) => {
  if (!position || !record) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        zIndex: 9999,
        width: "268px",
        background: "#fff",
        border: "0.5px solid #ccc",
        borderRadius: "8px",
        padding: "12px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: 500,
          color: "#666",
          marginBottom: "8px",
          paddingBottom: "6px",
          borderBottom: "0.5px solid #eee",
        }}
      >
        {fmtDateFull(record.businessDate)} — {branchName}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "13px",
          fontWeight: 600,
          padding: "4px 0",
        }}
      >
        <span>Opening balance</span>
        <span>{formatINR(record.openingBalance)}</span>
      </div>

      <div
        style={{
          margin: "6px 0 4px",
          borderTop: "0.5px solid #eee",
          paddingTop: "6px",
        }}
      >
        {[
          { label: "Total bank deposits", value: record.totalDeposits, type: "dr" },
          { label: "Total spending", value: record.totalSpending, type: "dr" },
          { label: "Total cash inflow", value: record.totalInflows, type: "cr" },
          { label: "Total IPD payments", value: record.totalAdvancePayments, type: "cr" },
          { label: "Total OPD payments", value: record.totalOPDPayments, type: "cr" },
          { label: "Total intern payments", value: record.totalInternPayments, type: "cr" },
          { label: "Total deposit - Olive", value: record.totalIPDDeposits, type: "cr" },
        ].map((row, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "12px",
              padding: "3px 0",
              color: row.type === "cr" ? "#198754" : "#dc3545",
            }}
          >
            <span>{row.label}</span>
            <span>
              {row.type === "cr" ? "+ " : "- "}
              {formatINR(row.value)}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "13px",
          fontWeight: 600,
          borderTop: "0.5px solid #eee",
          marginTop: "4px",
          paddingTop: "8px",
        }}
      >
        <span>Closing balance</span>
        <span>{formatINR(record.closingBalance)}</span>
      </div>
    </div>,
    document.body
  );
};

const LedgerCell = ({ record, branchName, isLeft }) => {
  const [tooltipPos, setTooltipPos] = useState(null);
  const btnRef = useRef(null);

  const handleMouseEnter = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const tooltipWidth = 268;
    const viewportWidth = window.innerWidth;
    let left = isLeft ? rect.left : rect.right - tooltipWidth;
    if (left + tooltipWidth > viewportWidth - 8) left = viewportWidth - tooltipWidth - 8;
    if (left < 8) left = 8;
    setTooltipPos({ top: rect.bottom + 6, left });
  };

  const handleMouseLeave = () => setTooltipPos(null);

  return (
    <td
      style={{
        padding: 0,
        borderRight: "0.5px solid #dee2e6",
        borderBottom: "0.5px solid #dee2e6",
      }}
    >
      <div style={{ position: "relative", display: "block" }}>
        <button
          ref={btnRef}
          style={{
            display: "block",
            width: "100%",
            padding: "8px 10px",
            textAlign: "right",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: "13px",
            color: "#212529",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {formatINR(record.openingBalance)}
        </button>
        <TooltipCard
          record={record}
          branchName={branchName}
          position={tooltipPos}
        />
      </div>
    </td>
  );
};

const EmptyCell = () => (
  <td
    style={{
      padding: "8px 10px",
      textAlign: "right",
      fontSize: "13px",
      color: "#adb5bd",
      borderRight: "0.5px solid #dee2e6",
      borderBottom: "0.5px solid #dee2e6",
    }}
  >
    —
  </td>
);

const LedgerReport = ({
  centers,
  centerAccess,
  rangeReport,
  loading,
  activeTab,
  hasUserPermission,
}) => {
  const dispatch = useDispatch();
  const handleAuthError = useAuthError();

  const centerOptions =
    centers
      ?.filter((c) => centerAccess?.includes(c._id))
      .filter((c) => c.title?.toLowerCase() !== "online")
      .map((c) => ({ _id: c._id, title: c.title })) || [];

  const [selectedCentersIds, setSelectedCentersIds] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [rangeDays, setRangeDays] = useState(7);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (centerOptions.length > 0 && !isInitialized) {
      setSelectedCentersIds(centerOptions.map((c) => c._id));
      setIsInitialized(true);
    }
  }, [centerOptions, isInitialized]);

  useEffect(() => {
    if (isInitialized && centerOptions.length > 0) {
      const availableIds = centerOptions.map((c) => c._id);
      const filtered = selectedCentersIds.filter((id) =>
        availableIds.includes(id)
      );
      if (filtered.length !== selectedCentersIds.length) {
        setSelectedCentersIds(filtered);
      }
    }
  }, [centerAccess, centers]);

  useEffect(() => {
    if (
      activeTab !== "dateRange" ||
      !hasUserPermission ||
      !isInitialized ||
      selectedCentersIds.length === 0
    )
      return;

    const { start, end } = getDateRange(rangeDays);

    if (!start || !end) return;

    const fetchReport = async () => {
      try {
        await dispatch(
          getRangeReport({
            centerIds: selectedCentersIds,
            startDate: start,
            endDate: end,
            page,
            limit: 20,
          })
        ).unwrap();
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error(error.message || "Failed to fetch ledger report.");
        }
      }
    };

    fetchReport();
  }, [selectedCentersIds, rangeDays, page, activeTab, isInitialized, hasUserPermission]);

  const payload = Array.isArray(rangeReport?.data) ? rangeReport.data : [];
  const totalPages = rangeReport?.totalPages || 1;
  const totalCenters = rangeReport?.totalCenters || 0;
  const currentPage = rangeReport?.currentPage || 1;

  const { start, end } = getDateRange(rangeDays);
  const dates = getBusinessDatesInRange(start, end);

  return (
    <TabPane tabId="dateRange" style={{ padding: 0 }}>
      <style>{`
        .ledger-tbl-wrap { overflow-x: auto; border: 0.5px solid #dee2e6; border-radius: 8px; }
        .ledger-tbl-wrap table { border-collapse: collapse; min-width: 100%; font-size: 13px; }
        .ledger-tbl-wrap thead tr { background: #f8f9fa; }
        .ledger-th { padding: 8px 12px; text-align: right; white-space: nowrap; font-weight: 500; color: #6c757d; border-bottom: 0.5px solid #dee2e6; border-right: 0.5px solid #dee2e6; position: sticky; top: 0; background: #f8f9fa; z-index: 2; }
        .ledger-th-branch { text-align: left; position: sticky; left: 0; z-index: 3; min-width: 170px; background: #f8f9fa; }
        .ledger-branch-cell { padding: 8px 12px; font-weight: 500; font-size: 13px; color: #212529; position: sticky; left: 0; background: #fff; z-index: 1; white-space: nowrap; border-right: 0.5px solid #adb5bd; border-bottom: 0.5px solid #dee2e6; }
        .ledger-tbl-wrap tr:last-child td { border-bottom: none; }
      `}</style>

      <div style={{ paddingTop: "1rem" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "12px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Input
            type="select"
            value={rangeDays}
            onChange={(e) => {
              setPage(1);
              setRangeDays(parseInt(e.target.value));
            }}
            style={{ minWidth: "140px", width: "auto" }}
          >
            <option value={7}>Last 7 days</option>
            <option value={15}>Last 15 days</option>
            <option value={30}>Last 30 days</option>
          </Input>

          <div style={{ fontSize: "13px", color: "#6c757d" }}>
            Showing {payload.length} of {totalCenters} centers
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner color="primary" />
          </div>
        ) : dates.length === 0 ? (
          <div className="text-center py-5 text-muted">
            Unable to determine date range.
          </div>
        ) : payload.length === 0 ? (
          <div className="text-center py-5 text-muted">
            No ledger data available for the selected period.
          </div>
        ) : (
          <>
            <div className="ledger-tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th className="ledger-th ledger-th-branch">Branch</th>
                    {dates.map((dateStr, i) => (
                      <th key={i} className="ledger-th">
                        {fmtDate(dateStr)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payload.map((centerData) => {
                    if (!centerData?.center?._id) return null;
                    const recordsByDate = {};
                    (centerData.records || []).forEach((r) => {
                      if (r?.businessDate) {
                        recordsByDate[r.businessDate] = r;
                      }
                    });

                    return (
                      <tr key={centerData.center._id}>
                        <td className="ledger-branch-cell">
                          {centerData.center.title}
                        </td>
                        {dates.map((dateStr, di) => {
                          const record = recordsByDate[dateStr];
                          const isLeft = di > dates.length - 4;
                          return record ? (
                            <LedgerCell
                              key={di}
                              record={record}
                              branchName={centerData.center.title}
                              isLeft={isLeft}
                            />
                          ) : (
                            <EmptyCell key={di} />
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "16px",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  size="sm"
                  color="outline-secondary"
                  disabled={currentPage === 1 || loading}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    size="sm"
                    color={p === currentPage ? "primary" : "outline-secondary"}
                    onClick={() => setPage(p)}
                    disabled={loading}
                  >
                    {p}
                  </Button>
                ))}

                <Button
                  size="sm"
                  color="outline-secondary"
                  disabled={currentPage === totalPages || loading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </TabPane>
  );
};

LedgerReport.propTypes = {
  centers: PropTypes.array,
  centerAccess: PropTypes.array,
  rangeReport: PropTypes.object,
  loading: PropTypes.bool,
  activeTab: PropTypes.string,
  hasUserPermission: PropTypes.bool,
  roles: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};

const mapStateToProps = (state) => ({
  centers: state.Center.data,
  centerAccess: state.User?.centerAccess,
  rangeReport: state.Cash.rangeReport,
  loading: state.Cash.loading,
});

export default connect(mapStateToProps)(LedgerReport);