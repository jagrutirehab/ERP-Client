import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Input,
  Label,
  Row,
} from "reactstrap";
import { format } from "date-fns";

import { getPosTransactions } from "../../helpers/backend_helper";
import { usePermissions } from "../../Components/Hooks/useRoles";
import PosTransactionTable from "./PosTransactionTable";
import RefundModal from "./RefundModal";

// Refreshes itself — a charge the terminal settles while this is open should
// appear without anyone remembering to reload.
const REFRESH_INTERVAL_MS = 30000;

const DEFAULT_PAGE_SIZE = 25;

// Page size is a per-user habit, not something to re-pick every visit.
const PAGE_SIZE_KEY = "posDashboardPageSize";

const readPageSize = () => {
  try {
    const stored = Number(window.localStorage.getItem(PAGE_SIZE_KEY));
    return stored > 0 ? stored : DEFAULT_PAGE_SIZE;
  } catch {
    return DEFAULT_PAGE_SIZE;
  }
};

const rememberPageSize = (size) => {
  try {
    window.localStorage.setItem(PAGE_SIZE_KEY, String(size));
  } catch {
    // Blocked storage just means it resets next visit.
  }
};

const todayValue = () => format(new Date(), "yyyy-MM-dd");

/**
 * Tiles double as the status filter. Each one is the count for that state
 * across the chosen centre and dates, so narrowing the table never hides how
 * much else is going on.
 */
const TILES = [
  { key: "ALL", countKey: "all", label: "All", color: "secondary" },
  { key: "APPROVED", countKey: "approved", label: "Approved", color: "success" },
  { key: "OPEN", countKey: "open", label: "In flight", color: "info" },
  { key: "FAILED", countKey: "failed", label: "Declined", color: "danger" },
  { key: "CANCELLED", countKey: "cancelled", label: "Cancelled", color: "secondary" },
  { key: "TIMEOUT", countKey: "timeout", label: "Timed out", color: "warning" },
  { key: "UNKNOWN", countKey: "unknown", label: "Unknown", color: "danger" },
  { key: "UNBILLED", countKey: "unbilled", label: "Unbilled", color: "danger" },
];

