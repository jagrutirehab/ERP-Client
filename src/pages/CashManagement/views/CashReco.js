import React, { useCallback, useEffect, useMemo, useState } from "react";
import { connect, useDispatch } from "react-redux";
import {
  Badge,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Spinner,
  Table,
} from "reactstrap";
import PropTypes from "prop-types";
import moment from "moment";
import Select from "react-select";
import { toast } from "react-toastify";
import {
  Check,
  Clock,
  Coins,
  Lock,
  Pencil,
  RotateCw,
  Scale,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { denominationOptions } from "../../../Components/constants/cash";
import {
  addCashReco,
  getCashRecos,
  updateCashReco,
  deleteCashReco,
  fetchCashRecoDayStatus,
  fetchCashRecoComparison,
  confirmCashReco,
} from "../../../store/features/cashManagement/cashSlice";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import CheckPermission from "../../../Components/HOC/CheckPermission";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { capitalizeWords } from "../../../utils/toCapitalize";
import RefreshButton from "../../../Components/Common/RefreshButton";
import DeleteModal from "../../../Components/Common/DeleteModal";
import CenterDropdown from "../../Report/Components/Doctor/components/CenterDropDown";
import DateRangeFilter from "../../../Components/Common/DateRangeFilter";
import { endOfDay, startOfDay, subDays } from "date-fns";
import DenominationEditor, {
  emptyDenominationRow,
  denominationTotal,
  validateDenominationRows,
  toDenominationPayload,
  toDenominationRows,
} from "../Components/DenominationEditor";
import { formatCurrency } from "../../../utils/formatCurrency";

const FORM_TAB = "FORM";
const RECORDS_TAB = "RECORDS";
const PAGE_LIMIT = 10;

const typeLabel = (type) =>
  type === "CLOSING" ? "Closing Balance" : "Opening Balance";

const CashReco = ({ centers, centerAccess, cashRecos }) => {
  const dispatch = useDispatch();
  const handleAuthError = useAuthError();

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission, roles } = usePermissions(token);

  const hasCreatePermission =
    hasPermission("CASH", "CASHRECO", "WRITE") ||
    hasPermission("CASH", "CASHRECO", "DELETE");
  const hasReadPermission = hasPermission("CASH", "CASHRECO", "READ");

  const centerOptions = useMemo(
    () =>
      centers
        ?.filter((c) => centerAccess?.includes(c._id))
        .filter((c) => c.title?.toLowerCase() !== "online")
        .map((c) => ({ _id: c._id, title: c.title })) || [],
    [centers, centerAccess]
  );

  const centerSelectOptions = useMemo(
    () => centerOptions.map((c) => ({ value: c._id, label: c.title })),
    [centerOptions]
  );

  const [tab, setTab] = useState(hasCreatePermission ? FORM_TAB : RECORDS_TAB);

  const [center, setCenter] = useState("");
  const [rows, setRows] = useState(() =>
    Array.from({ length: 5 }, emptyDenominationRow)
  );
  const [comments, setComments] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [dayStatus, setDayStatus] = useState(null);
  const [dayStatusLoading, setDayStatusLoading] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  const [pendingEntry, setPendingEntry] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!comparison) return;
    const timer = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(timer);
  }, [comparison]);

  const STALE_AFTER_MS = 2 * 60 * 1000;
  const comparisonAgeMs = comparison?.calculatedAt
    ? now - new Date(comparison.calculatedAt).getTime()
    : 0;
  const comparisonIsStale = comparisonAgeMs > STALE_AFTER_MS;

  const [selectedCenterIds, setSelectedCenterIds] = useState([]);
  const [centersInitialized, setCentersInitialized] = useState(false);
  const [page, setPage] = useState(1);
  const [reportDate, setReportDate] = useState({
    start: startOfDay(subDays(new Date(), 29)),
    end: endOfDay(new Date()),
  });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (centerOptions.length > 0 && !centersInitialized) {
      setSelectedCenterIds(centerOptions.map((c) => c._id));
      setCentersInitialized(true);
    }
  }, [centerOptions, centersInitialized]);

  useEffect(() => {
    if (!centersInitialized) return;
    const availableCenterIds = centerOptions.map((c) => c._id);
    setSelectedCenterIds((prev) => {
      const filtered = prev.filter((id) => availableCenterIds.includes(id));
      return filtered.length === prev.length ? prev : filtered;
    });
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerAccess, centers]);

  const grandTotal = denominationTotal(rows);
  const totalPieces = rows.reduce((sum, row) => sum + Number(row.count || 0), 0);
  const filledDenominations = rows.filter((row) => row.denomination !== "").length;

  const resetForm = () => {
    setRows(Array.from({ length: 5 }, emptyDenominationRow));
    setComments("");
    setErrors({});
  };

  const loadDayStatus = useCallback(
    async (centerId) => {
      if (!centerId) {
        setDayStatus(null);
        setSelectedType(null);
        return;
      }
      setDayStatusLoading(true);
      try {
        const status = await dispatch(
          fetchCashRecoDayStatus(centerId)
        ).unwrap();
        setDayStatus(status);
        setSelectedType(status?.nextType || null);
      } catch (error) {
        if (!handleAuthError(error)) {
          setDayStatus(null);
          setSelectedType(null);
        }
      } finally {
        setDayStatusLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch]
  );

  useEffect(() => {
    loadDayStatus(center);
  }, [center, loadDayStatus]);

  const availableTypes = dayStatus?.availableTypes || [];
  const dayIsFull = dayStatus ? availableTypes.length === 0 : false;
  const entryType = selectedType || dayStatus?.nextType;

  const validate = () => {
    const nextErrors = validateDenominationRows(rows);
    if (!center) nextErrors.center = "Please select a center";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  useEffect(() => {
    setErrors((prev) => {
      if (!Object.keys(prev).length) return prev;
      const stillInvalid = validateDenominationRows(rows);
      const next = { ...prev };
      if (center) delete next.center;
      if (stillInvalid.rows) next.rows = stillInvalid.rows;
      else delete next.rows;
      if (stillInvalid.rowErrors) next.rowErrors = stillInvalid.rowErrors;
      else delete next.rowErrors;
      return next;
    });
  }, [center, rows]);

  const loadComparison = async (entryId) => {
    setComparisonLoading(true);
    try {
      const result = await dispatch(
        fetchCashRecoComparison(entryId)
      ).unwrap();
      setComparison(result);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.message || "Failed to load the comparison.");
      }
    } finally {
      setComparisonLoading(false);
    }
  };

  const leaveComparison = () => {
    setPendingEntry(null);
    setComparison(null);
    resetForm();
    loadDayStatus(center);
    fetchRecords();
  };

  const handleConfirm = async () => {
    if (confirming || !comparison) return;
    setConfirming(true);
    try {
      await dispatch(
        confirmCashReco({
          id: pendingEntry._id,
          acknowledgedDifference: comparison.difference,
        })
      ).unwrap();
      toast.success("Cash reco confirmed and locked");
      leaveComparison();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.message || "Failed to confirm.");
        loadComparison(pendingEntry._id);
      }
    } finally {
      setConfirming(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasCreatePermission) {
      toast.error("You don't have permission to submit a balance");
      return;
    }
    if (dayIsFull) {
      toast.error(
        "Opening and closing balance are already recorded for this center today"
      );
      return;
    }
    if (!validate()) return;

    setSubmitting(true);
    try {
      const saved = await dispatch(
        addCashReco({
          center,
          type: entryType,
          comments: comments || undefined,
          denominations: toDenominationPayload(rows),
        })
      ).unwrap();
      toast.success(`${typeLabel(saved?.type)} recorded — review the comparison`);
      setPendingEntry(saved);
      loadComparison(saved._id);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.message || "Failed to submit balance.");
      }
      loadDayStatus(center);
    } finally {
      setSubmitting(false);
    }
  };

  const canManage = hasPermission("CASH", "CASHRECO", "DELETE");

  const [editTarget, setEditTarget] = useState(null);
  const [editRows, setEditRows] = useState([]);
  const [editComments, setEditComments] = useState("");
  const [editErrors, setEditErrors] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openEdit = (record) => {
    setEditTarget(record);
    setEditRows(toDenominationRows(record.denominations));
    setEditComments(record.comments || "");
    setEditErrors({});
  };

  const closeEdit = () => {
    setEditTarget(null);
    setEditRows([]);
    setEditComments("");
    setEditErrors({});
  };

  const handleEditSave = async () => {
    const validationErrors = validateDenominationRows(editRows);
    setEditErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setEditSaving(true);
    try {
      await dispatch(
        updateCashReco({
          id: editTarget._id,
          comments: editComments || undefined,
          denominations: toDenominationPayload(editRows),
        })
      ).unwrap();
      const updated = await dispatch(
        fetchCashRecoComparison(editTarget._id)
      ).unwrap();
      toast.success(
        editTarget.status === "CONFIRMED"
          ? "Entry updated — it needs confirming again"
          : "Entry updated successfully"
      );
      // The counted total changed, so the difference did too.
      if (pendingEntry?._id === editTarget._id) {
        setComparison(updated);
        setPendingEntry(updated.entry);
      }
      closeEdit();
      fetchRecords();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.message || "Failed to update entry.");
      }
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await dispatch(deleteCashReco(deleteTarget._id)).unwrap();
      toast.success("Entry deleted successfully");
      setDeleteTarget(null);
      fetchRecords();
      loadDayStatus(center);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.message || "Failed to delete entry.");
      }
    } finally {
      setDeleting(false);
    }
  };

  const fetchRecords = useCallback(async () => {
    if (!hasReadPermission || !centerAccess) return;
    try {
      await dispatch(
        getCashRecos({
          page,
          limit: PAGE_LIMIT,
          centers: selectedCenterIds.join(","),
          startDate: reportDate.start.toISOString(),
          endDate: reportDate.end.toISOString(),
          search: debouncedSearch,
          type: typeFilter,
        })
      ).unwrap();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.message || "Failed to fetch cash reco entries.");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dispatch,
    page,
    selectedCenterIds,
    reportDate,
    debouncedSearch,
    typeFilter,
    centerAccess,
    hasReadPermission,
  ]);

  useEffect(() => {
    if (tab !== RECORDS_TAB) return;
    fetchRecords();
  }, [tab, fetchRecords]);

  if (!hasCreatePermission && !hasReadPermission) {
    return (
      <div className="text-center py-5">
        <h5 className="text-muted">
          You don't have permission to access this section
        </h5>
      </div>
    );
  }

  const records = cashRecos?.data || [];
  const pagination = cashRecos?.pagination || {};
  const recordsLoading = cashRecos?.loading;

  return (
    <React.Fragment>
      <div className="d-flex justify-content-between flex-wrap align-items-center mb-3">
        <h5 className="fw-bold mb-0">Cash Daily Reco</h5>
        <ButtonGroup size="sm">
          {hasCreatePermission && (
            <Button outline={tab !== FORM_TAB} onClick={() => setTab(FORM_TAB)}>
              New Entry
            </Button>
          )}
          {hasReadPermission && (
            <Button
              outline={tab !== RECORDS_TAB}
              onClick={() => setTab(RECORDS_TAB)}
            >
              Submitted Records
            </Button>
          )}
        </ButtonGroup>
      </div>

      {/* Step indicator — the form is step 1, the comparison is step 2. */}
      {tab === FORM_TAB && hasCreatePermission && (
        <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
          {[
            { step: 1, label: "Count Cash" },
            { step: 2, label: "Review & Confirm" },
          ].map(({ step, label }, index) => {
            const current = pendingEntry ? 2 : 1;
            const done = current > step;
            const active = current === step;
            return (
              <React.Fragment key={step}>
                {index > 0 && (
                  <div
                    className="flex-grow-1 d-none d-sm-block"
                    style={{ height: 1, background: "#e9ebec", minWidth: 20 }}
                  />
                )}
                <div className="d-flex align-items-center gap-2">
                  <span
                    className="d-inline-flex align-items-center justify-content-center rounded-circle fw-semibold"
                    style={{
                      width: 26,
                      height: 26,
                      fontSize: 13,
                      background: active || done ? "#405189" : "#e9ebec",
                      color: active || done ? "#fff" : "#878a99",
                    }}
                  >
                    {done ? <Check size={14} /> : step}
                  </span>
                  <span
                    className={
                      active ? "fw-semibold text-dark" : "text-muted small"
                    }
                  >
                    {label}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}

      {tab === FORM_TAB && pendingEntry && (
        <CheckPermission
          accessRolePermission={roles?.permissions}
          permission={"create"}
          subAccess={"CASHRECO"}
        >
          <Row>
            <Col lg={8}>
              <Card className="shadow-sm">
                <CardHeader className="bg-transparent border-bottom d-flex justify-content-between align-items-center gap-2">
                  <h5 className="mb-0 fw-semibold">
                    <Scale size={18} className="me-2 text-primary" />
                    Review Difference — {pendingEntry.id}
                  </h5>
                  <RefreshButton
                    loading={comparisonLoading}
                    onRefresh={() => loadComparison(pendingEntry._id)}
                  />
                </CardHeader>
                <CardBody>
                  {comparisonLoading || !comparison ? (
                    <div className="text-center py-5 text-muted">
                      <Spinner color="primary" className="mb-3" />
                      <p className="mb-0">Calculating expected balance...</p>
                    </div>
                  ) : (
                    <>
                      <Row className="g-3 mb-3">
                        <Col xs={12} sm={6} lg={4}>
                          <div className="h-100 p-3 rounded border bg-light bg-opacity-50">
                            <div className="text-uppercase text-muted small fw-semibold mb-1">
                              Expected Balance
                            </div>
                            <div className="h4 fw-bold text-dark mb-1">
                              {formatCurrency(comparison.systemBalance)}
                            </div>
                            <div className="text-muted small">
                              System total for{" "}
                              {capitalizeWords(
                                pendingEntry?.center?.title ||
                                  comparison?.entry?.center?.title ||
                                  ""
                              )}
                            </div>
                          </div>
                        </Col>

                        <Col xs={12} sm={6} lg={4}>
                          <div className="h-100 p-3 rounded border bg-light bg-opacity-50">
                            <div className="text-uppercase text-muted small fw-semibold mb-1">
                              Counted Balance
                            </div>
                            <div className="h4 fw-bold text-dark mb-1">
                              {formatCurrency(comparison.countedTotal)}
                            </div>
                            <div className="text-muted small">
                              Total of the denominations entered
                            </div>
                          </div>
                        </Col>

                        <Col xs={12} lg={4}>
                          <div
                            className="h-100 p-3 rounded border border-2"
                            style={{
                              borderColor: comparison.matched
                                ? "#0ab39c"
                                : comparison.difference > 0
                                  ? "#f7b84b"
                                  : "#f06548",
                              backgroundColor: comparison.matched
                                ? "rgba(10,179,156,0.06)"
                                : comparison.difference > 0
                                  ? "rgba(247,184,75,0.08)"
                                  : "rgba(240,101,72,0.06)",
                            }}
                          >
                            <div className="text-uppercase text-muted small fw-semibold mb-1">
                              Difference
                            </div>
                            <div
                              className="h4 fw-bold mb-1 d-flex align-items-center gap-1"
                              style={{
                                color: comparison.matched
                                  ? "#0ab39c"
                                  : comparison.difference > 0
                                    ? "#a97a1c"
                                    : "#f06548",
                              }}
                            >
                              {!comparison.matched &&
                                (comparison.difference > 0 ? (
                                  <TrendingUp size={18} />
                                ) : (
                                  <TrendingDown size={18} />
                                ))}
                              {comparison.difference > 0 ? "+" : ""}
                              {formatCurrency(comparison.difference)}
                            </div>
                            <div className="text-muted small">
                              {comparison.matched
                                ? "Counted cash matches the system"
                                : comparison.difference > 0
                                  ? "Excess cash in hand"
                                  : "Shortfall against the system"}
                            </div>
                          </div>
                        </Col>
                      </Row>

                      <div className="d-flex align-items-center justify-content-between text-muted small mb-2">
                        <span>
                          <Clock size={13} className="me-1" />
                          Checked{" "}
                          {comparison.calculatedAt
                            ? moment(comparison.calculatedAt).fromNow()
                            : "just now"}
                        </span>
                      </div>

                      {comparisonIsStale && (
                        <div className="p-3 mb-3 border-start rounded bg-danger bg-opacity-10 border-danger">
                          <small className="fw-semibold text-danger">
                            This screen has been open a while and new cash
                            transactions may have come in since. Please refresh
                            once before confirming, so you're confirming the
                            latest figures.
                          </small>
                        </div>
                      )}

                      <div
                        className="p-3 mb-3 border-start rounded"
                        style={{
                          backgroundColor: "rgba(255, 243, 205, 0.5)",
                          borderColor: "#b45309",
                        }}
                      >
                        <small
                          className="fw-semibold"
                          style={{ color: "#78350f" }}
                        >
                          {comparison.matched
                            ? "No difference found. Confirming locks this entry — it can no longer be edited with write access."
                            : `There is a difference of ${formatCurrency(
                                Math.abs(comparison.difference)
                              )}. Do you want to confirm? Once confirmed this entry is locked and can no longer be edited with write access.`}
                        </small>
                      </div>

                      <div className="d-flex flex-column flex-sm-row gap-2">
                        <Button
                          color="primary"
                          className="flex-fill"
                          onClick={
                            comparisonIsStale
                              ? () => loadComparison(pendingEntry._id)
                              : handleConfirm
                          }
                          disabled={confirming}
                        >
                          {confirming ? (
                            <Spinner size="sm" />
                          ) : comparisonIsStale ? (
                            <>
                              <RotateCw size={16} className="me-2" />
                              Refresh to Confirm
                            </>
                          ) : (
                            <>
                              <Check size={18} className="me-2" />
                              Yes, Confirm &amp; Lock
                            </>
                          )}
                        </Button>
                        <Button
                          color="light"
                          className="flex-fill"
                          disabled={confirming}
                          onClick={() => openEdit(pendingEntry)}
                        >
                          <Pencil size={16} className="me-2" />
                          Recount
                        </Button>
                        <Button
                          color="light"
                          className="flex-fill"
                          disabled={confirming}
                          onClick={leaveComparison}
                        >
                          Confirm Later
                        </Button>
                      </div>
                    </>
                  )}
                </CardBody>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="shadow-sm">
                <CardHeader className="bg-transparent border-bottom">
                  <h5 className="mb-0 fw-semibold">What You Counted</h5>
                </CardHeader>
                <CardBody className="p-0">
                  <Table size="sm" className="align-middle mb-0">
                    <tbody>
                      {pendingEntry.denominations?.map((d) => (
                        <tr key={d.denomination}>
                          <td>₹{d.denomination}</td>
                          <td className="text-center text-muted">×{d.count}</td>
                          <td className="text-end fw-semibold">
                            {formatCurrency(d.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="table-light">
                        <th colSpan={2}>Total</th>
                        <th className="text-end">
                          {formatCurrency(pendingEntry.total)}
                        </th>
                      </tr>
                    </tfoot>
                  </Table>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </CheckPermission>
      )}

      {tab === FORM_TAB && !pendingEntry && (
        <CheckPermission
          accessRolePermission={roles?.permissions}
          permission={"create"}
          subAccess={"CASHRECO"}
        >
          <Row>
            <Col lg={8}>
              <Card className="shadow-sm">
                <CardHeader className="bg-transparent border-bottom">
                  <h5 className="mb-0 fw-semibold">
                    <Coins size={18} className="me-2 text-primary" />
                    Denomination Wise Cash Count
                  </h5>
                </CardHeader>
                <CardBody>
                  <Form onSubmit={handleSubmit}>
                    <FormGroup>
                      <Label for="ob-center" className="fw-medium">
                        Center <span className="text-danger">*</span>
                      </Label>
                      <Select
                        inputId="ob-center"
                        classNamePrefix="react-select"
                        options={centerSelectOptions}
                        value={
                          centerSelectOptions.find(
                            (o) => o.value === center
                          ) || null
                        }
                        onChange={(option) => setCenter(option?.value || "")}
                        placeholder="Select a Center"
                        isClearable
                      />
                      {errors.center && (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle me-1"></i>
                          {errors.center}
                        </div>
                      )}
                    </FormGroup>

                    {center && dayStatusLoading && (
                      <div className="text-muted small mb-3">
                        <Spinner size="sm" className="me-2" />
                        Checking today's entries...
                      </div>
                    )}

                    {center && !dayStatusLoading && dayStatus && (
                      <FormGroup>
                        <Label className="fw-medium">
                          Balance Type <span className="text-danger">*</span>
                        </Label>
                        {dayIsFull ? (
                          <div className="d-flex align-items-center gap-2 p-3 rounded bg-light">
                            <Badge color="secondary">DAY COMPLETE</Badge>
                            <small className="text-muted">
                              Both the opening and closing balance are already
                              recorded for this center today.
                            </small>
                          </div>
                        ) : (
                          <>
                            <Row className="g-2">
                              {["OPENING", "CLOSING"].map((option) => {
                                const taken = !availableTypes.includes(option);
                                const selected = entryType === option;
                                const filledEntry = dayStatus.entries?.find(
                                  (entry) => entry.type === option
                                );

                                return (
                                  <Col xs={6} key={option}>
                                    <button
                                      type="button"
                                      disabled={taken}
                                      onClick={() => setSelectedType(option)}
                                      className="w-100 h-100 text-start p-3 rounded border position-relative"
                                      style={{
                                        borderWidth: selected ? 2 : 1,
                                        borderColor: selected
                                          ? "#405189"
                                          : "#e9ebec",
                                        background: taken
                                          ? "#f3f6f9"
                                          : selected
                                            ? "rgba(64,81,137,0.06)"
                                            : "#fff",
                                        cursor: taken
                                          ? "not-allowed"
                                          : "pointer",
                                      }}
                                    >
                                      <div className="d-flex align-items-center justify-content-between mb-1">
                                        <span
                                          className={`fw-semibold ${
                                            taken
                                              ? "text-muted"
                                              : selected
                                                ? "text-primary"
                                                : "text-dark"
                                          }`}
                                        >
                                          {typeLabel(option)}
                                        </span>
                                        {selected && !taken && (
                                          <Check
                                            size={16}
                                            className="text-primary flex-shrink-0"
                                          />
                                        )}
                                      </div>
                                      <div className="d-flex align-items-center gap-2">
                                        <Badge
                                          color={taken ? "secondary" : "light"}
                                          className={
                                            taken ? "" : "text-dark border"
                                          }
                                        >
                                          {option === "OPENING" ? "OB" : "CB"}
                                        </Badge>
                                        <small
                                          className={
                                            taken
                                              ? "text-muted"
                                              : "text-success fw-semibold"
                                          }
                                        >
                                          {taken
                                            ? `Filled — ${filledEntry?.id || ""}`
                                            : "Available"}
                                        </small>
                                      </div>
                                    </button>
                                  </Col>
                                );
                              })}
                            </Row>
                            <small className="text-muted d-block mt-2">
                              {availableTypes.length === 2
                                ? "Nothing recorded yet today. Opening is selected by default — pick closing instead if the opening balance was never filled."
                                : `Only the ${typeLabel(
                                    availableTypes[0]
                                  ).toLowerCase()} slot is free for this center today.`}
                            </small>
                          </>
                        )}
                      </FormGroup>
                    )}

                    <Label className="fw-medium">
                      Denominations <span className="text-danger">*</span>
                    </Label>
                    <DenominationEditor
                      rows={rows}
                      setRows={setRows}
                      errors={errors}
                      disabled={dayIsFull}
                    />

                    <FormGroup>
                      <Label for="ob-comments" className="fw-medium">
                        Comments
                      </Label>
                      <Input
                        type="textarea"
                        id="ob-comments"
                        rows="2"
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Any notes about this entry..."
                        disabled={dayIsFull}
                      />
                    </FormGroup>

                    <Button
                      color="primary"
                      type="submit"
                      className="w-100"
                      disabled={submitting || dayIsFull || dayStatusLoading}
                    >
                      {submitting ? (
                        <Spinner size="sm" />
                      ) : (
                        <>
                          <Check size={18} className="me-2" />
                          {dayIsFull
                            ? "Already Recorded Today"
                            : `Submit ${entryType ? typeLabel(entryType) : "Balance"}`}
                        </>
                      )}
                    </Button>
                  </Form>
                </CardBody>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="shadow-sm">
                <CardHeader className="bg-transparent border-bottom">
                  <h5 className="mb-0 fw-semibold">Summary</h5>
                </CardHeader>
                <CardBody className="text-center">
                  <p className="text-muted mb-1">
                    Total {entryType ? typeLabel(entryType) : "Balance"}
                  </p>
                  <h1 className="fw-bold text-dark display-6 mb-3">
                    {formatCurrency(grandTotal)}
                  </h1>
                  <div className="d-flex justify-content-between border-top pt-3">
                    <span className="text-muted">Total Notes / Coins</span>
                    <span className="fw-semibold">{totalPieces}</span>
                  </div>
                  <div className="d-flex justify-content-between mt-2">
                    <span className="text-muted">Denominations Added</span>
                    <span className="fw-semibold">{filledDenominations}</span>
                  </div>

                  {dayStatus?.entries?.length > 0 && (
                    <div className="border-top mt-3 pt-3 text-start">
                      <p className="text-muted small mb-2">
                        Already recorded today
                      </p>
                      {dayStatus.entries.map((entry) => (
                        <div
                          key={entry.id}
                          className="d-flex justify-content-between align-items-center mb-1"
                        >
                          <Badge
                            color={
                              entry.type === "OPENING" ? "success" : "info"
                            }
                          >
                            {entry.type}
                          </Badge>
                          <span className="fw-semibold small">
                            {formatCurrency(entry.total)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div
                    className="p-3 mt-4 border-start rounded text-start"
                    style={{
                      backgroundColor: "rgba(255, 243, 205, 0.5)",
                      borderColor: "#b45309",
                    }}
                  >
                    <small className="fw-semibold" style={{ color: "#78350f" }}>
                      Note: The filled time is recorded automatically and cannot
                      be changed later.
                    </small>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </CheckPermission>
      )}

      {tab === RECORDS_TAB && (
        <CheckPermission
          accessRolePermission={roles?.permissions}
          permission={"read"}
          subAccess={"CASHRECO"}
        >
          <Card className="shadow-sm">
            <CardHeader className="bg-transparent border-bottom d-flex justify-content-between align-items-center gap-2">
              <h5 className="mb-0 fw-semibold">
                <Clock size={18} className="me-2 text-primary" />
                Submitted Balances
              </h5>
              <RefreshButton
                loading={!!recordsLoading}
                onRefresh={fetchRecords}
              />
            </CardHeader>

            <div className="px-3 py-3 border-bottom">
              <Row className="g-2 align-items-end">
                <Col xs={12} sm={6} lg={3}>
                  <Label className="form-label text-muted small mb-1">
                    Search
                  </Label>
                  <Input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Entry ID (OB12 / CB4)"
                  />
                </Col>

                <Col xs={12} sm={6} lg={2}>
                  <Label className="form-label text-muted small mb-1">
                    Balance Type
                  </Label>
                  <Input
                    type="select"
                    value={typeFilter}
                    onChange={(e) => {
                      setPage(1);
                      setTypeFilter(e.target.value);
                    }}
                  >
                    <option value="">All Types</option>
                    <option value="OPENING">Opening Only</option>
                    <option value="CLOSING">Closing Only</option>
                  </Input>
                </Col>

                <Col xs={12} sm={6} lg={3}>
                  <Label className="form-label text-muted small mb-1">
                    Centers
                  </Label>
                  <CenterDropdown
                    className="w-100"
                    options={centerOptions}
                    value={selectedCenterIds}
                    onChange={(ids) => {
                      setPage(1);
                      setSelectedCenterIds(ids);
                    }}
                  />
                </Col>

                <Col xs={12} sm={6} lg={4}>
                  <Label className="form-label text-muted small mb-1">
                    Date Range
                  </Label>
                  <div className="overflow-auto">
                    <div style={{ minWidth: "290px" }}>
                      <DateRangeFilter
                        reportDate={reportDate}
                        setReportDate={(value) => {
                          setPage(1);
                          setReportDate(value);
                        }}
                        disabled={!!debouncedSearch}
                      />
                    </div>
                  </div>
                </Col>
              </Row>

              {debouncedSearch && (
                <small className="text-muted d-block mt-2">
                  <i className="fas fa-info-circle me-1"></i>
                  Showing ID matches for "{debouncedSearch}" across all dates —
                  clear the search to use the date range.
                </small>
              )}
            </div>
            <CardBody>
              {recordsLoading ? (
                <div className="text-center py-5 text-muted">
                  <Spinner color="primary" className="mb-3" />
                  <p className="h5">Fetching cash reco entries...</p>
                </div>
              ) : records.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <Coins size={48} className="mb-3" />
                  {debouncedSearch ? (
                    <>
                      <p className="h5">
                        No entry found for "{debouncedSearch}"
                      </p>
                      <p>Check the entry ID and try again.</p>
                    </>
                  ) : (
                    <>
                      <p className="h5">
                        No {typeFilter ? typeLabel(typeFilter).toLowerCase() : "balance"}{" "}
                        found in the selected range
                      </p>
                      <p>
                        Try widening the date range, changing the balance type,
                        or selecting more centers.
                      </p>
                    </>
                  )}
                </div>
              ) : (
                records.map((record) => (
                  <Card key={record._id} className="mb-3 border shadow-sm">
                    <CardBody>
                      <Row className="align-items-start mb-3">
                        <Col md={7}>
                          <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
                            <Badge
                              color={
                                record.type === "OPENING" ? "success" : "info"
                              }
                            >
                              {typeLabel(record.type)}
                            </Badge>
                            <Badge color="primary">
                              {capitalizeWords(record?.center?.title)}
                            </Badge>
                            <Badge color="light" className="text-dark border">
                              {record.id}
                            </Badge>
                            {record.status === "CONFIRMED" ? (
                              <Badge color="dark">
                                <Lock size={11} className="me-1" />
                                CONFIRMED
                              </Badge>
                            ) : (
                              <Badge color="warning" className="text-dark">
                                PENDING CONFIRMATION
                              </Badge>
                            )}
                          </div>
                          <div className="text-muted small">
                            <Clock size={13} className="me-1" />
                            Filled on{" "}
                            <span className="fw-semibold">
                              {moment(record.filledAt).format(
                                "DD MMM YYYY, hh:mm:ss A"
                              )}
                            </span>
                            {record?.author?.name &&
                              ` by ${capitalizeWords(record.author.name)}`}
                          </div>
                          {record.status === "CONFIRMED" &&
                            record?.confirmedAt && (
                              <div className="text-muted small mt-1">
                                <Lock size={12} className="me-1" />
                                Confirmed on{" "}
                                <span className="fw-semibold">
                                  {moment(record.confirmedAt).format(
                                    "DD MMM YYYY, hh:mm:ss A"
                                  )}
                                </span>
                                {record?.confirmedBy?.name &&
                                  ` by ${capitalizeWords(
                                    record.confirmedBy.name
                                  )}`}
                              </div>
                            )}
                          {record?.comments && (
                            <div className="text-muted small mt-1">
                              {record.comments}
                            </div>
                          )}
                        </Col>
                        <Col md={5} className="text-md-end mt-2 mt-md-0">
                          <div className="text-muted small">Counted Total</div>
                          <span className="h4 fw-bold text-success mb-0 d-block">
                            {formatCurrency(record.total)}
                          </span>

                          {record.systemBalance !== undefined &&
                            record.systemBalance !== null && (
                              <div className="small mt-1">
                                <span className="text-muted">
                                  Expected {formatCurrency(record.systemBalance)}
                                  {" · "}
                                </span>
                                <span
                                  className={`fw-semibold ${
                                    Number(record.difference) === 0
                                      ? "text-success"
                                      : "text-danger"
                                  }`}
                                >
                                  {Number(record.difference) === 0
                                    ? "No difference"
                                    : `Diff ${
                                        record.difference > 0 ? "+" : ""
                                      }${formatCurrency(record.difference)}`}
                                </span>
                              </div>
                            )}

                          <div className="d-flex justify-content-md-end gap-2 mt-2 flex-wrap">
                            {record.status !== "CONFIRMED" &&
                              hasCreatePermission && (
                                <Button
                                  color="primary"
                                  size="sm"
                                  onClick={() => {
                                    setTab(FORM_TAB);
                                    setPendingEntry(record);
                                    loadComparison(record._id);
                                  }}
                                >
                                  <Scale size={14} className="me-1" />
                                  Review &amp; Confirm
                                </Button>
                              )}

                            {(record.status !== "CONFIRMED"
                              ? hasCreatePermission
                              : canManage) && (
                              <Button
                                color="light"
                                size="sm"
                                onClick={() => openEdit(record)}
                              >
                                <Pencil size={14} className="me-1" />
                                Edit
                              </Button>
                            )}

                            {canManage && (
                              <Button
                                color="light"
                                size="sm"
                                className="text-danger"
                                onClick={() => setDeleteTarget(record)}
                              >
                                <Trash2 size={14} className="me-1" />
                                Delete
                              </Button>
                            )}
                          </div>
                        </Col>
                      </Row>

                      <div className="table-responsive">
                        <Table
                          size="sm"
                          bordered
                          className="align-middle mb-0"
                        >
                          <thead className="table-light">
                            <tr>
                              <th>Denomination</th>
                              <th className="text-end">Count</th>
                              <th className="text-end">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {record.denominations?.map((d) => (
                              <tr key={d.denomination}>
                                <td>
                                  {denominationOptions.find(
                                    (o) => o.value === d.denomination
                                  )?.label || `₹${d.denomination}`}
                                </td>
                                <td className="text-end">{d.count}</td>
                                <td className="text-end fw-semibold">
                                  {formatCurrency(d.amount)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="table-light">
                              <th>Total</th>
                              <th className="text-end">
                                {record.denominations?.reduce(
                                  (sum, d) => sum + d.count,
                                  0
                                )}
                              </th>
                              <th className="text-end">
                                {formatCurrency(record.total)}
                              </th>
                            </tr>
                          </tfoot>
                        </Table>
                      </div>
                    </CardBody>
                  </Card>
                ))
              )}

              {!recordsLoading && pagination?.totalPages > 1 && (
                <div className="d-flex flex-column align-items-center gap-2 mt-3">
                  <span className="text-muted small text-center">
                    <span className="d-none d-sm-inline">
                      Page {pagination.page} of {pagination.totalPages} (
                      {pagination.totalDocs} entries)
                    </span>
                    <span className="d-sm-none">
                      {pagination.page} / {pagination.totalPages}
                    </span>
                  </span>
                  <div className="d-flex align-items-center gap-2">
                    <Button
                      color="secondary"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      color="secondary"
                      disabled={page >= pagination.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </CheckPermission>
      )}

      {/* Edit entry */}
      <Modal isOpen={!!editTarget} toggle={closeEdit} size="lg" centered>
        <ModalHeader toggle={closeEdit}>
          Edit {editTarget ? typeLabel(editTarget.type) : "Entry"}
          {editTarget ? ` — ${editTarget.id}` : ""}
        </ModalHeader>
        <ModalBody>
          <div className="text-muted small mb-3">
            Center, type and date can't be changed. Update the counted cash
            below and the total will be recalculated.
          </div>
          <DenominationEditor
            rows={editRows}
            setRows={setEditRows}
            errors={editErrors}
          />
          <FormGroup className="mb-0">
            <Label for="ob-edit-comments" className="fw-medium">
              Comments
            </Label>
            <Input
              type="textarea"
              id="ob-edit-comments"
              rows="2"
              value={editComments}
              onChange={(e) => setEditComments(e.target.value)}
              placeholder="Any notes about this entry..."
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={closeEdit} disabled={editSaving}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleEditSave} disabled={editSaving}>
            {editSaving ? <Spinner size="sm" /> : "Save Changes"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete confirmation */}
      <DeleteModal
        show={!!deleteTarget}
        onCloseClick={() => setDeleteTarget(null)}
        onDeleteClick={handleDelete}
        buttonMessage={deleting ? "Deleting..." : "Yes, Delete It!"}
        messsage={
          deleteTarget ? (
            <>
              <span className="d-block">
                Delete <span className="fw-semibold">{deleteTarget.id}</span> —{" "}
                {typeLabel(deleteTarget.type)} of{" "}
                <span className="fw-semibold">
                  {capitalizeWords(deleteTarget?.center?.title)}
                </span>{" "}
                worth{" "}
                <span className="fw-semibold">
                  {formatCurrency(deleteTarget.total)}
                </span>
                ?
              </span>
              <span className="d-block small mt-2">
                This frees the {typeLabel(deleteTarget.type).toLowerCase()} slot
                for that day, so a replacement can be submitted.
              </span>
            </>
          ) : null
        }
      />
    </React.Fragment>
  );
};

CashReco.propTypes = {
  centers: PropTypes.array,
  centerAccess: PropTypes.array,
  cashRecos: PropTypes.object,
};

const mapStateToProps = (state) => ({
  centers: state.Center.data,
  centerAccess: state.User?.centerAccess,
  cashRecos: state.Cash.cashRecos,
});

export default connect(mapStateToProps)(CashReco);
