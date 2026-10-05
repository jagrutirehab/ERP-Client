import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  Spinner,
  Button,
  Collapse,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Label,
  Input,
} from "reactstrap";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Server,
  HardDrive,
  Cpu,
  Clock,
  ChevronDown,
  Radio,
  Database,
  RotateCw,
  Eraser,
  Play,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { api } from "../../config";

const CCTV_API_KEY =
  process.env.REACT_APP_CCTV_API_KEY ||
  "48dd6cc2f04685a14c6a7320b87097b23bd9a2979edfa8d0818902a8659313b0";

const REFRESH_MS = 30000;

/**
 * Reserved status palette — fixed, never themed, and never reused for a series.
 * Amber sits below 3:1 against a light surface by design, so every status here
 * ships as tint + icon + text label. Colour never carries the meaning alone.
 */
const STATUS_META = {
  UP: {
    label: "Online",
    color: "#0ca30c",
    ink: "#0a6b0a",
    inkDark: "#5fd35f",
    tint: "rgba(12, 163, 12, 0.12)",
    Icon: CheckCircle2,
  },
  DEGRADED: {
    label: "Degraded",
    color: "#fab219",
    ink: "#8a5d00",
    inkDark: "#fac95e",
    tint: "rgba(250, 178, 25, 0.18)",
    Icon: AlertTriangle,
  },
  DOWN: {
    label: "Offline",
    color: "#d03b3b",
    ink: "#a32020",
    inkDark: "#ef8080",
    tint: "rgba(208, 59, 59, 0.12)",
    Icon: XCircle,
  },
};

const statusOf = (s) => STATUS_META[s] || STATUS_META.DOWN;

/**
 * Remote actions. `key` is all that travels to the server — the real commands
 * live in the agent's own allowlist on the machine. `command` here is shown in
 * the confirm dialog so the operator sees exactly what will run.
 */
const ACTIONS = [
  {
    key: "start_mongodb",
    label: "Start DB",
    Icon: Play,
    command: "sudo systemctl start mongod",
    danger: false,
    blurb: "Starts the local MongoDB service.",
    // Only offered when the database is actually down — a Start button on a
    // running database is just a way to cause an outage by mis-click.
    isVisible: ({ dbDown }) => dbDown,
  },
  {
    key: "restart_services",
    label: "Restart services",
    Icon: RotateCw,
    command: "sudo systemctl restart cctv-client cctv-server cctv-cv",
    danger: true,
    blurb:
      "Restarts the client, API and CV services. Cameras stop recording for roughly 30-60 seconds.",
  },
  {
    key: "clear_syslog",
    label: "Clear syslog",
    Icon: Eraser,
    command: "sudo truncate -s 0 /var/log/syslog",
    danger: false,
    blurb: "Empties /var/log/syslog to reclaim disk space.",
  },
];

const ACTION_BY_KEY = Object.fromEntries(ACTIONS.map((a) => [a.key, a]));

const isActiveCmd = (c) =>
  c && (c.status === "pending" || c.status === "dispatched");

