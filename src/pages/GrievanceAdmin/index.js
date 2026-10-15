/**
 * Grievance queue — the staff side of the public form at /grievance.
 *
 * Sorted by DUE DATE, not by newest first. Rule 5(9) gives 30 days from
 * receipt, so the grievance that matters most is the one closest to breaching
 * that, which a newest-first list buries. The overdue count is shown as a tab
 * for the same reason: it is the number that would be asked for in an audit.
 */

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../../Components/Hooks/useRoles";
import {
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  Row,
  Spinner,
  Table,
} from "reactstrap";
import { toast } from "react-toastify";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "";

const STATUS_COLOR = {
  RECEIVED: "info",
  IN_PROGRESS: "warning",
  RESOLVED: "success",
  CLOSED: "secondary",
};

const TABS = [
  { key: "", label: "All", countKey: "all" },
  { key: "RECEIVED", label: "New", countKey: "received" },
  { key: "IN_PROGRESS", label: "In progress", countKey: "inProgress" },
  { key: "RESOLVED", label: "Resolved", countKey: "resolved" },
  { key: "overdue", label: "Overdue", countKey: "overdue" },
];

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

/** Days until due — negative means already past the statutory window. */
const daysLeft = (dueAt) =>
  Math.ceil((new Date(dueAt).getTime() - Date.now()) / 86400000);

const DueCell = ({ row }) => {
  const settled = row.status === "RESOLVED" || row.status === "CLOSED";
  if (settled) return <span className="text-muted">{fmt(row.dueAt)}</span>;

  const left = daysLeft(row.dueAt);
  const tone = left < 0 ? "danger" : left <= 7 ? "warning" : "muted";

  return (
    <div>
      <div className={tone === "muted" ? "" : `text-${tone} fw-semibold`}>
        {fmt(row.dueAt)}
      </div>
      <div className={`fs-11 text-${tone}`}>
        {left < 0
          ? `${Math.abs(left)} day${Math.abs(left) === 1 ? "" : "s"} overdue`
          : `${left} day${left === 1 ? "" : "s"} left`}
      </div>
    </div>
  );
};

