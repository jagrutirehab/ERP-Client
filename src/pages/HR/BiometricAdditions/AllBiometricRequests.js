import { useCallback, useEffect, useState } from "react";
import { CardBody, Spinner, Input, Nav, NavItem, NavLink } from "reactstrap";
import classnames from "classnames";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import DataTable from "react-data-table-component";
import { useSelector } from "react-redux";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import { useCenterOptions } from "../../../Components/Hooks/useCenterOptions";
import {
  getBiometricAdditionRequestsData,
  getUsersByRole,
} from "../../../helpers/backend_helper";
import { BiometricAdditionColumns } from "./Columns/BiometricAdditionColumns";
import BiometricAdditionModal from "./Modals/BiometricAdditionModal";

const tabs = [
  { id: "addition_pending", label: "Pending" },
  { id: "addition_approved", label: "Approved" },
  { id: "addition_rejected", label: "Rejected" },
];

const AllBiometricRequests = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const [activeTab, setActiveTab] = useState("addition_pending");
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [fetching, setFetching] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCenter, setSelectedCenter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [modal, setModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [modalStatus, setModalStatus] = useState("");

  const user = useSelector((state) => state.User);
  const centerOptions = useCenterOptions();
  const selectedCenterOption =
    centerOptions.find((opt) => opt.value === selectedCenter) ||
    centerOptions[0];

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { hasPermission, loading } = usePermissions(token);
  const hasUserPermission = hasPermission(
    "HR",
    "GET_BIOMETRIC_ADDITION_REQUESTS",
    "READ",
  );
  const hasWritePermission = hasPermission(
    "HR",
    "GET_BIOMETRIC_ADDITION_REQUESTS",
    "WRITE",
  );

  useEffect(() => {
    if (!loading && !hasUserPermission) {
      navigate("/unauthorized");
    }
  }, [loading, hasUserPermission, navigate]);

  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     try {
  //       const response = await getUsersByRole();
  //       setUsers(
  //         response?.data?.map((u) => ({
  //           value: u._id,
  //           label: `${u.name} (${u.email})`,
  //         })) || [],
  //       );
  //     } catch (err) {
  //       console.error("Failed to fetch users", err);
  //     }
  //   };
  //   fetchUsers();
  // }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchRequests = useCallback(async () => {
    if (loading) return;
    if (user?.centerAccess !== undefined && !user?.centerAccess?.length) {
      setData([]);
      setPagination({ totalDocs: 0 });
      return;
    }
    setFetching(true);
    try {
      const centers =
        selectedCenter === "ALL" ? user?.centerAccess : [selectedCenter];
      const response = await getBiometricAdditionRequestsData({
        status: activeTab,
        page,
        limit,
        centers,
        ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
      });
      setData(response?.data);
      setPagination(response?.pagination);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setFetching(false);
    }
  }, [
    loading,
    activeTab,
    selectedCenter,
    debouncedSearch,
    page,
    limit,
    user?.centerAccess,
  ]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    if (
      selectedCenter !== "ALL" &&
      user?.centerAccess?.length &&
      !user.centerAccess.includes(selectedCenter)
    ) {
      setSelectedCenter("ALL");
      setPage(1);
    }
  }, [selectedCenter, user?.centerAccess]);

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
      setSearch("");
      setDebouncedSearch("");
      setSelectedCenter("ALL");
      setPage(1);
      // setAssignedUsers({});
    }
  };

  // const handleAssign = (docId, option) => {
  //   setAssignedUsers((prev) => ({ ...prev, [docId]: option }));
  // };

  const handleApprove = (row) => {
    setSelectedRow(row);
    setModalStatus("addition_approved");
    setModal(true);
  };

  const handleReject = (row) => {
    setSelectedRow(row);
    setModalStatus("addition_rejected");
    setModal(true);
  };

  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <div className="content-wrapper">
        <div className="text-center text-md-left">
          <h1 className="display-6 fw-bold text-primary">
            BIOMETRIC ADDITION REQUESTS
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

        <div className="mb-3">
          <div className="d-none d-md-flex gap-3 align-items-center">
            <div style={{ width: "200px" }}>
              <Select
                value={selectedCenterOption}
                onChange={(option) => {
                  setSelectedCenter(option?.value);
                  setPage(1);
                }}
                options={centerOptions}
                placeholder="All Centers"
                classNamePrefix="react-select"
              />
            </div>
            <div style={{ width: "250px" }}>
              <Input
                type="text"
                placeholder="Search by name or ECode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="d-flex d-md-none flex-column gap-2">
            <Select
              value={selectedCenterOption}
              onChange={(option) => {
                setSelectedCenter(option?.value);
                setPage(1);
              }}
              options={centerOptions}
              placeholder="All Centers"
              classNamePrefix="react-select"
            />
            <Input
              type="text"
              placeholder="Search by name or ECode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

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
            columns={BiometricAdditionColumns({
              onApprove: handleApprove,
              onReject: handleReject,
              hasWritePermission,
              status: activeTab,
              // users,
              // assignedUsers,
              // onAssign: handleAssign,
            })}
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

      <BiometricAdditionModal
        isOpen={modal}
        toggle={() => setModal(false)}
        row={selectedRow}
        status={modalStatus}
        // assignedTo={assignedUsers[selectedRow?._id]?.value}
        onSuccess={fetchRequests}
      />
    </CardBody>
  );
};

export default AllBiometricRequests;
