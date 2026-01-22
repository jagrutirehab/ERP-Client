import { Card, CardBody } from 'reactstrap'
import { useMediaQuery } from '../../../../Components/Hooks/useMediaQuery';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAttendanceSummary } from '../../../../store/features/HRMS/hrmsSlice';
import { useAuthError } from '../../../../Components/Hooks/useAuthError';
import { getMonthRange } from '../../../../utils/time';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import AttendanceSummaryCard from '../../components/AttendanceSummaryCard';
import AttendanceLogs from '../../components/AttendanceLogs';
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const EmployeeAttendance = () => {
    const { employeeId } = useParams();
    const dispatch = useDispatch();

    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const handleAuthError = useAuthError();
    const isMobile = useMediaQuery("(max-width: 1000px)");

    const { attendanceSummary } = useSelector((state) => state.HRMS);
    console.log("attendanceSummary", attendanceSummary)
    const { data: summary, loading: summaryLoader } = attendanceSummary;

    const fetchEmployeeAttendanceSummaryByMonth = async () => {
        try {
            const { startDate, endDate } = getMonthRange(selectedMonth);
            await dispatch(fetchAttendanceSummary({
                startDate,
                endDate,
                employeeId
            })).unwrap();
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error?.message || "something went wrong while fetching attendance summary");
            }
        }
    }

    useEffect(() => {
        fetchEmployeeAttendanceSummaryByMonth();
    }, [selectedMonth]);

    return (
        <CardBody className="p-3 bg-white"
            style={isMobile ? { width: "100%" } : { width: "78%" }}
        >
            <div className="mb-4">
                <div className="d-flex flex-column gap-1">
                    <h2 className="fw-semibold mb-0 text-primary">
                        {summaryLoader ? (
                            <Skeleton
                                width={220}
                                height={28}
                                baseColor="#e5e7eb"
                                highlightColor="#f3f4f6"
                            />
                        ) : (
                            summary?.employee?.name || "—"
                        )}
                    </h2>

                    <div
                        className="d-flex flex-wrap gap-3"
                        style={{ fontSize: "0.85rem" }}
                    >
                        {summaryLoader ? (
                            <>
                                <Skeleton
                                    width={140}
                                    height={16}
                                    baseColor="#e5e7eb"
                                    highlightColor="#f3f4f6"
                                />
                                <Skeleton
                                    width={180}
                                    height={16}
                                    baseColor="#e5e7eb"
                                    highlightColor="#f3f4f6"
                                />
                            </>
                        ) : (
                            <>
                                {summary?.employee?.eCode && (
                                    <span className="text-muted">
                                        <strong className="text-primary">
                                            Employee ID:
                                        </strong>{" "}
                                        {summary.employee.eCode}
                                    </span>
                                )}

                                {summary?.employee?.currentLocation && (
                                    <span className="text-muted">
                                        <strong className="text-primary">
                                            Current Location:
                                        </strong>{" "}
                                        {summary.employee.currentLocation?.title}
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>


            <div>
                <AttendanceSummaryCard
                    loading={summaryLoader}
                    onRefresh={fetchEmployeeAttendanceSummaryByMonth}
                    selectedMonth={selectedMonth}
                    setSelectedMonth={setSelectedMonth}
                    data={summary}
                    fullWidth={true}
                />
                <Card className="border-0 shadow-sm h-100">
                    <CardBody className="p-4">
                        <h5 className="mb-0 fw-semibold text-dark mb-3">Attendance Logs</h5>
                        <AttendanceLogs
                            employeeId={employeeId}
                        />
                    </CardBody>
                </Card>
            </div>
        </CardBody>
    )
}

export default EmployeeAttendance;