const GrievanceAdmin = () => {
  const navigate = useNavigate();

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { loading: permissionLoader, hasPermission } = usePermissions(token);

  // READ opens the queue; WRITE is what lets someone change a status or record
  // the action taken. A role with READ alone can see that a grievance exists
  // and is approaching its 30-day deadline — which is the point of the queue —
  // without being able to close it.
  const canRead = hasPermission("GRIEVANCE", null, "READ");
  const canWrite = hasPermission("GRIEVANCE", null, "WRITE");

  const [tab, setTab] = useState("");
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState({ status: "", resolution: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!canRead) return;
    setLoading(true);
    try {
      const params = tab === "overdue" ? { overdue: true } : tab ? { status: tab } : {};
      const { data } = await axios.get(`${API_BASE}/grievance`, { params });
      setRows(data?.payload || []);
      setMeta(data?.meta || null);
    } catch {
      toast.error("Could not load grievances");
    } finally {
      setLoading(false);
    }
  }, [tab, canRead]);

  useEffect(() => {
    load();
  }, [load]);

  if (permissionLoader) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner color="primary" />
      </div>
    );
  }

  if (!canRead) {
    navigate("/unauthorized");
    return null;
  }

  const open = (row) => {
    setSelected(row);
    setDraft({ status: row.status, resolution: row.resolution || "" });
  };

  const save = async () => {
    setSaving(true);
    try {
      await axios.patch(`${API_BASE}/grievance/${selected._id}`, draft);
      toast.success("Grievance updated");
      setSelected(null);
      load();
    } catch (err) {
      // The server refuses a close with no resolution recorded — surface that
      // message rather than a generic failure, because it is actionable.
      toast.error(err?.response?.data?.message || "Could not update grievance");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <h4 className="mb-1">Grievances</h4>
        <p className="text-muted">
          Raised through the public form. Each must be responded to within 30
          days of receipt (SPDI Rule 5(9)).
        </p>

        {meta?.counts?.overdue > 0 && (
          <div className="alert alert-danger">
            <strong>{meta.counts.overdue}</strong> grievance
            {meta.counts.overdue === 1 ? " is" : "s are"} past the 30-day
            statutory window.
          </div>
        )}

        <Nav tabs className="mb-3">
          {TABS.map((t) => (
            <NavItem key={t.key || "all"}>
              <NavLink
                href="#"
                active={tab === t.key}
                onClick={(e) => {
                  e.preventDefault();
                  setTab(t.key);
                }}
              >
                {t.label}{" "}
                <Badge color={t.key === "overdue" ? "danger" : "light"} pill>
                  {meta?.counts?.[t.countKey] ?? 0}
                </Badge>
              </NavLink>
            </NavItem>
          ))}
        </Nav>

        <Card>
          <CardBody className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <Spinner />
              </div>
            ) : rows.length === 0 ? (
              <div className="text-center text-muted py-5">
                No grievances in this view.
              </div>
            ) : (
              <Table hover responsive className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Receipt</th>
                    <th>Received</th>
                    <th>From</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Due</th>
                    <th>Assigned</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r._id}>
                      <td className="font-monospace fs-12">{r.receiptNumber}</td>
                      <td className="fs-13">{fmt(r.receivedAt)}</td>
                      <td>
                        <div>{r.name}</div>
                        <div className="text-muted fs-11">{r.email}</div>
                      </td>
                      <td style={{ maxWidth: 260 }}>{r.subject}</td>
                      <td>
                        <Badge color={STATUS_COLOR[r.status] || "secondary"}>
                          {r.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="fs-13">
                        <DueCell row={r} />
                      </td>
                      <td className="fs-13">{r.assignedTo?.name || "—"}</td>
                      <td className="text-end">
                        <Button
                          size="sm"
                          color="light"
                          onClick={() => open(r)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </CardBody>
        </Card>
      </Container>

      <Modal isOpen={!!selected} toggle={() => setSelected(null)} size="lg">
        <ModalHeader toggle={() => setSelected(null)}>
          {selected?.receiptNumber}
        </ModalHeader>
        {selected && (
          <ModalBody>
            <Row className="gy-2 mb-3">
              <Col sm={3} className="text-muted">From</Col>
              <Col sm={9}>
                {selected.name}
                {selected.relationToPatient
                  ? ` (${selected.relationToPatient})`
                  : ""}
              </Col>

              <Col sm={3} className="text-muted">Contact</Col>
              <Col sm={9}>
                <a href={`mailto:${selected.email}`}>{selected.email}</a>
                {" · "}
                <a href={`tel:${selected.phone}`}>{selected.phone}</a>
              </Col>

              <Col sm={3} className="text-muted">Received</Col>
              <Col sm={9}>{fmt(selected.receivedAt)}</Col>

              <Col sm={3} className="text-muted">Due</Col>
              <Col sm={9}>
                <DueCell row={selected} />
              </Col>

              <Col sm={3} className="text-muted">Subject</Col>
              <Col sm={9}>{selected.subject}</Col>
            </Row>

            <Label className="text-muted">What happened</Label>
            <div className="border rounded p-3 mb-4" style={{ whiteSpace: "pre-wrap" }}>
              {selected.description}
            </div>

            {!canWrite && (
              <div className="alert alert-light border mb-3 fs-13">
                You have read-only access to grievances. Ask an administrator for
                write access to change the status or record an action.
              </div>
            )}

            <Row className="gy-3">
              <Col md={5}>
                <Label htmlFor="g-status">Status</Label>
                <Input
                  id="g-status"
                  type="select"
                  disabled={!canWrite}
                  value={draft.status}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, status: e.target.value }))
                  }
                >
                  <option value="RECEIVED">Received</option>
                  <option value="IN_PROGRESS">In progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </Input>
              </Col>
              <Col md={12}>
                <Label htmlFor="g-resolution">
                  What was done to resolve it
                </Label>
                <Input
                  id="g-resolution"
                  type="textarea"
                  rows={4}
                  disabled={!canWrite}
                  value={draft.resolution}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, resolution: e.target.value }))
                  }
                />
                <div className="form-text">
                  Required before a grievance can be marked resolved or closed.
                  This is the record an audit asks for.
                </div>
              </Col>
            </Row>
          </ModalBody>
        )}
        <ModalFooter>
          <Button color="light" onClick={() => setSelected(null)}>
            {canWrite ? "Cancel" : "Close"}
          </Button>
          {canWrite && (
            <Button color="primary" onClick={save} disabled={saving}>
              {saving ? <Spinner size="sm" /> : "Save"}
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default GrievanceAdmin;
