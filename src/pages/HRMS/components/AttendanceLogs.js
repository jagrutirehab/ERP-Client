import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { getCalendarRange, getTableRange } from "../../../utils/time";
import { fetchAttendanceLogs } from "../../../store/features/HRMS/hrmsSlice";
import { toast } from "react-toastify";
import { endOfMonth, startOfMonth } from "date-fns";
import Header from "../../Report/Components/Header";
import { Button, ButtonGroup } from "reactstrap";
import { Calendar, TableProperties } from "lucide-react";
import DataTableComponent from "./Table/DataTable";
import { myAttendanceLogsColumns } from "./Table/Columns/myAttendanceLogs";
import AttendanceCalendar from "./AttendanceCalender";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import { allViewPermissionRoles } from "../../../Components/constants/HRMS";
import RegularizeModal from "../../../Components/Common/RegularizeModal";

const AttendanceLogs = ({ employeeId }) => {
  const dispatch = useDispatch();
  const handleAuthError = useAuthError();
  const [reportDate, setReportDate] = useState(getTableRange());
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [viewMode, setViewMode] = useState("table");
  const [regularizeModalOpen, setRegularizeModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const { data, loading, pagination } = useSelector((state) => state.HRMS);
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { roles, hasPermission } = usePermissions(token);

  const hasUserAllViewPermission =
    Boolean(roles?.name) &&
    allViewPermissionRoles.includes(roles.name) &&
    employeeId;

  const hasRead = hasPermission("HR", "MY_ATTENDANCE", "READ");
  const hasWrite = hasPermission("HR", "MY_ATTENDANCE", "WRITE");
  const hasDelete = hasPermission("HR", "MY_ATTENDANCE", "DELETE");

  const isReadOnly = hasWrite && hasDelete;

  const loadMyAttendanceLogs = async () => {
    try {
      await dispatch(
        fetchAttendanceLogs({
          startDate: reportDate.start,
          endDate: reportDate.end,
          paginated: viewMode === "table",
          ...(viewMode === "table"
            ? {
                page,
                limit,
              }
            : {}),
          ...(employeeId ? { employeeId } : {}),
        }),
      ).unwrap();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error.message || "Failed to fetch attendance logs");
      }
    }
  };

  useEffect(() => {
    loadMyAttendanceLogs();
  }, [page, limit, reportDate.start, reportDate.end, viewMode]);

  useEffect(() => {
    setPage(1);
  }, [reportDate.start, reportDate.end, limit, viewMode]);

  // useEffect(() => {
  //     if (viewMode === "calendar") {
  //         setReportDate(getCalendarRange());
  //     } else {
  //         setReportDate(getTableRange());
  //     }
  // }, [viewMode]);

  const handleCalendarNavigate = (date) => {
    setReportDate({
      start: startOfMonth(date),
      end: endOfMonth(date),
    });
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);

    if (mode === "calendar") {
      setReportDate(getCalendarRange());
    } else {
      setReportDate(getTableRange());
    }

    setPage(1);
  };

  //   console.log("data", data);

  const columns = myAttendanceLogsColumns({
    hasUserAllViewPermission,
    setSelectedRow,
    setRegularizeModalOpen,
    loading,
    hasWrite,
    hasDelete
  });

  const reloadAttendance = () => {
    loadMyAttendanceLogs();
  };

  return (
    <>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div style={{ minWidth: "150px" }}>
          {viewMode === "table" && (
            <Header reportDate={reportDate} setReportDate={setReportDate} />
          )}
        </div>

        <ButtonGroup size="sm" className="rounded-pill border bg-light p-1">
          <Button
            color={viewMode === "table" ? "primary" : "light"}
            onClick={() => handleViewModeChange("table")}
            className={`d-flex align-items-center gap-2 px-3 rounded-pill ${
              viewMode === "table" ? "fw-semibold shadow-sm" : ""
            }`}
          >
            <TableProperties size={15} />
            <span className="d-none d-sm-inline">Table</span>
          </Button>

          <Button
            color={viewMode === "calendar" ? "primary" : "light"}
            onClick={() => handleViewModeChange("calendar")}
            className={`d-flex align-items-center gap-2 px-3 rounded-pill ${
              viewMode === "calendar" ? "fw-semibold shadow-sm" : ""
            }`}
          >
            <Calendar size={15} />
            <span className="d-none d-sm-inline">Calendar</span>
          </Button>
        </ButtonGroup>
      </div>

      {viewMode === "table" ? (
        <DataTableComponent
          key="table"
          columns={columns}
          data={data}
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
          loading={loading}
          pagination={pagination}
        />
      ) : (
        <AttendanceCalendar
          key="calender"
          data={data}
          loading={loading}
          reportDate={reportDate}
          onMonthChange={handleCalendarNavigate}
        />
      )}

      <RegularizeModal
        isOpen={regularizeModalOpen}
        toggle={() => setRegularizeModalOpen(false)}
        row={selectedRow}
        onSuccess={reloadAttendance}
      />
    </>
  );
};

export default AttendanceLogs;
