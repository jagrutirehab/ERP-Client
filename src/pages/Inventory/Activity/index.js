import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardBody, Row, Col, Spinner } from "reactstrap";
import Select from "react-select";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import CompactDataGrid from "../Components/CompactDataGrid";
import RefreshButton from "../../../Components/Common/RefreshButton";
import DateRangeFilter from "../../../Components/Common/DateRangeFilter";
import { subDays, startOfDay, endOfDay } from "date-fns";
import { getPharmacyActivity } from "../../../helpers/backend_helper";
import { MODULE_OPTIONS, getActivityColumns } from "../Columns/Pharmacy/ActivityColumns";

const PharmacyActivity = () => {
  const handleAuthError = useAuthError();
  const isMobile = useMediaQuery("(max-width: 1000px)");

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission, loading: permissionLoader } = usePermissions(token);
  const hasReadPermission = hasPermission("PHARMACY", "PHARMACY_ACTIVITY", "READ");

  const user = useSelector((state) => state.User);
  const centerList = useSelector((state) => state.Center.data);

  const [selectedCenter, setSelectedCenter] = useState("ALL");
  const [selectedModules, setSelectedModules] = useState([]);
  const [reportDate, setReportDate] = useState({
    start: startOfDay(subDays(new Date(), 6)),
    end: endOfDay(new Date()),
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);

  const centerOptions = useMemo(
    () => [
      ...(user?.centerAccess?.length > 1 ? [{ value: "ALL", label: "All Centers" }] : []),
      ...(centerList
        ?.filter((c) => user?.centerAccess?.includes(c._id))
        ?.map((c) => ({ value: c._id, label: c.title })) || []),
    ],
    [centerList, user?.centerAccess]
  );

  const selectedCenterOption =
    centerOptions.find((opt) => opt.value === selectedCenter) || centerOptions[0];

  const activeCenters =
    selectedCenter === "ALL" ? user?.centerAccess || [] : [selectedCenter];

  const moduleKey = selectedModules.map((m) => m.value).join(",");

  const loadData = async (targetPage = page) => {
    if (!hasReadPermission) return;
    const myRequest = ++requestId.current;
    setLoading(true);
    try {
      const res = await getPharmacyActivity({
        page: targetPage,
        limit,
        centers: activeCenters,
        module: selectedModules.map((m) => m.value),
        from: reportDate.start.toISOString(),
        to: reportDate.end.toISOString(),
      });
      if (myRequest !== requestId.current) return;
      setRows(res?.data || []);
      setTotal(res?.total || 0);
    } catch (error) {
      if (myRequest !== requestId.current) return;
      if (!handleAuthError(error)) {
        toast.error(error?.message || "Failed to load activity");
      }
    } finally {
      if (myRequest === requestId.current) setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCenter !== "ALL" && !user?.centerAccess?.includes(selectedCenter)) {
      setSelectedCenter("ALL");
    }
  }, [user?.centerAccess, selectedCenter]);

  // Changing a filter or page size goes back to page 1.
  useEffect(() => {
    setPage(1);
    loadData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCenter, moduleKey, limit, activeCenters.join(","), reportDate.start.getTime(), reportDate.end.getTime(), hasReadPermission]);

  const isFirstPageRun = useRef(true);
  useEffect(() => {
    if (isFirstPageRun.current) {
      isFirstPageRun.current = false;
      return;
    }
    loadData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const columns = useMemo(() => getActivityColumns(), []);

  if (permissionLoader) {
    return (
      <CardBody
        className="p-3 bg-white d-flex justify-content-center align-items-center"
        style={isMobile ? { width: "100%", minHeight: "60vh" } : { width: "78%", minHeight: "60vh" }}
      >
        <Spinner color="primary" />
      </CardBody>
    );
  }

  if (!hasReadPermission) return <Navigate to="/unauthorized" replace />;

  return (
    <CardBody className="p-3 bg-white" style={isMobile ? { width: "100%" } : { width: "78%" }}>
      <div className="d-flex flex-column h-100">
        <div className="mb-3">
          <h5 className="mb-1 fw-semibold">Activity</h5>
          <p className="text-muted mb-0 fs-13">
            Latest changes made across the pharmacy module
          </p>
        </div>

        <Card className="mb-3 shadow-sm border-0">
          <CardBody className="py-3">
            <Row className="g-2 align-items-center">
              <Col md={4} lg={3}>
                <Select
                  classNamePrefix="react-select"
                  options={centerOptions}
                  value={selectedCenterOption}
                  onChange={(option) => setSelectedCenter(option?.value)}
                  placeholder="All Centers"
                />
              </Col>
              <Col md={5} lg={4}>
                <Select
                  classNamePrefix="react-select"
                  isMulti
                  isClearable
                  options={MODULE_OPTIONS}
                  value={selectedModules}
                  onChange={(options) => setSelectedModules(options || [])}
                  placeholder="All Modules"
                />
              </Col>
              <Col md={6} lg={3}>
                <DateRangeFilter reportDate={reportDate} setReportDate={setReportDate} />
              </Col>
              <Col md={3} lg={2} className="d-flex justify-content-end">
                <RefreshButton onRefresh={() => loadData(page)} loading={loading} />
              </Col>
            </Row>
          </CardBody>
        </Card>

        <Card className="shadow-sm border-0 mb-0">
          <CardBody className="p-0">
            <div className="position-relative">
              <CompactDataGrid
                columns={columns}
                data={rows}
                loading={loading}
                page={page}
                setPage={setPage}
                limit={limit}
                setLimit={setLimit}
                total={total}
                keyField="_id"
                noDataComponent="No activity recorded yet"
                rowsPerPageOptions={[10, 25, 50, 100]}
              />
            </div>
          </CardBody>
        </Card>
      </div>
    </CardBody>
  );
};

export default PharmacyActivity;
