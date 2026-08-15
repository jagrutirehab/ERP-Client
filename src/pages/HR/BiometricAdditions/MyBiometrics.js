import { useCallback, useEffect, useState } from "react";
import { CardBody, Spinner, Nav, NavItem, NavLink } from "reactstrap";
import classnames from "classnames";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { Check } from "lucide-react";
import { Button } from "reactstrap";
import Select from "react-select";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import {
  getMyAssignedBiometricsData,
  updateAssigneeStatusData,
} from "../../../helpers/backend_helper";
import { renderStatusBadge } from "../../../Components/Common/renderStatusBadge";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import { toast } from "react-toastify";

const UpdateStatusOptions = [
  { value: "HOLD", label: "Hold" },
  { value: "WIP", label: "Work In Progress" },
  { value: "CLOSED", label: "Closed" },
  { value: "NOT_STARTED_WORKING_YET", label: "Not Started Working" },
];

const tabs = [
  { id: "ALL", label: "All" },
  { id: "HOLD", label: "Hold" },
  { id: "WIP", label: "Work In Progress" },
  { id: "CLOSED", label: "Closed" },
  { id: "NOT_STARTED_WORKING_YET", label: "Not Started" },
];

const MyBiometrics = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const [activeTab, setActiveTab] = useState("ALL");
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [fetching, setFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [updatingRows, setUpdatingRows] = useState({});

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { hasPermission, loading } = usePermissions(token);
  const hasUserPermission = hasPermission(
    "HR",
    "GET_MY_BIOMETRIC_REQUESTS",
    "READ",
  );
  const hasWritePermission = hasPermission(
    "HR",
    "GET_MY_BIOMETRIC_REQUESTS",
    "WRITE",
  );

  useEffect(() => {
    if (!loading && !hasUserPermission) {
      navigate("/unauthorized");
    }
  }, [loading, hasUserPermission, navigate]);

  const fetchRequests = useCallback(async () => {
    if (loading) return;
    setFetching(true);
    try {
      const response = await getMyAssignedBiometricsData({
        page,
        limit,
        ...(activeTab !== "ALL" && { assigneeStatus: activeTab }),
      });
      setData(response?.data);
      setPagination(response?.pagination);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setFetching(false);
    }
  }, [loading, activeTab, page, limit]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner color="primary" />
      </div>
    );
  }

  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      setPage(1);
      setSelectedStatuses({});
    }
  };

  const handleStatusSelect = (docId, option) => {
    setSelectedStatuses((prev) => ({ ...prev, [docId]: option }));
  };

  const handleAssigneeAction = async (row) => {
    setUpdatingRows((prev) => ({ ...prev, [row._id]: true }));
    try {
      await updateAssigneeStatusData({
        doc_id: row._id,
        assigneeStatus: selectedStatuses[row._id]?.value,
      });
      toast.success("Status updated successfully");
      setSelectedStatuses((prev) => {
        const updated = { ...prev };
        delete updated[row._id];
        return updated;
      });
      fetchRequests();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update status",
      );
    } finally {
      setUpdatingRows((prev) => ({ ...prev, [row._id]: false }));
    }
  };
  const columns = (updatingRows, hasWritePermission) => [
    {
      name: "ECode",
      selector: (row) => row?.employee?.eCode || "-",
      sortable: true,
      minWidth: "120px",
      wrap: true,
    },
    {
      name: "Name",
      selector: (row) => row?.employee?.name || "-",
      sortable: true,
      minWidth: "150px",
      wrap: true,
    },
    {
      name: "Center",
      selector: (row) => row?.employee?.currentLocation?.title || "-",
      sortable: true,
      minWidth: "150px",
      wrap: true,
    },
    {
      name: "Department",
      selector: (row) => row?.employee?.department?.department || "-",
      sortable: true,
      minWidth: "150px",
      wrap: true,
    },
    {
      name: "Designation",
      selector: (row) => row?.employee?.designation?.name || "-",
      sortable: true,
      minWidth: "150px",
      wrap: true,
    },
    {
      name: "Biometric ID",
      selector: (row) => row?.biometricId || "-",
      sortable: true,
      minWidth: "130px",
      wrap: true,
    },
    {
      name: "Shifts",
      selector: (row) => row?.shifts?.length || 0,
      sortable: true,
      minWidth: "100px",
      wrap: true,
      cell: (row) =>
        row?.shifts?.length ? (
          <span>{row.shifts.map((s) => s.shift).join(", ")}</span>
        ) : (
          "-"
        ),
    },
    {
      name: "Assignee Status",
      selector: (row) => row?.assigneeStatus || "-",
      sortable: true,
      minWidth: "150px",
      wrap: true,
      cell: (row) => renderStatusBadge(row?.assigneeStatus || "-"),
    },
    ...(hasWritePermission
      ? [
          {
            name: "Update Status",
            minWidth: "250px",
            cell: (row) => (
              <div className="d-flex gap-2 align-items-center">
                <div style={{ width: "180px" }}>
                  <Select
                    placeholder="Select status..."
                    options={UpdateStatusOptions}
                    value={selectedStatuses[row._id] || null}
                    onChange={(option) => handleStatusSelect(row._id, option)}
                    classNamePrefix="react-select"
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                  />
                </div>
                <Button
                  color="success"
                  size="sm"
                  title="Update"
                  disabled={!selectedStatuses[row._id] || updatingRows[row._id]}
                  onClick={() => handleAssigneeAction(row)}
                  style={{
                    width: "32px",
                    height: "32px",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    opacity: !selectedStatuses[row._id] ? 0.5 : 1,
                  }}
                >
                  {updatingRows[row._id] ? (
                    <Spinner size="sm" />
                  ) : (
                    <Check size={16} strokeWidth={2.5} />
                  )}
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <div className="content-wrapper">
        <div className="text-center text-md-left">
          <h1 className="display-6 fw-bold text-primary">
            MY BIOMETRIC ASSIGNMENTS
          </h1>
        </div>

        <Nav tabs className="mb-3">
          {tabs.map((tab) => (
            <NavItem key={tab.id}>
              <NavLink
                className={classnames({ active: activeTab === tab.id })}
                onClick={() => toggle(tab.id)}
                style={{ cursor: "pointer", fontWeight: 500 }}
              >
                {tab.label}
              </NavLink>
            </NavItem>
          ))}
        </Nav>

        <p className="text-muted mb-2">
          Total Records: <strong>{pagination?.totalDocs || 0}</strong>
        </p>

        {fetching ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "400px" }}
          >
            <Spinner color="primary" />
          </div>
        ) : (
          <DataTable
            columns={columns(updatingRows, hasWritePermission)}
            data={Array.isArray(data) ? data : []}
            pagination
            paginationServer
            paginationTotalRows={pagination?.totalDocs}
            paginationPerPage={limit}
            paginationDefaultPage={page}
            onChangePage={setPage}
            onChangeRowsPerPage={setLimit}
            highlightOnHover
            striped
            fixedHeader
            fixedHeaderScrollHeight="500px"
            dense={isMobile}
            responsive
          />
        )}
      </div>
    </CardBody>
  );
};

export default MyBiometrics;