/** "just now" / "4m ago" / "2h 10m ago" / "3d ago" */
const formatAge = (seconds) => {
  if (seconds === null || seconds === undefined) return "never";
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return h > 0 && m % 60 ? `${h}h ${m % 60}m ago` : `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

/** "45m" / "2h 10m" / "3d 4h" — a span, not a point in time. */
const formatDuration = (seconds) => {
  if (!Number.isFinite(Number(seconds))) return "—";
  const s = Math.max(0, Math.round(Number(seconds)));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return m % 60 ? `${h}h ${m % 60}m` : `${h}h`;
  const d = Math.floor(h / 24);
  return h % 24 ? `${d}d ${h % 24}h` : `${d}d`;
};

/** Single ratio against a limit — a meter, not a chart. */
const Meter = ({ icon: Icon, label, value, warnAt = 90 }) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return null;
  }
  const pct = Math.max(0, Math.min(100, Number(value)));
  const over = pct >= warnAt;

  return (
    <div className="ms-machine-meter">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span className="ms-meter-label">
          <Icon size={12} className="me-1" />
          {label}
        </span>
        <span className={`ms-meter-value ${over ? "ms-meter-over" : ""}`}>
          {pct}%
        </span>
      </div>
      <div className="ms-meter-track">
        <div
          className="ms-meter-fill"
          style={{
            width: `${pct}%`,
            background: over ? STATUS_META.DEGRADED.color : undefined,
          }}
        />
      </div>
    </div>
  );
};

/** KPI tile. The count is the hero; the label and icon carry the meaning. */
const StatTile = ({ label, value, meta, muted }) => {
  const Icon = meta?.Icon;
  return (
    <Card className="border-0 shadow-sm rounded-4 h-100 ms-stat-tile">
      <CardBody className="p-3">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <p className="ms-stat-label mb-1">{label}</p>
            <h2
              className="ms-stat-value mb-0"
              style={meta && !muted ? { color: meta.color } : undefined}
            >
              {value}
            </h2>
          </div>
          {Icon ? (
            <span
              className="ms-stat-icon"
              style={{
                background: meta.tint,
                color: meta.color,
              }}
            >
              <Icon size={18} />
            </span>
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
};

const StatusPill = ({ status }) => {
  const meta = statusOf(status);
  const { Icon } = meta;
  return (
    <span
      className="ms-status-pill"
      style={{ background: meta.tint, color: meta.ink }}
      data-status={status}
    >
      <Icon size={13} />
      {meta.label}
    </span>
  );
};

const MachineCard = ({ machine, commands, busyAction, onAction }) => {
  const [open, setOpen] = useState(false);
  const meta = statusOf(machine.status);

  const host = machine.host || {};
  const services = machine.services || {};

  // Unit state of mongod, reported by `systemctl is-active`. Distinct from
  // localDb, which only says whether the app's connection is up.
  // Is the local database down? Prefer the mongod unit state; fall back to the
  // app's own connection when the agent is too old to report the unit.
  const mongod = services.mongod;
  const dbDown =
    mongod?.ok === false ||
    (typeof mongod?.ok !== "boolean" && services.localDb?.ok === false);

  const latest = commands?.[0];
  const activeCmd = isActiveCmd(latest) ? latest : null;
  // Only a live agent can carry out an action — a machine we only infer from
  // synced data has nothing listening for commands.
  const canAct = machine.source === "heartbeat";

  // No camera count is shown. Three sources disagree and none is the whole
  // truth: the CV service knows only the processes it loaded, `cameraconfigs`
  // holds far more than that, and the live-status collection still has rows
  // for cameras removed long ago. A confident-looking ratio built on any of
  // them reads as "all fine" when it is not.

  const visibleActions = ACTIONS.filter(
    (a) => !a.isVisible || a.isVisible({ dbDown }),
  );

  return (
    // `border-0` is omitted deliberately: Bootstrap declares it !important, so
    // it would kill the status accent below.
    <Card
      className="shadow-sm rounded-4 h-100 ms-machine-card"
      style={{
        border: 0,
        borderTop: `3px solid ${meta.color}`,
        borderRadius: "1rem",
      }}
    >
      <CardBody className="p-3">
        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
          <div className="min-w-0">
            <h6 className="ms-machine-id mb-1" title={machine.machineId}>
              {machine.machineId}
            </h6>
            <p className="ms-machine-center mb-0">
              {machine.center?.name || "Unknown centre"}
            </p>
          </div>
          <StatusPill status={machine.status} />
        </div>

        <div className="d-flex align-items-center gap-3 flex-wrap ms-machine-facts">
          <span title="Last heartbeat received">
            <Clock size={12} className="me-1" />
            {formatAge(machine.secondsSinceLastSeen)}
          </span>
          {/* Only surfaced when it is a problem — a healthy database needs no
              chip, the same reason the Start DB button stays hidden. */}
          {dbDown ? (
            <span
              title={`Local MongoDB: ${mongod?.state || services.localDb?.error || "not running"}`}
              style={{ color: STATUS_META.DOWN.ink }}
            >
              <Database size={12} className="me-1" />
              DB {mongod?.state || "down"}
            </span>
          ) : null}
          <span
            title={
              machine.source === "inferred"
                ? "No heartbeat agent — status inferred from synced camera data"
                : "Reported directly by the heartbeat agent"
            }
          >
            <Radio size={12} className="me-1" />
            {machine.source === "inferred" ? "inferred" : "heartbeat"}
          </span>
        </div>

        {machine.reasons?.length ? (
          <ul className="ms-reasons mt-2 mb-0">
            {machine.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        ) : null}

        {/* While a machine is silent the cause genuinely is not knowable from
            here — a power cut and a dead uplink look identical. Saying so beats
            letting someone assume the worst and drive to site. */}
        {machine.causeUnknowable ? (
          <p className="ms-note mb-0 mt-2">
            Power loss and network loss look the same from here. The cause is
            confirmed automatically when it reconnects.
          </p>
        ) : null}

        {machine.lastOutage ? (
          <p className="ms-note mb-0 mt-2" title={machine.lastOutage.causeDetail}>
            Last outage {formatDuration(machine.lastOutage.durationSeconds)} —{" "}
            <strong>{machine.lastOutage.causeLabel}</strong>
            {machine.lastOutage.cause === "network"
              ? " · kept recording locally, nothing lost"
              : ""}
          </p>
        ) : null}

        {host.diskUsedPercent !== undefined ||
        host.memUsedPercent !== undefined ? (
          <div className="d-flex gap-3 mt-3">
            <Meter
              icon={HardDrive}
              label="Disk"
              value={host.diskUsedPercent}
            />
            <Meter icon={Cpu} label="Memory" value={host.memUsedPercent} />
          </div>
        ) : null}

        <div className="ms-actions mt-3">
          {visibleActions.map((a) => {
            const pending = busyAction === a.key || activeCmd?.action === a.key;
            return (
              <button
                key={a.key}
                type="button"
                className={`ms-action-btn ${a.danger ? "ms-action-danger" : ""}`}
                disabled={!canAct || !!activeCmd || !!busyAction}
                onClick={() => onAction(machine, a)}
                title={
                  canAct
                    ? a.command
                    : "No heartbeat agent on this machine — nothing is listening for commands"
                }
              >
                {pending ? (
                  <Loader2 size={12} className="spin-anim" />
                ) : (
                  <a.Icon size={12} />
                )}
                {a.label}
              </button>
            );
          })}
        </div>

        {/* Only in-flight state lives on the card — it is current, and it
            explains why the buttons are disabled. The outcome is a one-off
            event, so it goes to a toast rather than sitting here for good. */}
        {activeCmd ? (
          <p className="ms-cmd-note ms-cmd-pending mb-0 mt-2">
            {ACTION_BY_KEY[activeCmd.action]?.label || activeCmd.action}:{" "}
            {activeCmd.status === "pending"
              ? "queued — the machine collects it on its next heartbeat"
              : "running on the machine…"}
          </p>
        ) : null}

        {machine.lastSeenAt ? (
          <>
            <button
              type="button"
              className="ms-details-toggle mt-2"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
            >
              <ChevronDown
                size={13}
                style={{
                  transform: open ? "rotate(180deg)" : "none",
                  transition: "transform .15s ease",
                }}
              />
              Details
            </button>
            <Collapse isOpen={open}>
              <dl className="ms-details mt-2 mb-0">
                <dt>Host</dt>
                <dd>{host.hostname || "—"}</dd>
                <dt>Platform</dt>
                <dd>{host.platform || "—"}</dd>
                <dt>Node</dt>
                <dd>{host.nodeVersion || "—"}</dd>
                <dt>Uptime</dt>
                <dd>
                  {host.uptimeSeconds
                    ? `${Math.floor(host.uptimeSeconds / 86400)}d`
                    : "—"}
                </dd>
                <dt>CV service</dt>
                <dd>
                  {services.cvService?.ok === true
                    ? "reachable"
                    : services.cvService?.error || "—"}
                </dd>
                <dt>Local DB</dt>
                <dd>
                  {services.localDb?.ok === true
                    ? "connected"
                    : services.localDb?.error || "—"}
                </dd>
                <dt>Agent</dt>
                <dd>v{machine.agentVersion || "—"}</dd>
                <dt>Beats</dt>
                <dd>{machine.heartbeatCount ?? 0}</dd>
              </dl>
            </Collapse>
          </>
        ) : null}
      </CardBody>
    </Card>
  );
};

const MachineStatus = ({ centerId, showHeading = true }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fetchedAt, setFetchedAt] = useState(null);

  // Remote actions
  const [confirm, setConfirm] = useState(null); // { machine, action }
  // Held only for the lifetime of one confirm dialog, never persisted.
  const [sudoPassword, setSudoPassword] = useState("");
  const [busyAction, setBusyAction] = useState(null); // action key mid-POST
  const [commands, setCommands] = useState({}); // machineId -> command list

  const authHeaders = useMemo(
    () => ({ headers: { "x-api-key": CCTV_API_KEY } }),
    [],
  );

  const fetchCommands = useCallback(
    async (machineId) => {
      try {
        const res = await axios.get(
          `${api.CCTV_SERVICE_URL}/machines/${encodeURIComponent(machineId)}/commands?limit=5`,
          authHeaders,
        );
        const payload = res?.data?.commands ? res.data : res;
        setCommands((prev) => ({
          ...prev,
          [machineId]: payload?.commands || [],
        }));
        return payload?.commands || [];
      } catch (err) {
        console.error(err);
        return [];
      }
    },
    [authHeaders],
  );

  /**
   * A queued action is collected on the machine's next heartbeat (up to 30s)
   * and then takes a few seconds to run, so poll faster than the status
   * refresh until it reaches a terminal state — otherwise the operator is
   * staring at "queued" long after it finished.
   */
  const pollCommand = useCallback(
    (machineId, commandId) => {
      let elapsed = 0;
      const step = 4000;

      const timer = setInterval(async () => {
        elapsed += step;
        const list = await fetchCommands(machineId);

        // Match by id rather than taking the newest: the outcome reported must
        // be the one this operator actually triggered.
        const mine = commandId
          ? list.find((c) => String(c._id) === String(commandId))
          : list[0];

        if (mine && !isActiveCmd(mine)) {
          clearInterval(timer);
          const label = ACTION_BY_KEY[mine.action]?.label || mine.action;
          if (mine.status === "succeeded") {
            toast.success(`${label} succeeded on ${machineId}`);
          } else {
            toast.error(
              `${label} ${mine.status} on ${machineId}: ${
                mine.error || mine.note || "no detail reported"
              }`,
              // Failures carry the sudo message worth reading; 5s is not enough.
              { autoClose: 12000 },
            );
          }
          return;
        }

        if (elapsed >= 150000) {
          clearInterval(timer);
          toast.info(
            `Still waiting on ${machineId} — check the card for the result.`,
          );
        }
      }, step);
    },
    [fetchCommands],
  );

  const runAction = useCallback(async () => {
    if (!confirm || !sudoPassword) return;
    const { machine, action } = confirm;
    const password = sudoPassword;

    setConfirm(null);
    // Drop it from React state immediately — it is needed for this one request
    // and nothing else.
    setSudoPassword("");
    setBusyAction(action.key);

    try {
      const res = await axios.post(
        `${api.CCTV_SERVICE_URL}/machines/${encodeURIComponent(machine.machineId)}/command`,
        {
          action: action.key,
          requestedBy: "erp-dashboard",
          sudoPassword: password,
        },
        authHeaders,
      );

      const payload = res?.data?.command ? res.data : res;
      const commandId = payload?.command?._id;

      toast.info(
        `${action.label} queued for ${machine.machineId} — running within ${
          payload?.pickupWithinSeconds ?? 30
        }s`,
      );

      await fetchCommands(machine.machineId);
      pollCommand(machine.machineId, commandId);
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          `Could not queue ${action.label}`,
      );
    } finally {
      setBusyAction(null);
    }
  }, [confirm, sudoPassword, authHeaders, fetchCommands, pollCommand]);

  const closeConfirm = useCallback(() => {
    setConfirm(null);
    setSudoPassword("");
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      setError("");
      const params = {};
      // "ALL" is a UI sentinel, not a centre id — sending it would filter
      // everything out.
      if (centerId && centerId !== "ALL") params.centerId = centerId;

      const res = await axios.get(`${api.CCTV_SERVICE_URL}/machines/status`, {
        params,
        headers: { "x-api-key": CCTV_API_KEY },
      });

      // The ERP axios layer may or may not unwrap `.data` — accept both.
      const payload = res?.data?.machines ? res.data : res;
      setReport(payload?.machines ? payload : null);
      setFetchedAt(new Date());
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load machine status",
      );
    } finally {
      setLoading(false);
    }
  }, [centerId]);

  useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchStatus]);

  // Only machines with a live agent can have commands. Keyed on the id list
  // rather than the report object so the 30s status refresh does not refetch
  // command history every time.
  const agentMachineIds = useMemo(
    () =>
      (report?.machines || [])
        .filter((m) => m.source === "heartbeat")
        .map((m) => m.machineId)
        .sort()
        .join(","),
    [report],
  );

  useEffect(() => {
    if (!agentMachineIds) return;
    agentMachineIds.split(",").forEach((id) => fetchCommands(id));
  }, [agentMachineIds, fetchCommands]);

  const summary = report?.summary;

  const machines = useMemo(() => {
    const list = report?.machines || [];
    // Worst first — an offline site should never be below the healthy ones.
    const rank = { DOWN: 0, DEGRADED: 1, UP: 2 };
    return [...list].sort(
      (a, b) =>
        (rank[a.status] ?? 3) - (rank[b.status] ?? 3) ||
        a.machineId.localeCompare(b.machineId),
    );
  }, [report]);

  const allClear = summary && summary.down === 0 && summary.degraded === 0;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        {/* Suppressed when the host page already carries the title — two
            headings saying the same thing is just noise. The refresh control
            and the "updated" stamp stay either way. */}
        {showHeading ? (
          <div>
            <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              <Server size={19} className="text-primary" />
              CCTV System Health
            </h5>
            <p className="text-muted mb-0 small">
              Live status of every monitoring machine
              {fetchedAt ? (
                <span className="ms-1">
                  · updated {fetchedAt.toLocaleTimeString()}
                </span>
              ) : null}
            </p>
          </div>
        ) : (
          <p className="text-muted mb-0 small">
            {fetchedAt ? `Updated ${fetchedAt.toLocaleTimeString()}` : " "}
          </p>
        )}
        <Button
          color="light"
          size="sm"
          onClick={fetchStatus}
          disabled={loading}
          className="d-flex align-items-center gap-2"
        >
          <RefreshCw size={15} className={loading ? "spin-anim" : ""} />
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="alert alert-danger rounded-3 d-flex align-items-center gap-2">
          <XCircle size={16} />
          {error}
        </div>
      ) : null}

      {loading && !report ? (
        <div className="d-flex justify-content-center py-4">
          <Spinner color="primary" />
        </div>
      ) : (
        <>
          {summary ? (
            <Row className="g-3 mb-3">
              <Col xl={3} md={6}>
                <StatTile label="Total sites" value={summary.total} muted />
              </Col>
              <Col xl={3} md={6}>
                <StatTile
                  label="Online"
                  value={summary.up}
                  meta={STATUS_META.UP}
                />
              </Col>
              <Col xl={3} md={6}>
                <StatTile
                  label="Degraded"
                  value={summary.degraded}
                  meta={STATUS_META.DEGRADED}
                />
              </Col>
              <Col xl={3} md={6}>
                <StatTile
                  label="Offline"
                  value={summary.down}
                  meta={STATUS_META.DOWN}
                />
              </Col>
            </Row>
          ) : null}

          {allClear ? (
            <div className="ms-allclear mb-3">
              <CheckCircle2 size={15} />
              All {summary.total} monitoring machines are online.
            </div>
          ) : null}

          {machines.length ? (
            <Row className="g-3">
              {machines.map((m) => (
                <Col xxl={3} lg={4} md={6} key={m.machineId}>
                  <MachineCard
                    machine={m}
                    commands={commands[m.machineId]}
                    busyAction={busyAction}
                    onAction={(machine, action) =>
                      setConfirm({ machine, action })
                    }
                  />
                </Col>
              ))}
            </Row>
          ) : (
            !error && (
              <Card className="border-0 shadow-sm rounded-4">
                <CardBody className="text-center text-muted py-4">
                  <Database size={22} className="mb-2 d-block mx-auto" />
                  No monitoring machines are registered yet.
                  <div className="small mt-1">
                    Set <code>ERP_SERVICE_URL</code> and{" "}
                    <code>ERP_API_KEY</code> on a machine, or list it in{" "}
                    <code>EXPECTED_MACHINE_IDS</code>.
                  </div>
                </CardBody>
              </Card>
            )
          )}
        </>
      )}

      <Modal isOpen={!!confirm} toggle={closeConfirm} centered>
        <ModalHeader toggle={closeConfirm}>
          {confirm?.action.label} on {confirm?.machine.machineId}?
        </ModalHeader>
        <ModalBody>
          <p className="mb-2">{confirm?.action.blurb}</p>
          <p className="text-muted small mb-2">
            Runs on <strong>{confirm?.machine.center?.name}</strong> (
            {confirm?.machine.machineId}):
          </p>
          {/* Show the literal command. An operator restarting a live centre's
              cameras should see exactly what is about to run. */}
          <pre className="ms-cmd-preview mb-3">{confirm?.action.command}</pre>

          <Label className="small fw-semibold mb-1" for="ms-sudo-pass">
            Sudo password for this machine
          </Label>
          <Input
            id="ms-sudo-pass"
            type="password"
            autoComplete="off"
            autoFocus
            value={sudoPassword}
            onChange={(e) => setSudoPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && sudoPassword) runAction();
            }}
            placeholder="Required"
          />
          <p className="text-muted mt-2 mb-0" style={{ fontSize: ".72rem" }}>
            Used once for this command, encrypted while it waits, and erased the
            moment the machine collects it. It is never stored in the database
            or shown anywhere.
          </p>

          <p className="text-muted small mb-0 mt-2">
            The machine collects this on its next heartbeat — up to{" "}
            {report?.thresholds?.heartbeatIntervalSeconds ?? 30}s. If it is not
            collected within 10 minutes it expires instead of running late.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={closeConfirm}>
            Cancel
          </Button>
          <Button
            color={confirm?.action.danger ? "danger" : "primary"}
            onClick={runAction}
            disabled={!sudoPassword}
          >
            {confirm?.action.danger ? "Yes, restart" : `Yes, ${confirm?.action.label.toLowerCase()}`}
          </Button>
        </ModalFooter>
      </Modal>

      <style>{`
        .ms-stat-label {
          font-size: .75rem; text-transform: uppercase; letter-spacing: .04em;
          color: var(--vz-text-muted, #878a99); margin: 0; font-weight: 600;
        }
        .ms-stat-value { font-size: 1.9rem; font-weight: 700; line-height: 1.1; color: var(--vz-body-color, #212529); }
        .ms-stat-icon {
          width: 34px; height: 34px; border-radius: 10px;
          display: inline-flex; align-items: center; justify-content: center; flex: 0 0 auto;
        }
        .ms-status-pill {
          display: inline-flex; align-items: center; gap: 4px; flex: 0 0 auto;
          padding: 3px 9px; border-radius: 999px;
          font-size: .72rem; font-weight: 700; letter-spacing: .02em; white-space: nowrap;
        }
        .ms-machine-card { transition: box-shadow .15s ease, transform .15s ease; }
        .ms-machine-card:hover { transform: translateY(-2px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.09) !important; }
        .ms-machine-id {
          font-size: .9rem; font-weight: 700; color: var(--vz-body-color, #212529);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .ms-machine-center { font-size: .78rem; color: var(--vz-text-muted, #878a99); }
        .ms-machine-facts { font-size: .74rem; color: var(--vz-text-muted, #878a99); }
        .ms-machine-facts span { display: inline-flex; align-items: center; white-space: nowrap; }
        .ms-reasons {
          list-style: none; padding: 0; font-size: .74rem;
          color: var(--vz-body-color, #212529);
        }
        .ms-reasons li { position: relative; padding-left: 11px; margin-top: 3px; line-height: 1.35; }
        .ms-reasons li::before {
          content: ""; position: absolute; left: 0; top: .45em;
          width: 4px; height: 4px; border-radius: 50%; background: currentColor; opacity: .45;
        }
        .ms-machine-meter { flex: 1 1 0; min-width: 0; }
        .ms-meter-label, .ms-meter-value {
          font-size: .68rem; color: var(--vz-text-muted, #878a99); font-weight: 600;
          display: inline-flex; align-items: center;
        }
        .ms-meter-over { color: #8a5d00; }
        .ms-meter-track {
          height: 4px; border-radius: 999px; overflow: hidden;
          background: var(--vz-light, #f3f6f9);
        }
        .ms-meter-fill { height: 100%; border-radius: 999px; background: var(--vz-primary, #405189); }
        .ms-details-toggle {
          background: none; border: 0; padding: 0; display: inline-flex; align-items: center; gap: 3px;
          font-size: .72rem; font-weight: 600; color: var(--vz-text-muted, #878a99);
        }
        .ms-details-toggle:hover { color: var(--vz-primary, #405189); }
        .ms-details {
          display: grid; grid-template-columns: auto 1fr; gap: 2px 10px;
          font-size: .72rem; margin: 0;
        }
        .ms-details dt { color: var(--vz-text-muted, #878a99); font-weight: 600; }
        .ms-details dd { margin: 0; color: var(--vz-body-color, #212529); overflow-wrap: anywhere; }
        .ms-allclear {
          display: flex; align-items: center; gap: 7px;
          padding: 8px 13px; border-radius: 10px; font-size: .8rem; font-weight: 600;
          background: rgba(12,163,12,.10); color: #0a6b0a;
        }
        .ms-note {
          font-size: .7rem; line-height: 1.4; color: var(--vz-text-muted, #878a99);
          font-style: italic;
        }
        .ms-note strong { font-style: normal; color: var(--vz-body-color, #212529); }
        .ms-actions { display: flex; flex-wrap: wrap; gap: 6px; }
        .ms-action-btn {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 4px 9px; border-radius: 7px; font-size: .71rem; font-weight: 600;
          border: 1px solid var(--vz-border-color, #e9ebec);
          background: var(--vz-light, #f3f6f9); color: var(--vz-body-color, #212529);
          transition: background .12s ease, border-color .12s ease;
        }
        .ms-action-btn:hover:not(:disabled) {
          background: var(--vz-primary, #405189); border-color: var(--vz-primary, #405189); color: #fff;
        }
        .ms-action-danger:hover:not(:disabled) {
          background: ${STATUS_META.DOWN.color}; border-color: ${STATUS_META.DOWN.color}; color: #fff;
        }
        .ms-action-btn:disabled { opacity: .45; cursor: not-allowed; }
        .ms-cmd-note { font-size: .71rem; font-weight: 600; line-height: 1.35; }
        .ms-cmd-pending { color: ${STATUS_META.DEGRADED.ink}; }
        .ms-cmd-preview {
          background: var(--vz-light, #f3f6f9); border-radius: 7px; padding: 9px 11px;
          font-size: .78rem; white-space: pre-wrap; word-break: break-all; margin: 0;
          color: var(--vz-body-color, #212529);
        }
        .spin-anim { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        body[data-layout-mode="dark"] .ms-status-pill[data-status="UP"] { color: ${STATUS_META.UP.inkDark}; }
        body[data-layout-mode="dark"] .ms-status-pill[data-status="DEGRADED"] { color: ${STATUS_META.DEGRADED.inkDark}; }
        body[data-layout-mode="dark"] .ms-status-pill[data-status="DOWN"] { color: ${STATUS_META.DOWN.inkDark}; }
        body[data-layout-mode="dark"] .ms-allclear { color: ${STATUS_META.UP.inkDark}; }
        body[data-layout-mode="dark"] .ms-meter-over { color: ${STATUS_META.DEGRADED.inkDark}; }
        body[data-layout-mode="dark"] .ms-cmd-pending { color: ${STATUS_META.DEGRADED.inkDark}; }
      `}</style>
    </>
  );
};

export default MachineStatus;
