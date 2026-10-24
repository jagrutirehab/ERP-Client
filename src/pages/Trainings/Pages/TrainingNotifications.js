import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  Input,
  Nav,
  NavItem,
  NavLink,
  Spinner,
  TabContent,
  TabPane,
} from "reactstrap";
import classnames from "classnames";
import { toast } from "react-toastify";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import {
  getAssignedTrainingNotifications,
  getCompletionTrainingDetail,
  getCompletionTrainingList,
} from "../../../helpers/backend_helper";
import CenterSelect from "../Components/CenterSelect";
import { StatusBadge } from "../Components/AllTrainings/StageStatus";
import { useCenterFilter } from "../Helpers/centerFilter";
import { formatDate, formatDateTime } from "../Helpers/adminTrainingHelpers";

const PAGE_SIZE = 20;

const AssignedList = () => {
  const token = JSON.parse(localStorage.getItem("micrologin") || "null")?.token;
  const { hasPermission } = usePermissions(token);
  const canOpen = hasPermission("TRAININGS", null, "READ");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getAssignedTrainingNotifications();
        setRows(response?.data?.rows || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load assigned trainings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner color="primary" />
      </div>
    );
  }

  if (rows.length === 0) {
    return <p className="text-muted">No trainings are assigned to you.</p>;
  }

  return rows.map((row) => (
    <Card key={row.trainingId} className="mb-2">
      <CardBody className="d-flex align-items-center justify-content-between flex-wrap gap-2 p-3">
        <div>
          <h6 className="mb-1">{row.trainingName}</h6>
          <div className="text-muted fs-12">Assigned on {formatDate(row.assignedAt)}</div>
        </div>
        <div className="d-flex align-items-center gap-3">
          <StatusBadge status={row.status} label={row.statusLabel} />
          {canOpen && (
            <Link to={`/trainings/${row.trainingId}`} className="btn btn-sm btn-outline-primary">
              Open
            </Link>
          )}
        </div>
      </CardBody>
    </Card>
  ));
};

const TrainingCompletionCard = ({ training, cntrs, refreshTick, onCounts }) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("completed");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [tab, cntrs, appliedSearch]);

  useEffect(() => {
    if (!open) return undefined;
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const response = await getCompletionTrainingDetail(training.trainingId, {
          tab,
          cntrs,
          search: appliedSearch,
          page,
          limit: PAGE_SIZE,
        });
        if (active) setData(response?.data || null);
      } catch (error) {
        if (active) toast.error(error?.response?.data?.message || "Failed to load training details");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [open, tab, cntrs, appliedSearch, page, training.trainingId, refreshTick]);

  const counts = data?.counts || { completed: training.completed, pending: training.pending };
  const rows = data?.rows || [];
  const totalPages = data?.pagination?.totalPages || 1;

  useEffect(() => {
    if (data?.counts) onCounts(training.trainingId, data.counts);
  }, [data, onCounts, training.trainingId]);

  const renderRows = () => {
    if (loading && !data) {
      return (
        <div className="text-center py-4">
          <Spinner color="primary" />
        </div>
      );
    }
    if (rows.length === 0) return <p className="text-muted mb-0">No records.</p>;
    return (
      <div className="table-responsive">
        <table className="table table-sm align-middle mb-0">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Center</th>
              <th>Position</th>
              <th>Status</th>
              <th>{tab === "completed" ? "Completed on" : "Last activity"}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.employeeId}>
                <td>
                  <div className="fw-semibold">{row.name}</div>
                  <div className="text-muted fs-12">{row.eCode}</div>
                </td>
                <td>{row.center}</td>
                <td>{row.position}</td>
                <td>
                  <StatusBadge status={row.status} label={row.label} />
                  {row.stage && <div className="text-muted fs-11 mt-1">{row.stage}</div>}
                </td>
                <td>
                  {formatDateTime(tab === "completed" ? row.acknowledgedOn : row.lastActivityAt) || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Card className="mb-2">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        className="d-flex align-items-center justify-content-between flex-wrap gap-2 p-3"
        style={{ cursor: "pointer" }}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setOpen(!open);
          }
        }}
      >
        <h6 className="mb-0">{training.trainingName}</h6>
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-success-subtle text-success">Completed {counts.completed}</span>
          <span className="badge bg-warning-subtle text-warning">Pending {counts.pending}</span>
          <i className={open ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} />
        </div>
      </div>

      {open && (
        <CardBody className="border-top">
          <div className="d-flex align-items-center flex-wrap gap-2 mb-3">
            <Input
              style={{ maxWidth: 260 }}
              placeholder="Search employee or code"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setAppliedSearch(search.trim());
              }}
            />
            <Button color="primary" outline size="sm" onClick={() => setAppliedSearch(search.trim())}>
              Search
            </Button>
          </div>

          <Nav className="nav-tabs mb-3">
            <NavItem>
              <NavLink
                href="#"
                className={classnames({ active: tab === "completed" })}
                onClick={(e) => {
                  e.preventDefault();
                  setTab("completed");
                }}
              >
                Completed ({counts.completed})
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                href="#"
                className={classnames({ active: tab === "pending" })}
                onClick={(e) => {
                  e.preventDefault();
                  setTab("pending");
                }}
              >
                Pending ({counts.pending})
              </NavLink>
            </NavItem>
          </Nav>

          <TabContent activeTab={tab}>
            <TabPane tabId="completed">{tab === "completed" && renderRows()}</TabPane>
            <TabPane tabId="pending">{tab === "pending" && renderRows()}</TabPane>
          </TabContent>

          {totalPages > 1 && (
            <div className="d-flex align-items-center justify-content-end gap-2 mt-3">
              <Button size="sm" outline disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span className="text-muted fs-12">
                Page {page} of {totalPages}
              </span>
              <Button size="sm" outline disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          )}
        </CardBody>
      )}
    </Card>
  );
};

