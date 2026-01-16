import { useEffect, useState } from "react";
import {
    Row,
    Col,
    Card,
    CardBody,
    Button,
    Progress,
    Spinner,
    UncontrolledTooltip,
    ModalFooter,
    Modal,
    ModalHeader,
    ModalBody,
} from "reactstrap";
import { RotateCw } from "lucide-react";
import { useAuthError } from "../../../../../Components/Hooks/useAuthError";
import { gettodayMyAttendanceStatus, postEmployeeCheckIn, updateEmployeeCheckOut } from "../../../../../helpers/backend_helper";
import { toast } from "react-toastify";
import { getMonthRange, minutesTo12HourTime, minutesToTime, nowToMinutes } from "../../../../../utils/time";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchAttendanceSummary } from "../../../../../store/features/HRMS/hrmsSlice";
import AttendanceSummaryCard from "../../../components/AttendanceSummaryCard";
import { usePermissions } from "../../../../../Components/Hooks/useRoles";
import CheckPermission from "../../../../../Components/HOC/CheckPermission";

const Dashboard = () => {
    const dispatch = useDispatch();

    const [attendanceStatus, setAttendanceStatus] = useState(null);
    const [statusLoader, setStatusLoader] = useState(false);
    const [locationGranted, setLocationGranted] = useState(false);
    const [coords, setCoords] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [locationLoader, setLocationLoader] = useState(false);
    const [markAttendanceLoader, setMarkAttendanceLoader] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [earlyCheckoutModal, setEarlyCheckoutModal] = useState(false);

    const handleAuthError = useAuthError();

    const { attendanceSummary } = useSelector((state) => state.HRMS);
    const { data: summary, loading: summaryLoader } = attendanceSummary;

    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;

    const { hasPermission, loading: permissionLoader, roles } =
        usePermissions(token);

    const hasUserPermission = hasPermission(
        "HR",
        "MY_ATTENDANCE",
        "READ"
    );

    // employee geolocation permission
    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation not supported by your browser");
            setLocationGranted(false);
            setLocationLoader(false);
            return;
        }

        setLocationLoader(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoords({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
                setLocationGranted(true);
                setLocationLoader(false);
            },
            (error) => {
                setLocationGranted(false);
                setLocationLoader(false);
                setLocationError("Location access is required to check in or out");
                toast.error("Location permission denied. Enable it to mark attendance.");
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
            }
        );
    }, []);

    const fetchTodayAttendanceStatus = async () => {
        setStatusLoader(true);
        try {
            const response = await gettodayMyAttendanceStatus();
            setAttendanceStatus(response.data);
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error?.message || "Failed to fetch today's attendance status.");
            }
        } finally {
            setStatusLoader(false);
        }
    }

    const fetchAttendanceSummaryByMonth = async () => {
        try {
            const { startDate, endDate } = getMonthRange(selectedMonth);
            await dispatch(fetchAttendanceSummary({
                startDate,
                endDate
            })).unwrap();
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error?.message || "something went wrong while fetching attendance summary");
            }
        }
    }

    useEffect(() => {
        if (hasUserPermission) {
            fetchTodayAttendanceStatus();
        }
    }, []);

    useEffect(() => {
        if (hasUserPermission) {
            fetchAttendanceSummaryByMonth();
        }
    }, [selectedMonth]);

    const handleMarkAttendance = async () => {
        if (!locationGranted || !coords) {
            toast.error("Location is required to mark attendance");
            return;
        }

        if (
            attendanceStatus?.canCheckOut &&
            attendanceStatus?.workedTillNow < attendanceStatus?.shift?.duration
        ) {
            setEarlyCheckoutModal(true);
            return;
        }

        await proceedCheckOutOrCheckIn();
    }

    const proceedCheckOutOrCheckIn = async () => {
        setMarkAttendanceLoader(true);
        try {
            const payload = {
                location: {
                    lat: coords.lat,
                    lng: coords.lng,
                    accuracy: coords.accuracy
                }
            }
            if (attendanceStatus?.canCheckIn) {
                await postEmployeeCheckIn({
                    ...payload,
                    checkInTime: nowToMinutes(),
                });
                toast.success("Checked in successfully");
            } else if (attendanceStatus?.canCheckOut) {
                await updateEmployeeCheckOut({
                    ...payload,
                    checkOutTime: nowToMinutes()
                });
                toast.success("Checked out successfully");
            }
            fetchTodayAttendanceStatus();
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error?.message || "Something went wrong while marking attendance");
            }
        } finally {
            setMarkAttendanceLoader(false);
            setEarlyCheckoutModal(false);
        }
    }

    const toggleEarlyCheckoutModal = () =>
        setEarlyCheckoutModal((prev) => !prev);

    const shiftProgress = attendanceStatus?.shift?.duration && attendanceStatus?.workedTillNow != null
        ? Math.min(
            100,
            Math.round(
                (attendanceStatus.workedTillNow / attendanceStatus.shift.duration) * 100
            )
        )
        : 0;

    return (
        <div className="p-3 p-md-2 bg-white" style={{ minHeight: "100vh" }}>
            <div className="container-fluid" style={{ maxWidth: "1400px" }}>
                <div className="mb-4 text-center">
                    <h2 className="fw-bold mb-1 text-primary">ATTENDANCE DASHBORD</h2>
                </div>

                <Row className="g-3 g-md-4">

                    <AttendanceSummaryCard
                        loading={summaryLoader}
                        onRefresh={fetchAttendanceSummaryByMonth}
                        selectedMonth={selectedMonth}
                        setSelectedMonth={setSelectedMonth}
                        data={summary}
                    />

                    <Col lg="4">
                        <Card className="border-0 shadow-sm rounded-3 h-100">
                            <CardBody className="p-4">
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <div className="d-flex align-items-center gap-2">
                                        <h5 className="mb-0 fw-semibold text-dark">
                                            Today’s Status
                                        </h5>
                                        <span
                                            className="rounded-circle"
                                            style={{
                                                width: 8,
                                                height: 8,
                                                backgroundColor: "#10b981",
                                                animation: "pulse 2s infinite",
                                            }}
                                        />
                                    </div>

                                    <Button
                                        id="refresh-status-btn"
                                        color="light"
                                        size="sm"
                                        onClick={fetchTodayAttendanceStatus}
                                        disabled={statusLoader}
                                        className="rounded-circle d-flex align-items-center justify-content-center"
                                        style={{ width: 34, height: 34 }}
                                    >
                                        <RotateCw
                                            size={14}
                                            style={{
                                                animation: statusLoader
                                                    ? "spin 1s linear infinite"
                                                    : "none",
                                            }}
                                        />
                                    </Button>

                                    <UncontrolledTooltip target="refresh-status-btn">
                                        Refresh
                                    </UncontrolledTooltip>
                                </div>

                                <div className="mb-4">
                                    {[
                                        {
                                            label: "Shift Time",
                                            value: statusLoader ? (
                                                <Skeleton width={80} />
                                            ) : (
                                                `${minutesToTime(attendanceStatus?.shift?.duration)} hr`
                                            ),
                                        },
                                        {
                                            label: "Clock In",
                                            value: statusLoader ? (
                                                <Skeleton width={140} />
                                            ) : (
                                                <>
                                                    {attendanceStatus?.firstCheckIn != null
                                                        ? minutesTo12HourTime(attendanceStatus.firstCheckIn)
                                                        : "Pending"}
                                                    {" — "}
                                                    {attendanceStatus?.lastCheckOut != null
                                                        ? minutesTo12HourTime(attendanceStatus.lastCheckOut)
                                                        : "Pending"}
                                                </>
                                            ),
                                        },
                                    ].map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="d-flex justify-content-between align-items-center py-3 border-bottom"
                                        >
                                            <span className="text-muted">{item.label}</span>
                                            <strong>{item.value}</strong>
                                        </div>
                                    ))}

                                    <div className="d-flex justify-content-between align-items-center py-3">
                                        <span className="text-muted">Shift Duration</span>
                                        {statusLoader ? (
                                            <Skeleton width={120} height={28} borderRadius={12} />
                                        ) : (
                                            <span
                                                className="px-3 py-2 rounded-pill"
                                                style={{
                                                    fontSize: "0.8rem",
                                                    fontWeight: 600,
                                                    backgroundColor: "#eff6ff",
                                                    color: "#2563eb",
                                                }}
                                            >
                                                {minutesToTime(attendanceStatus?.workedTillNow)} /{" "}
                                                {minutesToTime(attendanceStatus?.shift?.duration)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <div className="d-flex justify-content-between mb-1">
                                        <small className="text-muted">Progress</small>
                                        <small className="fw-semibold">
                                            {statusLoader ? <Skeleton width={30} /> : `${shiftProgress}%`}
                                        </small>
                                    </div>

                                    {statusLoader ? (
                                        <Skeleton height={8} borderRadius={6} />
                                    ) : (
                                        <Progress
                                            value={shiftProgress}
                                            color="info"
                                            style={{
                                                height: 8,
                                                backgroundColor: "#e5e7eb",
                                            }}
                                        />
                                    )}
                                </div>

                                <CheckPermission
                                    accessRolePermission={roles?.permissions}
                                    subAccess="MY_ATTENDANCE"
                                    permission="create">
                                    <Button
                                        color="primary"
                                        className="w-100 fw-semibold text-white"
                                        onClick={handleMarkAttendance}
                                        disabled={
                                            locationLoader ||
                                            !locationGranted ||
                                            locationError ||
                                            (!attendanceStatus?.canCheckIn &&
                                                !attendanceStatus?.canCheckOut) ||
                                            markAttendanceLoader
                                        }
                                    >
                                        {markAttendanceLoader && (
                                            <Spinner size="sm" className="me-2" />
                                        )}

                                        {locationLoader
                                            ? "Fetching location…"
                                            : !locationGranted
                                                ? "Location Required"
                                                : attendanceStatus?.canCheckIn
                                                    ? "Check In"
                                                    : attendanceStatus?.canCheckOut
                                                        ? "Check Out"
                                                        : "Shift Ended"}
                                    </Button>

                                    <p
                                        className="text-center text-muted mt-3 mb-0"
                                        style={{ fontSize: "0.75rem" }}
                                    >
                                        Your location and time will be recorded
                                    </p>
                                </CheckPermission>
                            </CardBody>
                        </Card>
                    </Col>

                </Row>
            </div>

            <Modal isOpen={earlyCheckoutModal} toggle={toggleEarlyCheckoutModal} centered>
                <ModalHeader toggle={toggleEarlyCheckoutModal}>
                    Short Duration Alert
                </ModalHeader>

                <ModalBody>
                    <p className="mb-2 fw-semibold">
                        You are trying to check out before your shift ends.
                    </p>
                    <p className="text-muted mb-0">
                        Are you sure you want to clock out before the shift time?
                    </p>
                </ModalBody>

                <ModalFooter>
                    <Button color="secondary" onClick={() => setEarlyCheckoutModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        color="primary"
                        className="text-white"
                        onClick={proceedCheckOutOrCheckIn}
                        disabled={markAttendanceLoader}
                    >
                        {markAttendanceLoader && (
                            <Spinner size="sm" className="me-2" />
                        )}
                        Continue
                    </Button>
                </ModalFooter>
            </Modal>


            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .shadow-sm {
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
        }
      `}</style>
        </div>
    );
};

export default Dashboard;