import { useCallback, useEffect, useState } from "react";
import {
  CardBody,
  Nav,
  NavItem,
  NavLink,
  Spinner,
  TabContent,
  TabPane,
  Input,
} from "reactstrap";
import classnames from "classnames";
import { useNavigate, useSearchParams } from "react-router-dom";
import Select from "react-select";
import { useMediaQuery } from "../../../../Components/Hooks/useMediaQuery";
import { usePermissions } from "../../../../Components/Hooks/useRoles";
import { useCenterOptions } from "../../../../Components/Hooks/useCenterOptions";
import ApprovalHistory from "./Views/ApprovalHistory";
import PendingApprovals from "./Views/PendingApprovals";
import RejectedApprovals from "./Views/RejectedApprovals";
import { getBiometricEmployeesData } from "../../../../helpers/backend_helper";
import { useSelector } from "react-redux";

const Biometric = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "PENDING",
  );
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [fetching, setFetching] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCenter, setSelectedCenter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

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
    "NEW_JOINING_BIOMETRIC",
    "READ",
  );
  const hasWritePermission = hasPermission(
    "HR",
    "NEW_JOINING_BIOMETRIC",
    "WRITE",
  );

  useEffect(() => {
    if (!loading && !hasUserPermission) {
      navigate("/unauthorized");
    }
  }, [loading, hasUserPermission, navigate]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchRequests = useCallback(async () => {
    if (loading) return;
    setFetching(true);
    try {
      const centers =
        selectedCenter === "ALL" ? user?.centerAccess : [selectedCenter];

      const response = await getBiometricEmployeesData({
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
    activeTab,
    loading,
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
    }
  };

  const tabs = [
    { id: "PENDING", label: "Pending" },
    { id: "APPROVED", label: "History" },
    { id: "REJECTED", label: "Rejected" },
  ];

  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <div className="content-wrapper">
        <div className="text-center text-md-left">
          <h1 className="display-6 fw-bold text-primary">
            BIOMETRIC APPROVALS
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

        <TabContent activeTab={activeTab}>
          <TabPane tabId="PENDING">
            {fetching ? (
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "400px" }}
              >
                <Spinner color="primary" />
              </div>
            ) : (
              <PendingApprovals
                data={data}
                refetch={fetchRequests}
                pagination={pagination}
                page={page}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={setLimit}
                isMobile={isMobile}
                hasWritePermission={hasWritePermission}
              />
            )}
          </TabPane>
          <TabPane tabId="APPROVED">
            {fetching ? (
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "400px" }}
              >
                <Spinner color="primary" />
              </div>
            ) : (
              <ApprovalHistory
                data={data}
                refetch={fetchRequests}
                pagination={pagination}
                page={page}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={setLimit}
                isMobile={isMobile}
              />
            )}
          </TabPane>
          <TabPane tabId="REJECTED">
            {fetching ? (
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "400px" }}
              >
                <Spinner color="primary" />
              </div>
            ) : (
              <RejectedApprovals
                data={data}
                refetch={fetchRequests}
                pagination={pagination}
                page={page}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={setLimit}
                isMobile={isMobile}
              />
            )}
          </TabPane>
        </TabContent>
      </div>
    </CardBody>
  );
};

export default Biometric;