const CompletionList = () => {
  const { options, value, cntrs, onChange } = useCenterFilter();
  const lastCompletion = useSelector((state) => state.TrainingNotification?.lastCompletion);
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [nameSearch, setNameSearch] = useState("");
  const [liveCounts, setLiveCounts] = useState({});

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await getCompletionTrainingList({ cntrs });
        if (!active) return;
        setTrainings(response?.data?.trainings || []);
        setLiveCounts({});
      } catch (error) {
        if (!active) return;
        if (error?.response?.status === 403) setForbidden(true);
        else toast.error(error?.response?.data?.message || "Failed to load trainings");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [cntrs, lastCompletion?.tick]);

  const handleCounts = useCallback(
    (trainingId, counts) => setLiveCounts((previous) => ({ ...previous, [trainingId]: counts })),
    [],
  );

  if (forbidden) {
    return <p className="text-muted">You do not have access to training completion.</p>;
  }

  const needle = nameSearch.trim().toLowerCase();
  const visible = trainings.filter((training) =>
    String(training.trainingName || "").toLowerCase().includes(needle),
  );

  return (
    <>
      <div className="d-flex align-items-center flex-wrap gap-2 mb-3">
        <CenterSelect options={options} value={value} onChange={onChange} />
        <Input
          style={{ maxWidth: 260 }}
          placeholder="Search trainings"
          value={nameSearch}
          onChange={(e) => setNameSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner color="primary" />
        </div>
      ) : visible.length === 0 ? (
        <p className="text-muted">No trainings found.</p>
      ) : (
        visible.map((training) => (
          <TrainingCompletionCard
            key={training.trainingId}
            training={{ ...training, ...(liveCounts[training.trainingId] || {}) }}
            cntrs={cntrs}
            refreshTick={lastCompletion?.trainingId === training.trainingId ? lastCompletion.tick : 0}
            onCounts={handleCounts}
          />
        ))
      )}
    </>
  );
};

const TrainingNotifications = () => {
  const [params] = useSearchParams();
  const type = params.get("type") === "completion" ? "completion" : "trainings";

  return (
    <div className="page-content">
      <h5 className="display-6 mb-3">
        {type === "completion" ? "Training Completion" : "Assigned Trainings"}
      </h5>
      {type === "completion" ? <CompletionList /> : <AssignedList />}
    </div>
  );
};

export default TrainingNotifications;