const PosPayments = ({ centers, centerAccess }) => {
  const navigate = useNavigate();
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { loading: permissionLoader, hasPermission } = usePermissions(token);
  const canView = hasPermission("POS_PAYMENTS", "POS_MONITOR", "READ");
  // Refunds send money back, so they are a separate grant from merely looking.
  const canRefund = hasPermission("POS_PAYMENTS", "POS_REFUND", "WRITE");

  useEffect(() => {
    if (permissionLoader) return;
    if (!canView) navigate("/unauthorized");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canView, permissionLoader]);

  const [centerId, setCenterId] = useState("");
  const [status, setStatus] = useState("ALL");
  // Defaults to today, which is what a cashier checking their own shift wants.
  const [from, setFrom] = useState(todayValue);
  const [to, setTo] = useState(todayValue);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(readPageSize);

  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refundTarget, setRefundTarget] = useState(null);

  const mountedRef = useRef(true);
  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    [],
  );

  const visibleCenters = (centers || []).filter((c) =>
    (centerAccess || []).includes(c._id),
  );

  const load = useCallback(async () => {
    try {
      const response = await getPosTransactions({
        ...(centerId ? { centerId } : {}),
        ...(status && status !== "ALL" ? { status } : {}),
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
        page,
        limit: perPage,
      });
      if (!mountedRef.current) return;
      setRows(response.payload || []);
      setCounts(response.counts || {});
      setTotal(response.total || 0);
      // The server clamps an out-of-range page, so follow it back rather than
      // leaving the control pointing at a page that does not exist.
      if (response.page && response.page !== page) setPage(response.page);
      setError(null);
    } catch (err) {
      if (mountedRef.current)
        setError(err?.message || "Could not load POS payments.");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [centerId, status, from, to, page, perPage]);

  useEffect(() => {
    setLoading(true);
    load();
    const timer = setInterval(load, REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [load]);

  // Any filter change restarts paging, otherwise page 3 of a narrower result
  // set looks empty.
  const applyFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const showAllTime = () => {
    setFrom("");
    setTo("");
    setPage(1);
  };

  const handleChangePage = (nextPage) => setPage(nextPage);

  const handleChangeRowsPerPage = (nextPerPage, nextPage) => {
    setPerPage(nextPerPage);
    rememberPageSize(nextPerPage);
    setPage(nextPage || 1);
  };

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <h4 className="card-title mb-0">
                  <i className="bx bx-credit-card me-2"></i>
                  POS Dashboard
                </h4>
                <div className="d-flex align-items-center gap-2">
                  <span className="text-muted fs-12">
                    {total} charge{total === 1 ? "" : "s"}
                  </span>
                  <Button size="sm" outline color="secondary" onClick={load}>
                    <i className="ri-refresh-line"></i>
                  </Button>
                </div>
              </CardHeader>

              <CardBody>
                {/* --- filters --- */}
                <Row className="g-2 align-items-end mb-3">
                  <Col xs={12} md={3}>
                    <Label className="text-muted fs-12 mb-1">Centre</Label>
                    <Input
                      type="select"
                      bsSize="sm"
                      value={centerId}
                      onChange={(e) => applyFilter(setCenterId)(e.target.value)}
                    >
                      <option value="">All centres</option>
                      {visibleCenters.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.title || c.name}
                        </option>
                      ))}
                    </Input>
                  </Col>

                  <Col xs={6} md={2}>
                    <Label className="text-muted fs-12 mb-1">From</Label>
                    <Input
                      type="date"
                      bsSize="sm"
                      value={from}
                      max={to || undefined}
                      onChange={(e) => applyFilter(setFrom)(e.target.value)}
                    />
                  </Col>

                  <Col xs={6} md={2}>
                    <Label className="text-muted fs-12 mb-1">To</Label>
                    <Input
                      type="date"
                      bsSize="sm"
                      value={to}
                      min={from || undefined}
                      onChange={(e) => applyFilter(setTo)(e.target.value)}
                    />
                  </Col>

                  <Col xs={12} md={3}>
                    <Label className="text-muted fs-12 mb-1">Status</Label>
                    <Input
                      type="select"
                      bsSize="sm"
                      value={status}
                      onChange={(e) => applyFilter(setStatus)(e.target.value)}
                    >
                      {TILES.map((t) => (
                        <option key={t.key} value={t.key}>
                          {t.label}
                        </option>
                      ))}
                    </Input>
                  </Col>

                  <Col xs={12} md={2}>
                    <Button
                      size="sm"
                      outline
                      color="secondary"
                      className="w-100"
                      onClick={showAllTime}
                      title="Clear the date range"
                    >
                      All time
                    </Button>
                  </Col>
                </Row>

                {/* --- counts, doubling as the status filter --- */}
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {TILES.map((tile) => {
                    const count = counts[tile.countKey] ?? 0;
                    const active = status === tile.key;
                    return (
                      <Button
                        key={tile.key}
                        size="sm"
                        outline={!active}
                        color={count > 0 ? tile.color : "light"}
                        onClick={() => applyFilter(setStatus)(tile.key)}
                        className={count === 0 ? "text-muted" : ""}
                      >
                        {tile.label}
                        <span className="ms-2 fw-semibold">{count}</span>
                      </Button>
                    );
                  })}
                </div>

                {error && (
                  <Alert color="danger" className="fs-12">
                    {error}
                  </Alert>
                )}

                {/* Paging and the page-size picker are the table's own, and
                    every change refetches from the server — only one page of
                    rows is ever in memory. */}
                <PosTransactionTable
                  rows={rows}
                  loading={loading}
                  emptyText={
                    from || to
                      ? "No POS charges in this date range. Widen the dates or hit “All time”."
                      : "No POS charges yet."
                  }
                  showRefund={canRefund}
                  onRefund={setRefundTarget}
                  totalRows={total}
                  page={page}
                  perPage={perPage}
                  onChangePage={handleChangePage}
                  onChangeRowsPerPage={handleChangeRowsPerPage}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>

      <RefundModal
        isOpen={!!refundTarget}
        toggle={() => setRefundTarget(null)}
        transaction={refundTarget}
        onDone={load}
      />
    </div>
  );
};

PosPayments.propTypes = {
  centers: PropTypes.array,
  centerAccess: PropTypes.array,
};

const mapStateToProps = (state) => ({
  centers: state.Center.data,
  centerAccess: state.User?.centerAccess,
});

export default connect(mapStateToProps)(PosPayments);
